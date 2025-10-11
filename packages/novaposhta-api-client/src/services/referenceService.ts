/**
 * Reference service for Nova Poshta API
 * Handles all reference data operations
 */

import type { HttpTransport } from '../http/transport';
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

    const response = await this.transport.request<GetCargoTypesResponse['data']>(apiRequest);

    return response as GetCargoTypesResponse;
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

    const response = await this.transport.request<GetPalletsListResponse['data']>(apiRequest);

    return response as GetPalletsListResponse;
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

    const response = await this.transport.request<GetPackListResponse['data']>(apiRequest);

    return response as GetPackListResponse;
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

    const response = await this.transport.request<GetTiresWheelsListResponse['data']>(apiRequest);
    return response as GetTiresWheelsListResponse;
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

    const response = await this.transport.request<GetCargoDescriptionListResponse['data']>(apiRequest);

    return response as GetCargoDescriptionListResponse;
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

    const response = await this.transport.request<GetMessageCodeTextResponse['data']>(apiRequest);

    return response as GetMessageCodeTextResponse;
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

    const response = await this.transport.request<GetServiceTypesResponse['data']>(apiRequest);

    return response as GetServiceTypesResponse;
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

    const response = await this.transport.request<GetOwnershipFormsListResponse['data']>(apiRequest);

    // Validation removed

    return response as GetOwnershipFormsListResponse;
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

    const response = await this.transport.request<GetTimeIntervalsResponse['data']>(apiRequest);

    // Validation removed

    return response as GetTimeIntervalsResponse;
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

    const response = await this.transport.request<GetPickupTimeIntervalsResponse['data']>(apiRequest);

    // Validation removed

    return response as GetPickupTimeIntervalsResponse;
  }

  /**
   * Get backward delivery cargo types
   * @description Retrieves list of backward delivery cargo types
   * @cacheable 24 hours
   */
  async getBackwardDeliveryCargoTypes(
    request: GetBackwardDeliveryCargoTypesRequest = {},
  ): Promise<GetBackwardDeliveryCargoTypesResponse> {
    // Validation removed

    const apiRequest: NovaPoshtaRequest = {
      apiKey: '',
      modelName: NovaPoshtaModel.Common,
      calledMethod: NovaPoshtaMethod.GetBackwardDeliveryCargoTypes,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    const response = await this.transport.request<GetBackwardDeliveryCargoTypesResponse['data']>(apiRequest);

    // Validation removed

    return response as GetBackwardDeliveryCargoTypesResponse;
  }

  /**
   * Get types of payers for redelivery
   * @description Retrieves list of payer types for redelivery
   * @cacheable 24 hours
   */
  async getTypesOfPayersForRedelivery(
    request: GetTypesOfPayersForRedeliveryRequest = {},
  ): Promise<GetTypesOfPayersForRedeliveryResponse> {
    // Validation removed

    const apiRequest: NovaPoshtaRequest = {
      apiKey: '',
      modelName: NovaPoshtaModel.Common,
      calledMethod: NovaPoshtaMethod.GetTypesOfPayersForRedelivery,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    const response = await this.transport.request<GetTypesOfPayersForRedeliveryResponse['data']>(apiRequest);

    // Validation removed

    return response as GetTypesOfPayersForRedeliveryResponse;
  }

  //

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

  // Private cache management methods
  //
}
