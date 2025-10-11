/**
 * Main Nova Poshta API client (thin REST client)
 */

import type { NovaPoshtaClientConfig } from '../config';
import type { HttpTransport } from '../http/transport';
import { WaybillService } from '../services/waybillService';
import { TrackingService } from '../services/trackingService';
import { ReferenceService } from '../services/referenceService';
import { AddressService } from '../services/addressService';
import { validateConfig } from '../config';

//

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
  private readonly config: NovaPoshtaClientConfig;

  // Service instances
  public readonly waybill: WaybillService;
  public readonly tracking: TrackingService;
  public readonly reference: ReferenceService;
  public readonly address: AddressService;

  constructor(config: NovaPoshtaClientConfig, transport: HttpTransport) {
    // Validate configuration
    validateConfig(config);

    this.config = { ...config };

    //

    // Initialize injected transport
    this.transport = transport;

    // Initialize services
    this.waybill = new WaybillService(this.transport, {});

    this.tracking = new TrackingService(this.transport, {});

    this.reference = new ReferenceService(this.transport, {});

    this.address = new AddressService(this.transport, {});
  }
  // Simplified configuration update
  updateConfig(updates: Partial<NovaPoshtaClientConfig>): void {
    Object.assign(this.config, updates);

    //
  }

  /**
   * Create a new client instance with different configuration
   */
  withConfig(configUpdates: Partial<NovaPoshtaClientConfig>): NovaPoshtaClient {
    const newConfig = { ...this.config, ...configUpdates };
    return new NovaPoshtaClient(newConfig, this.transport);
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
    //
  }
}
