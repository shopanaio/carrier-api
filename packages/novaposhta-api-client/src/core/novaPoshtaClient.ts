/**
 * Main Nova Poshta API client (thin REST client)
 */

import type { NovaPoshtaClientConfig } from '../config';
import type { HttpTransport } from '../http/transport';
import type { NovaPoshtaValidator } from '../validation/validator';
import { FetchHttpTransport, MockHttpTransport, DEFAULT_TRANSPORT_CONFIG } from '../http/transport';
import { NovaPoshtaValidator as ValidatorImpl } from '../validation/validator';
import { WaybillService } from '../services/waybillService';
import { TrackingService } from '../services/trackingService';
import { ReferenceService } from '../services/referenceService';
import { AddressService } from '../services/addressService';
import { validateConfig } from '../config';

// Note: Legacy state/metrics/health-check removed for simplification

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

  // Service instances
  public readonly waybill: WaybillService;
  public readonly tracking: TrackingService;
  public readonly reference: ReferenceService;
  public readonly address: AddressService;

  constructor(config: NovaPoshtaClientConfig, transport?: HttpTransport) {
    // Validate configuration
    validateConfig(config);

    this.config = { ...config };

    // Initialize validator
    this.validator = new ValidatorImpl({
      strict: config.enableValidation,
      transform: true,
      includeContext: true,
    });

    // Initialize transport
    this.transport = transport || new FetchHttpTransport(
      this.config.apiKey,
      {
        ...DEFAULT_TRANSPORT_CONFIG,
        ...config.transport,
      }
    );

    // Initialize services
    this.waybill = new WaybillService(this.transport, this.validator, {
      validateRequests: config.enableValidation,
      validateResponses: config.enableValidation,
    });

    this.tracking = new TrackingService(this.transport, this.validator, {
      validateRequests: config.enableValidation,
      validateResponses: config.enableValidation,
    });

    this.reference = new ReferenceService(this.transport, this.validator, {
      validateRequests: config.enableValidation,
      validateResponses: config.enableValidation,
    });

    this.address = new AddressService(this.transport, this.validator, {
      validateRequests: config.enableValidation,
      validateResponses: config.enableValidation,
    });
  }
  // Simplified configuration update
  updateConfig(updates: Partial<NovaPoshtaClientConfig>): void {
    Object.assign(this.config, updates);

    if (updates.enableValidation !== undefined) {
      this.waybill.updateConfig({
        validateRequests: updates.enableValidation,
        validateResponses: updates.enableValidation,
      });

      this.tracking.updateConfig({
        validateRequests: updates.enableValidation,
        validateResponses: updates.enableValidation,
      });

      this.reference.updateConfig({
        validateRequests: updates.enableValidation,
        validateResponses: updates.enableValidation,
      });

      this.address.updateConfig({
        validateRequests: updates.enableValidation,
        validateResponses: updates.enableValidation,
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
