/**
 * Reference service for Nova Poshta API
 * Handles all reference data operations
 */

import type { HttpTransport } from '../http/transport';
import type { NovaPoshtaValidator } from '../validation/validator';
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
import { schemas } from '../validation/schemas';

// Reference service configuration
export interface ReferenceServiceConfig {
  /** Enable request validation */
  readonly validateRequests: boolean;
  /** Enable response validation */
  readonly validateResponses: boolean;
  /** Default timeout for reference operations */
  readonly timeout?: number;
}

// Default configuration
export const DEFAULT_REFERENCE_CONFIG: ReferenceServiceConfig = {
  validateRequests: true,
  validateResponses: true,
};

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
    private readonly validator: NovaPoshtaValidator,
    private readonly config: ReferenceServiceConfig = DEFAULT_REFERENCE_CONFIG,
  ) {}

  /**
   * Get cargo types
   * @description Retrieves list of available cargo types
   * @cacheable 24 hours
   */
  async getCargoTypes(request: GetCargoTypesRequest = {}): Promise<GetCargoTypesResponse> {
    // Validate request
    if (this.config.validateRequests) {
      this.validator.validateOrThrow(schemas.getCargoTypesRequest, request, 'getCargoTypes');
    }

    const apiRequest: NovaPoshtaRequest = {
      apiKey: '', // Will be injected by interceptor
      modelName: NovaPoshtaModel.Common,
      calledMethod: NovaPoshtaMethod.GetCargoTypes,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    const response = await this.transport.request<GetCargoTypesResponse['data']>(apiRequest);

    // Validate response
    if (this.config.validateResponses) {
      this.validator.validateOrThrow(schemas.novaPoshtaResponse, response, 'getCargoTypesResponse');
    }

    return response as GetCargoTypesResponse;
  }

  /**
   * Get pallets list
   * @description Retrieves list of available pallets
   * @cacheable 24 hours
   */
  async getPalletsList(request: GetPalletsListRequest = {}): Promise<GetPalletsListResponse> {
    // Validate request
    if (this.config.validateRequests) {
      this.validator.validateOrThrow(schemas.getPalletsListRequest, request, 'getPalletsList');
    }

    const apiRequest: NovaPoshtaRequest = {
      apiKey: '',
      modelName: NovaPoshtaModel.Common,
      calledMethod: NovaPoshtaMethod.GetPalletsList,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    const response = await this.transport.request<GetPalletsListResponse['data']>(apiRequest);

    // Validate response
    if (this.config.validateResponses) {
      this.validator.validateOrThrow(schemas.novaPoshtaResponse, response, 'getPalletsListResponse');
    }

    return response as GetPalletsListResponse;
  }

  /**
   * Get pack list
   * @description Retrieves list of available packaging types
   * @cacheable 24 hours
   */
  async getPackList(request: GetPackListRequest = {}): Promise<GetPackListResponse> {
    // Validate request
    if (this.config.validateRequests) {
      this.validator.validateOrThrow(schemas.getPackListRequest, request, 'getPackList');
    }

    const apiRequest: NovaPoshtaRequest = {
      apiKey: '',
      modelName: NovaPoshtaModel.Common,
      calledMethod: NovaPoshtaMethod.GetPackList,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    const response = await this.transport.request<GetPackListResponse['data']>(apiRequest);

    // Validate response
    if (this.config.validateResponses) {
      this.validator.validateOrThrow(schemas.novaPoshtaResponse, response, 'getPackListResponse');
    }

    return response as GetPackListResponse;
  }

  /**
   * Get tires and wheels list
   * @description Retrieves list of available tires and wheels types
   * @cacheable 24 hours
   */
  async getTiresWheelsList(request: GetTiresWheelsListRequest = {}): Promise<GetTiresWheelsListResponse> {
    // Validate request
    if (this.config.validateRequests) {
      this.validator.validateOrThrow(schemas.getTiresWheelsListRequest, request, 'getTiresWheelsList');
    }

    const apiRequest: NovaPoshtaRequest = {
      apiKey: '',
      modelName: NovaPoshtaModel.Common,
      calledMethod: NovaPoshtaMethod.GetTiresWheelsList,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    const response = await this.transport.request<GetTiresWheelsListResponse['data']>(apiRequest);

    // Validate response
    if (this.config.validateResponses) {
      this.validator.validateOrThrow(schemas.novaPoshtaResponse, response, 'getTiresWheelsListResponse');
    }

    return response as GetTiresWheelsListResponse;
  }

  /**
   * Get cargo description list
   * @description Retrieves list of cargo descriptions with optional search
   * @cacheable 24 hours
   */
  async getCargoDescriptionList(request: GetCargoDescriptionListRequest = {}): Promise<GetCargoDescriptionListResponse> {
    // Validate request
    if (this.config.validateRequests) {
      this.validator.validateOrThrow(schemas.getCargoDescriptionListRequest, request, 'getCargoDescriptionList');
    }

    const apiRequest: NovaPoshtaRequest = {
      apiKey: '',
      modelName: NovaPoshtaModel.Common,
      calledMethod: NovaPoshtaMethod.GetCargoDescriptionList,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    const response = await this.transport.request<GetCargoDescriptionListResponse['data']>(apiRequest);

    // Validate response
    if (this.config.validateResponses) {
      this.validator.validateOrThrow(schemas.novaPoshtaResponse, response, 'getCargoDescriptionListResponse');
    }

    return response as GetCargoDescriptionListResponse;
  }

  /**
   * Get message code text
   * @description Retrieves list of error codes and their descriptions
   * @cacheable 24 hours
   */
  async getMessageCodeText(request: GetMessageCodeTextRequest = {}): Promise<GetMessageCodeTextResponse> {
    // Validate request
    if (this.config.validateRequests) {
      this.validator.validateOrThrow(schemas.getMessageCodeTextRequest, request, 'getMessageCodeText');
    }

    const apiRequest: NovaPoshtaRequest = {
      apiKey: '',
      modelName: NovaPoshtaModel.Common,
      calledMethod: NovaPoshtaMethod.GetMessageCodeText,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    const response = await this.transport.request<GetMessageCodeTextResponse['data']>(apiRequest);

    // Validate response
    if (this.config.validateResponses) {
      this.validator.validateOrThrow(schemas.novaPoshtaResponse, response, 'getMessageCodeTextResponse');
    }

    return response as GetMessageCodeTextResponse;
  }

  /**
   * Get service types
   * @description Retrieves list of delivery service types
   * @cacheable 24 hours
   */
  async getServiceTypes(request: GetServiceTypesRequest = {}): Promise<GetServiceTypesResponse> {
    // Validate request
    if (this.config.validateRequests) {
      this.validator.validateOrThrow(schemas.getServiceTypesRequest, request, 'getServiceTypes');
    }

    const apiRequest: NovaPoshtaRequest = {
      apiKey: '',
      modelName: NovaPoshtaModel.Common,
      calledMethod: NovaPoshtaMethod.GetServiceTypes,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    const response = await this.transport.request<GetServiceTypesResponse['data']>(apiRequest);

    // Validate response
    if (this.config.validateResponses) {
      this.validator.validateOrThrow(schemas.novaPoshtaResponse, response, 'getServiceTypesResponse');
    }

    return response as GetServiceTypesResponse;
  }

  /**
   * Get ownership forms list
   * @description Retrieves list of ownership forms
   * @cacheable 24 hours
   */
  async getOwnershipFormsList(request: GetOwnershipFormsListRequest = {}): Promise<GetOwnershipFormsListResponse> {
    // Validate request
    if (this.config.validateRequests) {
      this.validator.validateOrThrow(schemas.getOwnershipFormsListRequest, request, 'getOwnershipFormsList');
    }

    const apiRequest: NovaPoshtaRequest = {
      apiKey: '',
      modelName: NovaPoshtaModel.Common,
      calledMethod: NovaPoshtaMethod.GetOwnershipFormsList,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    const response = await this.transport.request<GetOwnershipFormsListResponse['data']>(apiRequest);

    // Validate response
    if (this.config.validateResponses) {
      this.validator.validateOrThrow(schemas.novaPoshtaResponse, response, 'getOwnershipFormsListResponse');
    }

    return response as GetOwnershipFormsListResponse;
  }

  /**
   * Get time intervals
   * @description Retrieves available time intervals for delivery
   * @cacheable 1 hour
   */
  async getTimeIntervals(request: GetTimeIntervalsRequest): Promise<GetTimeIntervalsResponse> {
    // Validate request
    if (this.config.validateRequests) {
      this.validator.validateOrThrow(schemas.timeIntervalsRequest, request, 'getTimeIntervals');
    }

    const apiRequest: NovaPoshtaRequest = {
      apiKey: '',
      modelName: NovaPoshtaModel.Common,
      calledMethod: NovaPoshtaMethod.GetTimeIntervals,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    const response = await this.transport.request<GetTimeIntervalsResponse['data']>(apiRequest);

    // Validate response
    if (this.config.validateResponses) {
      this.validator.validateOrThrow(schemas.novaPoshtaResponse, response, 'getTimeIntervalsResponse');
    }

    return response as GetTimeIntervalsResponse;
  }

  /**
   * Get pickup time intervals
   * @description Retrieves available time intervals for pickup
   * @cacheable 1 hour
   */
  async getPickupTimeIntervals(request: GetPickupTimeIntervalsRequest): Promise<GetPickupTimeIntervalsResponse> {
    // Validate request
    if (this.config.validateRequests) {
      this.validator.validateOrThrow(schemas.pickupTimeIntervalsRequest, request, 'getPickupTimeIntervals');
    }

    const apiRequest: NovaPoshtaRequest = {
      apiKey: '',
      modelName: NovaPoshtaModel.Common,
      calledMethod: NovaPoshtaMethod.GetPickupTimeIntervals,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    const response = await this.transport.request<GetPickupTimeIntervalsResponse['data']>(apiRequest);

    // Validate response
    if (this.config.validateResponses) {
      this.validator.validateOrThrow(schemas.novaPoshtaResponse, response, 'getPickupTimeIntervalsResponse');
    }

    return response as GetPickupTimeIntervalsResponse;
  }

  /**
   * Get backward delivery cargo types
   * @description Retrieves list of backward delivery cargo types
   * @cacheable 24 hours
   */
  async getBackwardDeliveryCargoTypes(request: GetBackwardDeliveryCargoTypesRequest = {}): Promise<GetBackwardDeliveryCargoTypesResponse> {

    // Validate request
    if (this.config.validateRequests) {
      this.validator.validateOrThrow(schemas.getBackwardDeliveryCargoTypesRequest, request, 'getBackwardDeliveryCargoTypes');
    }

    const apiRequest: NovaPoshtaRequest = {
      apiKey: '',
      modelName: NovaPoshtaModel.Common,
      calledMethod: NovaPoshtaMethod.GetBackwardDeliveryCargoTypes,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    const response = await this.transport.request<GetBackwardDeliveryCargoTypesResponse['data']>(apiRequest);

    // Validate response
    if (this.config.validateResponses) {
      this.validator.validateOrThrow(schemas.novaPoshtaResponse, response, 'getBackwardDeliveryCargoTypesResponse');
    }

    return response as GetBackwardDeliveryCargoTypesResponse;
  }

  /**
   * Get types of payers for redelivery
   * @description Retrieves list of payer types for redelivery
   * @cacheable 24 hours
   */
  async getTypesOfPayersForRedelivery(request: GetTypesOfPayersForRedeliveryRequest = {}): Promise<GetTypesOfPayersForRedeliveryResponse> {

    // Validate request
    if (this.config.validateRequests) {
      this.validator.validateOrThrow(schemas.getTypesOfPayersForRedeliveryRequest, request, 'getTypesOfPayersForRedelivery');
    }

    const apiRequest: NovaPoshtaRequest = {
      apiKey: '',
      modelName: NovaPoshtaModel.Common,
      calledMethod: NovaPoshtaMethod.GetTypesOfPayersForRedelivery,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    const response = await this.transport.request<GetTypesOfPayersForRedeliveryResponse['data']>(apiRequest);

    // Validate response
    if (this.config.validateResponses) {
      this.validator.validateOrThrow(schemas.novaPoshtaResponse, response, 'getTypesOfPayersForRedeliveryResponse');
    }

    return response as GetTypesOfPayersForRedeliveryResponse;
  }

  // Cache functionality removed

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
  // Cache helpers removed
}
