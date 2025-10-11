/**
 * HTTP transport layer with retry logic, rate limiting, and error handling
 */

import type { NovaPoshtaRequest, NovaPoshtaResponse } from '../types/base';
import type { NovaPoshtaError, NetworkError } from '../types/errors';
import { ErrorCategory, ErrorSeverity } from '../types/errors';

// HTTP transport interface for dependency injection
export interface HttpTransport {
  request<T = unknown>(request: NovaPoshtaRequest): Promise<NovaPoshtaResponse<T>>;
}

// Transport configuration
export interface TransportConfig {
  /** Base URL for Nova Poshta API */
  readonly baseUrl: string;
  /** Request timeout in milliseconds */
  readonly timeout: number;
  /** Maximum number of retry attempts */
  readonly maxRetries: number;
  /** Initial retry delay in milliseconds */
  readonly retryDelay: number;
  /** Maximum retry delay in milliseconds */
  readonly maxRetryDelay: number;
  /** Exponential backoff multiplier */
  readonly backoffMultiplier: number;
  /** Rate limiting: requests per second */
  readonly rateLimit: number;
  /** Custom headers */
  readonly headers: Record<string, string>;
  /** Enable request/response logging */
  readonly enableLogging: boolean;
}

// Default transport configuration
export const DEFAULT_TRANSPORT_CONFIG: TransportConfig = {
  baseUrl: 'https://api.novaposhta.ua/v2.0/json/',
  timeout: 30000, // 30 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  maxRetryDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  rateLimit: 10, // 10 requests per second
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  enableLogging: false,
};

// Request interceptor interface
export interface RequestInterceptor {
  (request: NovaPoshtaRequest): Promise<NovaPoshtaRequest> | NovaPoshtaRequest;
}

// Response interceptor interface
export interface ResponseInterceptor {
  <T>(response: NovaPoshtaResponse<T>): Promise<NovaPoshtaResponse<T>> | NovaPoshtaResponse<T>;
}

// Error interceptor interface
export interface ErrorInterceptor {
  (error: NovaPoshtaError): Promise<NovaPoshtaError> | NovaPoshtaError | never;
}

// Rate limiter implementation
class RateLimiter {
  private requests: number[] = [];
  
  constructor(private readonly limit: number) {}
  
  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    const oneSecondAgo = now - 1000;
    
    // Remove requests older than 1 second
    this.requests = this.requests.filter(time => time > oneSecondAgo);
    
    if (this.requests.length >= this.limit) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = oldestRequest + 1000 - now;
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    this.requests.push(now);
  }
}

// Circuit breaker states
enum CircuitBreakerState {
  Closed = 'closed',
  Open = 'open', 
  HalfOpen = 'half-open',
}

// Circuit breaker implementation
class CircuitBreaker {
  private state = CircuitBreakerState.Closed;
  private failureCount = 0;
  private lastFailureTime = 0;
  private successCount = 0;
  
  constructor(
    private readonly failureThreshold: number = 5,
    private readonly recoveryTimeout: number = 60000, // 1 minute
    private readonly successThreshold: number = 3,
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.Open) {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = CircuitBreakerState.HalfOpen;
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is open');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.failureCount = 0;
    
    if (this.state === CircuitBreakerState.HalfOpen) {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = CircuitBreakerState.Closed;
      }
    }
  }
  
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitBreakerState.Open;
    }
  }
  
  getState(): CircuitBreakerState {
    return this.state;
  }
}

// Fetch-based HTTP transport implementation
export class FetchHttpTransport implements HttpTransport {
  private readonly rateLimiter: RateLimiter;
  private readonly circuitBreaker: CircuitBreaker;
  private readonly requestInterceptors: RequestInterceptor[] = [];
  private readonly responseInterceptors: ResponseInterceptor[] = [];
  private readonly errorInterceptors: ErrorInterceptor[] = [];
  
  constructor(private readonly config: TransportConfig = DEFAULT_TRANSPORT_CONFIG) {
    this.rateLimiter = new RateLimiter(config.rateLimit);
    this.circuitBreaker = new CircuitBreaker();
  }
  
  // Add interceptors
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }
  
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }
  
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }
  
  async request<T = unknown>(request: NovaPoshtaRequest): Promise<NovaPoshtaResponse<T>> {
    return this.circuitBreaker.execute(async () => {
      await this.rateLimiter.waitIfNeeded();
      
      // Apply request interceptors
      let processedRequest = request;
      for (const interceptor of this.requestInterceptors) {
        processedRequest = await interceptor(processedRequest);
      }
      
      return this.executeWithRetry<T>(processedRequest);
    });
  }
  
  private async executeWithRetry<T>(
    request: NovaPoshtaRequest,
    attempt: number = 1,
  ): Promise<NovaPoshtaResponse<T>> {
    try {
      const response = await this.executeRequest<T>(request);
      
      // Apply response interceptors
      let processedResponse = response;
      for (const interceptor of this.responseInterceptors) {
        processedResponse = await interceptor(processedResponse);
      }
      
      return processedResponse;
    } catch (error) {
      const novaPoshtaError = this.createNovaPoshtaError(error, request);
      
      // Apply error interceptors
      let processedError = novaPoshtaError;
      for (const interceptor of this.errorInterceptors) {
        try {
          processedError = await interceptor(processedError);
        } catch (interceptorError) {
          // If interceptor throws, use the new error
          if (interceptorError instanceof Error) {
            throw interceptorError;
          }
        }
      }
      
      // Retry logic
      if (this.shouldRetry(processedError, attempt)) {
        const delay = this.calculateRetryDelay(attempt);
        await this.sleep(delay);
        return this.executeWithRetry<T>(request, attempt + 1);
      }
      
      throw processedError;
    }
  }
  
  private async executeRequest<T>(request: NovaPoshtaRequest): Promise<NovaPoshtaResponse<T>> {
    if (this.config.enableLogging) {
      console.log('Nova Poshta Request:', JSON.stringify(request, null, 2));
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
    
    try {
      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: this.config.headers,
        body: JSON.stringify(request),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json() as NovaPoshtaResponse<T>;
      
      if (this.config.enableLogging) {
        console.log('Nova Poshta Response:', JSON.stringify(data, null, 2));
      }
      
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
  
  private createNovaPoshtaError(error: unknown, request: NovaPoshtaRequest): NovaPoshtaError {
    const baseError: NovaPoshtaError = {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      category: ErrorCategory.Unknown,
      severity: ErrorSeverity.Medium,
      timestamp: new Date(),
      retryable: false,
      context: {
        request: {
          modelName: request.modelName,
          calledMethod: request.calledMethod,
        },
      },
    };
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          ...baseError,
          code: 'REQUEST_TIMEOUT',
          message: 'Request timed out',
          category: ErrorCategory.Network,
          severity: ErrorSeverity.Medium,
          retryable: true,
        } as NetworkError;
      }
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return {
          ...baseError,
          code: 'NETWORK_ERROR',
          message: 'Network error occurred',
          category: ErrorCategory.Network,
          severity: ErrorSeverity.High,
          retryable: true,
        } as NetworkError;
      }
      
      if (error.message.startsWith('HTTP')) {
        const statusMatch = error.message.match(/HTTP (\d+):/);
        const statusCode = statusMatch ? parseInt(statusMatch[1], 10) : 0;
        
        return {
          ...baseError,
          code: 'HTTP_ERROR',
          message: error.message,
          category: ErrorCategory.Network,
          severity: statusCode >= 500 ? ErrorSeverity.High : ErrorSeverity.Medium,
          retryable: statusCode >= 500 || statusCode === 429,
          statusCode,
          url: this.config.baseUrl,
          method: 'POST',
        } as NetworkError;
      }
      
      return {
        ...baseError,
        message: error.message,
      };
    }
    
    return baseError;
  }
  
  private shouldRetry(error: NovaPoshtaError, attempt: number): boolean {
    if (attempt >= this.config.maxRetries) {
      return false;
    }
    
    return error.retryable || error.category === ErrorCategory.Network;
  }
  
  private calculateRetryDelay(attempt: number): number {
    const delay = this.config.retryDelay * Math.pow(this.config.backoffMultiplier, attempt - 1);
    return Math.min(delay, this.config.maxRetryDelay);
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(this.config.baseUrl, {
        method: 'OPTIONS',
        headers: this.config.headers,
      });
      return response.ok;
    } catch {
      return false;
    }
  }
  
  // Get circuit breaker state
  getCircuitBreakerState(): string {
    return this.circuitBreaker.getState();
  }
}

// Mock transport for testing
export class MockHttpTransport implements HttpTransport {
  private responses: Map<string, NovaPoshtaResponse<unknown>> = new Map();
  private delays: Map<string, number> = new Map();
  private errors: Map<string, Error> = new Map();
  
  async request<T = unknown>(request: NovaPoshtaRequest): Promise<NovaPoshtaResponse<T>> {
    const key = `${request.modelName}.${request.calledMethod}`;
    
    // Simulate delay
    const delay = this.delays.get(key) || 0;
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    // Simulate error
    const error = this.errors.get(key);
    if (error) {
      throw error;
    }
    
    // Return mocked response
    const response = this.responses.get(key);
    if (response) {
      return response as NovaPoshtaResponse<T>;
    }
    
    // Default success response
    return {
      success: true,
      data: [] as unknown as T,
      errors: [],
      warnings: [],
      info: [],
      messageCodes: [],
      errorCodes: [],
      warningCodes: [],
      infoCodes: [],
    };
  }
  
  // Mock configuration methods
  mockResponse<T>(modelName: string, method: string, response: NovaPoshtaResponse<T>): void {
    this.responses.set(`${modelName}.${method}`, response);
  }
  
  mockDelay(modelName: string, method: string, delay: number): void {
    this.delays.set(`${modelName}.${method}`, delay);
  }
  
  mockError(modelName: string, method: string, error: Error): void {
    this.errors.set(`${modelName}.${method}`, error);
  }
  
  clearMocks(): void {
    this.responses.clear();
    this.delays.clear();
    this.errors.clear();
  }
}