/**
 * HTTP interceptors for request/response processing
 */

import type { NovaPoshtaRequest, NovaPoshtaResponse } from '../types/base';
import type { NovaPoshtaError } from '../types/errors';
import type { RequestInterceptor, ResponseInterceptor, ErrorInterceptor } from './transport';

// Logging interceptor
export class LoggingInterceptor {
  constructor(private readonly logger: Console = console) {}

  request: RequestInterceptor = (request) => {
    this.logger.log(`[Nova Poshta] Request: ${request.modelName}.${request.calledMethod}`, {
      timestamp: new Date().toISOString(),
      request: {
        model: request.modelName,
        method: request.calledMethod,
        properties: request.methodProperties,
      },
    });
    return request;
  };

  response: ResponseInterceptor = <T>(response: NovaPoshtaResponse<T>) => {
    const level = response.success ? 'log' : 'error';
    this.logger[level](`[Nova Poshta] Response:`, {
      timestamp: new Date().toISOString(),
      success: response.success,
      dataCount: Array.isArray(response.data) ? response.data.length : response.data ? 1 : 0,
      errors: response.errors,
      warnings: response.warnings,
    });
    return response;
  };

  error: ErrorInterceptor = (error) => {
    this.logger.error(`[Nova Poshta] Error:`, {
      timestamp: new Date().toISOString(),
      code: error.code,
      message: error.message,
      category: error.category,
      severity: error.severity,
      context: error.context,
    });
    return error;
  };
}

// API key injection interceptor
export class ApiKeyInterceptor {
  constructor(private readonly apiKey: string) {}

  request: RequestInterceptor = (request) => {
    return {
      ...request,
      apiKey: this.apiKey,
    };
  };
}

// Request ID interceptor for tracing
export class RequestIdInterceptor {
  request: RequestInterceptor = (request) => {
    const requestId = this.generateRequestId();
    return {
      ...request,
      methodProperties: {
        ...request.methodProperties,
        requestId,
      },
    };
  };

  private generateRequestId(): string {
    return `np_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Response validation interceptor
export class ResponseValidationInterceptor {
  response: ResponseInterceptor = <T>(response: NovaPoshtaResponse<T>) => {
    // Validate response structure
    if (typeof response !== 'object' || response === null) {
      throw new Error('Invalid response format: not an object');
    }

    if (typeof response.success !== 'boolean') {
      throw new Error('Invalid response format: missing or invalid success field');
    }

    if (!Array.isArray(response.errors)) {
      throw new Error('Invalid response format: errors must be an array');
    }

    if (!Array.isArray(response.warnings)) {
      throw new Error('Invalid response format: warnings must be an array');
    }

    // Check for API errors
    if (!response.success && response.errors.length > 0) {
      throw new Error(`API Error: ${response.errors.join(', ')}`);
    }

    return response;
  };
}

// Metrics collection interceptor
export interface MetricsCollector {
  recordRequest(modelName: string, method: string): void;
  recordResponse(modelName: string, method: string, duration: number, success: boolean): void;
  recordError(modelName: string, method: string, error: NovaPoshtaError): void;
}

export class MetricsInterceptor {
  private requestStartTimes = new Map<string, number>();

  constructor(private readonly collector: MetricsCollector) {}

  request: RequestInterceptor = (request) => {
    const key = this.getRequestKey(request);
    this.requestStartTimes.set(key, Date.now());
    this.collector.recordRequest(request.modelName, request.calledMethod);
    return request;
  };

  response: ResponseInterceptor = <T>(response: NovaPoshtaResponse<T>) => {
    // Note: We can't easily get the original request here, so we'll need to store it
    // This is a simplified implementation
    return response;
  };

  error: ErrorInterceptor = (error) => {
    if (error.context?.request) {
      const { modelName, calledMethod } = error.context.request as { modelName: string; calledMethod: string };
      this.collector.recordError(modelName, calledMethod, error);
    }
    return error;
  };

  private getRequestKey(request: NovaPoshtaRequest): string {
    return `${request.modelName}.${request.calledMethod}.${Date.now()}`;
  }
}

// Caching interceptor for reference data
export interface CacheStorage {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export class CachingInterceptor {
  // Methods that should be cached (reference data)
  private readonly cacheableMethods = new Set([
    // Reference methods
    'CommonGeneral.getCargoTypes',
    'CommonGeneral.getServiceTypes',
    'CommonGeneral.getOwnershipFormsList',
    'CommonGeneral.getPalletsList',
    'CommonGeneral.getPackList',
    'CommonGeneral.getTiresWheelsList',
    'CommonGeneral.getCargoDescriptionList',
    'CommonGeneral.getMessageCodeText',
    'CommonGeneral.getBackwardDeliveryCargoTypes',
    'CommonGeneral.getTypesOfPayersForRedelivery',
    'CommonGeneral.getTimeIntervals',
    'CommonGeneral.getPickupTimeIntervals',

    // Address methods
    'AddressGeneral.getCities',
    'AddressGeneral.getAreas',
    'AddressGeneral.getWarehouses',
    'AddressGeneral.getSettlementAreas',
    'AddressGeneral.getSettlementCountryRegion',
    'AddressGeneral.getStreet',
    'AddressGeneral.searchSettlements',
    'AddressGeneral.searchSettlementStreets',
  ]);

  constructor(
    private readonly cache: CacheStorage,
    private readonly defaultTtl: number = 3600000, // 1 hour
  ) {}

  request: RequestInterceptor = async (request) => {
    const cacheKey = this.getCacheKey(request);

    if (this.isCacheable(request)) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        // Return cached response by throwing a special error that contains the response
        throw new CacheHitError(cached);
      }
    }

    return request;
  };

  response: ResponseInterceptor = async <T>(response: NovaPoshtaResponse<T>) => {
    // We would need the original request to cache the response
    // This is a simplified implementation
    return response;
  };

  private getCacheKey(request: NovaPoshtaRequest): string {
    const propertiesHash = this.hashObject(request.methodProperties);
    return `${request.modelName}.${request.calledMethod}.${propertiesHash}`;
  }

  private isCacheable(request: NovaPoshtaRequest): boolean {
    const methodKey = `${request.modelName}.${request.calledMethod}`;
    return this.cacheableMethods.has(methodKey);
  }

  private hashObject(obj: Record<string, unknown>): string {
    const str = JSON.stringify(obj, Object.keys(obj).sort());
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }
}

// Special error for cache hits
class CacheHitError extends Error {
  constructor(public readonly cachedResponse: unknown) {
    super('Cache hit');
    this.name = 'CacheHitError';
  }
}

// Rate limiting interceptor
export class RateLimitingInterceptor {
  private lastRequestTime = 0;

  constructor(private readonly minInterval: number = 100) {} // 100ms between requests

  request: RequestInterceptor = async (request) => {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
    return request;
  };
}

// User agent interceptor
export class UserAgentInterceptor {
  constructor(
    private readonly userAgent: string = '@novaposhta/client/1.0.0',
    private readonly clientInfo?: { name: string; version: string },
  ) {}

  request: RequestInterceptor = (request) => {
    let userAgent = this.userAgent;
    if (this.clientInfo) {
      userAgent += ` (${this.clientInfo.name}/${this.clientInfo.version})`;
    }

    return {
      ...request,
      methodProperties: {
        ...request.methodProperties,
        userAgent,
      },
    };
  };
}

// Request timeout interceptor
export class TimeoutInterceptor {
  constructor(private readonly timeout: number = 30000) {}

  request: RequestInterceptor = (request) => {
    return {
      ...request,
      methodProperties: {
        ...request.methodProperties,
        timeout: this.timeout,
      },
    };
  };
}

// Error transformation interceptor
export class ErrorTransformInterceptor {
  error: ErrorInterceptor = (error) => {
    // Transform specific error codes to more user-friendly messages
    if (error.code === '20000200069') { // ApiKeyEmpty
      return {
        ...error,
        message: 'API key is required. Please provide a valid Nova Poshta API key.',
        messageUa: 'API key is required. Please provide a valid Nova Poshta API key.',
        messageRu: 'API key is required. Please provide a valid Nova Poshta API key.',
      };
    }

    if (error.code === '20000200068') { // ApiAuthFail
      return {
        ...error,
        message: 'API authentication failed. Please check your API key.',
        messageUa: 'API authentication failed. Please check your API key.',
        messageRu: 'API authentication failed. Please check your API key.',
      };
    }

    return error;
  };
}

// Retry policy interceptor
export class RetryPolicyInterceptor {
  error: ErrorInterceptor = (error) => {
    // Mark certain errors as retryable
    if (error.code === '20000100016') { // ServiceUnavailable
      return {
        ...error,
        retryable: true,
      };
    }

    if (error.category === 'network') {
      return {
        ...error,
        retryable: true,
      };
    }

    return error;
  };
}
