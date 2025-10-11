/**
 * Reference service for Nova Poshta API
 * Handles all reference data operations
 */

import type { HttpTransport } from '../http/transport';
import type { ServicePlugin, ClientContext } from '../core/client';
import { toHttpTransport } from '../core/client';
import type {
  GetCargoTypesRequest,
  GetCargoTypesResponse,
  GetPalletsListRequest,
  GetPalletsListResponse,
  GetPackListRequest,
  GetPackListResponse,
  GetTiresWheelsListRequest,
  GetTiresWheelsListResponse,
  GetCargoDescriptionListRequest,
  GetCargoDescriptionListResponse,
  GetMessageCodeTextRequest,
  GetMessageCodeTextResponse,
  GetServiceTypesRequest,
  GetServiceTypesResponse,
  GetOwnershipFormsListRequest,
  GetOwnershipFormsListResponse,
  GetTimeIntervalsRequest,
  GetTimeIntervalsResponse,
  GetPickupTimeIntervalsRequest,
  GetPickupTimeIntervalsResponse,
  GetBackwardDeliveryCargoTypesRequest,
  GetBackwardDeliveryCargoTypesResponse,
  GetTypesOfPayersForRedeliveryRequest,
  GetTypesOfPayersForRedeliveryResponse,
} from '../types/reference';
import type { NovaPoshtaRequest } from '../types/base';
import { NovaPoshtaModel, NovaPoshtaMethod } from '../types/enums';
//

// Reference service configuration
export interface ReferenceServiceConfig {
  /** Default timeout for reference operations */
  readonly timeout?: number;
}

// Default configuration
export const DEFAULT_REFERENCE_CONFIG: ReferenceServiceConfig = {};

// Cache entry interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Service for managing reference data
 *
 * @example
 * ```typescript
 * // Get cargo types
 * const cargoTypes = await referenceService.getCargoTypes();
 *
 * // Get pallets list
 * const pallets = await referenceService.getPalletsList();
 *
 * // Get pack list with filters
 * const packs = await referenceService.getPackList({
 *   length: 100,
 *   width: 50,
 *   height: 30
 * });
 * ```
 */
export class ReferenceService {
  constructor(
    private readonly transport: HttpTransport,
    private readonly config: ReferenceServiceConfig = DEFAULT_REFERENCE_CONFIG,
  ) {}

  /**
   * Get cargo types
   * @description Retrieves list of available cargo types
   * @cacheable 24 hours
   */
  async getCargoTypes(request: GetCargoTypesRequest = {}): Promise<GetCargoTypesResponse> {
    const apiRequest: NovaPoshtaRequest = {
      apiKey: '', // Will be injected by interceptor
      modelName: NovaPoshtaModel.Common,
      calledMethod: NovaPoshtaMethod.GetCargoTypes,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<GetCargoTypesResponse['data']>(apiRequest);
  }

  /**
   * Get pallets list
   * @description Retrieves list of available pallets
   * @cacheable 24 hours
   */
  async getPalletsList(request: GetPalletsListRequest = {}): Promise<GetPalletsListResponse> {
    const apiRequest: NovaPoshtaRequest = {
      apiKey: '',
      modelName: NovaPoshtaModel.Common,
      calledMethod: NovaPoshtaMethod.GetPalletsList,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<GetPalletsListResponse['data']>(apiRequest);
  }

  /**
   * Get pack list
   * @description Retrieves list of available packaging types
   * @cacheable 24 hours
   */
  async getPackList(request: GetPackListRequest = {}): Promise<GetPackListResponse> {
    const apiRequest: NovaPoshtaRequest = {
      apiKey: '',
      modelName: NovaPoshtaModel.Common,
      calledMethod: NovaPoshtaMethod.GetPackList,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<GetPackListResponse['data']>(apiRequest);
  }

  /**
   * Get tires and wheels list
   * @description Retrieves list of available tires and wheels types
   * @cacheable 24 hours
   */
  async getTiresWheelsList(request: GetTiresWheelsListRequest = {}): Promise<GetTiresWheelsListResponse> {
    const apiRequest: NovaPoshtaRequest = {
      apiKey: '',
      modelName: NovaPoshtaModel.Common,
      calledMethod: NovaPoshtaMethod.GetTiresWheelsList,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<GetTiresWheelsListResponse['data']>(apiRequest);
  }

  /**
   * Get cargo description list
   * @description Retrieves list of cargo descriptions with optional search
   * @cacheable 24 hours
   */
  async getCargoDescriptionList(
    request: GetCargoDescriptionListRequest = {},
  ): Promise<GetCargoDescriptionListResponse> {
    const apiRequest: NovaPoshtaRequest = {
      apiKey: '',
      modelName: NovaPoshtaModel.Common,
      calledMethod: NovaPoshtaMethod.GetCargoDescriptionList,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<GetCargoDescriptionListResponse['data']>(apiRequest);
  }

  /**
   * Get message code text
   * @description Retrieves list of error codes and their descriptions
   * @cacheable 24 hours
   */
  async getMessageCodeText(request: GetMessageCodeTextRequest = {}): Promise<GetMessageCodeTextResponse> {
    const apiRequest: NovaPoshtaRequest = {
      apiKey: '',
      modelName: NovaPoshtaModel.Common,
      calledMethod: NovaPoshtaMethod.GetMessageCodeText,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<GetMessageCodeTextResponse['data']>(apiRequest);
  }

  /**
   * Get service types
   * @description Retrieves list of delivery service types
   * @cacheable 24 hours
   */
  async getServiceTypes(request: GetServiceTypesRequest = {}): Promise<GetServiceTypesResponse> {
    const apiRequest: NovaPoshtaRequest = {
      apiKey: '',
      modelName: NovaPoshtaModel.Common,
      calledMethod: NovaPoshtaMethod.GetServiceTypes,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<GetServiceTypesResponse['data']>(apiRequest);
  }

  /**
   * Get ownership forms list
   * @description Retrieves list of ownership forms
   * @cacheable 24 hours
   */
  async getOwnershipFormsList(request: GetOwnershipFormsListRequest = {}): Promise<GetOwnershipFormsListResponse> {
    const apiRequest: NovaPoshtaRequest = {
      apiKey: '',
      modelName: NovaPoshtaModel.Common,
      calledMethod: NovaPoshtaMethod.GetOwnershipFormsList,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<GetOwnershipFormsListResponse['data']>(apiRequest);
  }

  /**
   * Get time intervals
   * @description Retrieves available time intervals for delivery
   * @cacheable 1 hour
   */
  async getTimeIntervals(request: GetTimeIntervalsRequest): Promise<GetTimeIntervalsResponse> {
    // Validation removed

    const apiRequest: NovaPoshtaRequest = {
      apiKey: '',
      modelName: NovaPoshtaModel.Common,
      calledMethod: NovaPoshtaMethod.GetTimeIntervals,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<GetTimeIntervalsResponse['data']>(apiRequest);
  }

  /**
   * Get pickup time intervals
   * @description Retrieves available time intervals for pickup
   * @cacheable 1 hour
   */
  async getPickupTimeIntervals(request: GetPickupTimeIntervalsRequest): Promise<GetPickupTimeIntervalsResponse> {
    // Validation removed

    const apiRequest: NovaPoshtaRequest = {
      apiKey: '',
      modelName: NovaPoshtaModel.Common,
      calledMethod: NovaPoshtaMethod.GetPickupTimeIntervals,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<GetPickupTimeIntervalsResponse['data']>(apiRequest);
  }

  /**
   * Get backward delivery cargo types
   * @description Retrieves list of backward delivery cargo types
   * @cacheable 24 hours
   */
  async getBackwardDeliveryCargoTypes(
    request: GetBackwardDeliveryCargoTypesRequest = {},
  ): Promise<GetBackwardDeliveryCargoTypesResponse> {
    const apiRequest: NovaPoshtaRequest = {
      apiKey: '',
      modelName: NovaPoshtaModel.Common,
      calledMethod: NovaPoshtaMethod.GetBackwardDeliveryCargoTypes,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<GetBackwardDeliveryCargoTypesResponse['data']>(apiRequest);
  }

  /**
   * Get types of payers for redelivery
   * @description Retrieves list of payer types for redelivery
   * @cacheable 24 hours
   */
  async getTypesOfPayersForRedelivery(
    request: GetTypesOfPayersForRedeliveryRequest = {},
  ): Promise<GetTypesOfPayersForRedeliveryResponse> {
    const apiRequest: NovaPoshtaRequest = {
      apiKey: '',
      modelName: NovaPoshtaModel.Common,
      calledMethod: NovaPoshtaMethod.GetTypesOfPayersForRedelivery,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<GetTypesOfPayersForRedeliveryResponse['data']>(apiRequest);
  }

  /**
   * Get service configuration
   */
  getConfig(): ReferenceServiceConfig {
    return { ...this.config };
  }

  /**
   * Update service configuration
   */
  updateConfig(newConfig: Partial<ReferenceServiceConfig>): void {
    Object.assign(this.config, newConfig);
  }
}

/**
 * Plugin factory for ReferenceService
 */
export const createReferenceService = (): ServicePlugin<ReferenceService> => (ctx: ClientContext) => {
  const transport = toHttpTransport(ctx);
  return new ReferenceService(transport, {});
};
