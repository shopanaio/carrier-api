/**
 * Main Nova Poshta API client
 * Enterprise-grade client with full TypeScript support
 */

import type { NovaPoshtaClientConfig } from '../config';
import type { HttpTransport } from '../http/transport';
import type { NovaPoshtaValidator } from '../validation/validator';
import { FetchHttpTransport, MockHttpTransport, DEFAULT_TRANSPORT_CONFIG } from '../http/transport';
import {
  LoggingInterceptor,
  ApiKeyInterceptor,
  RequestIdInterceptor,
  ResponseValidationInterceptor,
  ErrorTransformInterceptor,
  UserAgentInterceptor,
} from '../http/interceptors';
import { NovaPoshtaValidator as ValidatorImpl } from '../validation/validator';
import { WaybillService } from '../services/waybillService';
import { TrackingService } from '../services/trackingService';
import { ReferenceService } from '../services/referenceService';
import { AddressService } from '../services/addressService';
import { validateConfig } from '../config';
import { Language } from '../types/enums';

// Client state interface
export interface ClientState {
  readonly initialized: boolean;
  readonly apiKey: string;
  readonly language: Language;
  readonly version: string;
}

// Client metrics interface
export interface ClientMetrics {
  readonly totalRequests: number;
  readonly successfulRequests: number;
  readonly failedRequests: number;
  readonly averageResponseTime: number;
  readonly lastRequestTime?: Date;
}

// Health check result
export interface HealthCheckResult {
  readonly healthy: boolean;
  readonly timestamp: Date;
  readonly responseTime: number;
  readonly details: {
    readonly transport: boolean;
    readonly apiKey: boolean;
    readonly connectivity: boolean;
  };
}

/**
 * Main Nova Poshta API client
 *
 * @example
 * ```typescript
 * import { NovaPoshtaClient, createConfig } from '@novaposhta/client';
 *
 * const config = createConfig('your-api-key')
 *   .language(Language.Ukrainian)
 *   .validation(true)
 *   .caching(true)
 *   .build();
 *
 * const client = new NovaPoshtaClient(config);
 *
 * // Track a document
 * const tracking = await client.tracking.trackDocument('20400048799000');
 *
 * // Create a waybill
 * const waybill = await client.waybill.create({
 *   payerType: PayerType.Sender,
 *   paymentMethod: PaymentMethod.Cash,
 *   // ... other properties
 * });
 *
 * // Get reference data
 * const cargoTypes = await client.reference.getCargoTypes();
 * const pallets = await client.reference.getPalletsList();
 *
 * // Work with addresses
 * const cities = await client.address.getCities({ findByString: 'Kyiv' });
 * const settlements = await client.address.searchSettlements({
 *   cityName: 'kyiv',
 *   page: 1,
 *   limit: 50
 * });
 * ```
 */
export class NovaPoshtaClient {
  private readonly transport: HttpTransport;
  private readonly validator: NovaPoshtaValidator;
  private readonly config: NovaPoshtaClientConfig;
  private readonly metrics: ClientMetrics;

  // Service instances
  public readonly waybill: WaybillService;
  public readonly tracking: TrackingService;
  public readonly reference: ReferenceService;
  public readonly address: AddressService;

  constructor(config: NovaPoshtaClientConfig, transport?: HttpTransport) {
    // Validate configuration
    validateConfig(config);

    this.config = { ...config };
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
    };

    // Initialize validator
    this.validator = new ValidatorImpl({
      strict: config.enableValidation,
      transform: true,
      includeContext: true,
    });

    // Initialize transport
    this.transport = transport || new FetchHttpTransport({
      ...DEFAULT_TRANSPORT_CONFIG,
      ...config.transport,
    });
    this.setupInterceptors();

    // Initialize services
    this.waybill = new WaybillService(this.transport, this.validator, {
      validateRequests: config.enableValidation,
      validateResponses: config.enableValidation,
    });

    this.tracking = new TrackingService(this.transport, this.validator, {
      validateRequests: config.enableValidation,
      validateResponses: config.enableValidation,
      enableCaching: config.enableCaching,
      trackingCacheTtl: config.cacheTtl,
    });

    this.reference = new ReferenceService(this.transport, this.validator, {
      validateRequests: config.enableValidation,
      validateResponses: config.enableValidation,
      enableCaching: config.enableCaching,
      cacheTtl: config.cacheTtl,
    });

    this.address = new AddressService(this.transport, this.validator, {
      validateRequests: config.enableValidation,
      validateResponses: config.enableValidation,
      enableCaching: config.enableCaching,
      cacheTtl: config.cacheTtl,
    });
  }

  /**
   * Setup HTTP interceptors based on configuration
   */
  private setupInterceptors(): void {
    if (!(this.transport instanceof FetchHttpTransport)) {
      return;
    }

    // API key injection (always required)
    this.transport.addRequestInterceptor(
      new ApiKeyInterceptor(this.config.apiKey).request
    );

    // Request ID for tracing
    this.transport.addRequestInterceptor(
      new RequestIdInterceptor().request
    );

    // User agent
    if (this.config.userAgent || this.config.clientInfo) {
      this.transport.addRequestInterceptor(
        new UserAgentInterceptor(this.config.userAgent, this.config.clientInfo).request
      );
    }

    // Logging
    if (this.config.enableLogging) {
      const logger = new LoggingInterceptor();
      this.transport.addRequestInterceptor(logger.request);
      this.transport.addResponseInterceptor(logger.response);
      this.transport.addErrorInterceptor(logger.error);
    }

    // Response validation
    if (this.config.enableValidation) {
      this.transport.addResponseInterceptor(
        new ResponseValidationInterceptor().response
      );
    }

    // Error transformation
    this.transport.addErrorInterceptor(
      new ErrorTransformInterceptor().error
    );
  }

  /**
   * Get client state information
   */
  getState(): ClientState {
    return {
      initialized: true,
      apiKey: this.config.apiKey.substring(0, 8) + '...',
      language: this.config.language,
      version: '1.0.0',
    };
  }

  /**
   * Get client metrics
   */
  getMetrics(): ClientMetrics {
    return { ...this.metrics };
  }

  /**
   * Get client configuration (without sensitive data)
   */
  getConfig(): Omit<NovaPoshtaClientConfig, 'apiKey'> {
    const { apiKey, ...safeConfig } = this.config;
    return safeConfig;
  }

  /**
   * Perform health check
   */
  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    const details = {
      transport: false,
      apiKey: false,
      connectivity: false,
    };

    try {
      // Check transport
      if (this.transport instanceof FetchHttpTransport) {
        details.transport = await this.transport.healthCheck();
      } else {
        details.transport = true; // Assume mock transport is healthy
      }

      // Check API key by making a simple request
      try {
        const testResponse = await this.tracking.trackDocument('test');
        details.apiKey = true;
        details.connectivity = true;
      } catch (error) {
        // If it's an authentication error, API key is invalid
        // If it's a not found error, API key is valid but document doesn't exist
        const errorMessage = error instanceof Error ? error.message : '';
        details.apiKey = !errorMessage.includes('authentication') && !errorMessage.includes('API key');
        details.connectivity = !errorMessage.includes('network') && !errorMessage.includes('timeout');
      }

      const healthy = details.transport && details.apiKey && details.connectivity;
      const responseTime = Date.now() - startTime;

      return {
        healthy,
        timestamp: new Date(),
        responseTime,
        details,
      };

    } catch (error) {
      return {
        healthy: false,
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
        details,
      };
    }
  }

  /**
   * Update client configuration (limited properties)
   */
  updateConfig(updates: {
    language?: Language;
    enableValidation?: boolean;
    enableCaching?: boolean;
    enableLogging?: boolean;
  }): void {
    Object.assign(this.config, updates);

    // Update service configurations
    if (updates.enableValidation !== undefined) {
      this.waybill.updateConfig({
        validateRequests: updates.enableValidation,
        validateResponses: updates.enableValidation,
      });

      this.tracking.updateConfig({
        validateRequests: updates.enableValidation,
        validateResponses: updates.enableValidation,
      });
    }

    if (updates.enableCaching !== undefined) {
      this.tracking.updateConfig({
        enableCaching: updates.enableCaching,
      });

      this.reference.updateConfig({
        enableCaching: updates.enableCaching,
      });

      this.address.updateConfig({
        enableCaching: updates.enableCaching,
      });
    }
  }

  /**
   * Create a new client instance with different configuration
   */
  withConfig(configUpdates: Partial<NovaPoshtaClientConfig>): NovaPoshtaClient {
    const newConfig = { ...this.config, ...configUpdates };
    return new NovaPoshtaClient(newConfig);
  }

  /**
   * Create a test client with mock transport
   */
  static createTestClient(config: NovaPoshtaClientConfig): NovaPoshtaClient {
    const mockTransport = new MockHttpTransport();
    return new NovaPoshtaClient(config, mockTransport);
  }

  /**
   * Get version information
   */
  static getVersion(): string {
    return '1.0.0';
  }

  /**
   * Get supported API version
   */
  static getSupportedApiVersion(): string {
    return '2.0';
  }

  /**
   * Dispose of client resources
   */
  dispose(): void {
    // Clean up any resources, timers, etc.
    // This is a placeholder for future cleanup logic
  }
}
