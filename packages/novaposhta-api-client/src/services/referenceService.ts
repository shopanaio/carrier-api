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
  /** Enable caching of reference data */
  readonly enableCaching: boolean;
  /** Cache TTL for reference data in milliseconds */
  readonly cacheTtl: number;
  /** Default timeout for reference operations */
  readonly timeout?: number;
}

// Default configuration
export const DEFAULT_REFERENCE_CONFIG: ReferenceServiceConfig = {
  validateRequests: true,
  validateResponses: true,
  enableCaching: true,
  cacheTtl: 86400000, // 24 hours
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
  private readonly cache = new Map<string, CacheEntry<any>>();

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
    const cacheKey = 'cargoTypes';
    
    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.getCachedData<GetCargoTypesResponse>(cacheKey);
      if (cached) return cached;
    }

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

    const result = response as GetCargoTypesResponse;

    // Cache the result
    if (this.config.enableCaching && result.success) {
      this.setCachedData(cacheKey, result, this.config.cacheTtl);
    }

    return result;
  }

  /**
   * Get pallets list
   * @description Retrieves list of available pallets
   * @cacheable 24 hours
   */
  async getPalletsList(request: GetPalletsListRequest = {}): Promise<GetPalletsListResponse> {
    const cacheKey = 'palletsList';
    
    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.getCachedData<GetPalletsListResponse>(cacheKey);
      if (cached) return cached;
    }

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

    const result = response as GetPalletsListResponse;

    // Cache the result
    if (this.config.enableCaching && result.success) {
      this.setCachedData(cacheKey, result, this.config.cacheTtl);
    }

    return result;
  }

  /**
   * Get pack list
   * @description Retrieves list of available packaging types
   * @cacheable 24 hours
   */
  async getPackList(request: GetPackListRequest = {}): Promise<GetPackListResponse> {
    const cacheKey = `packList_${JSON.stringify(request)}`;
    
    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.getCachedData<GetPackListResponse>(cacheKey);
      if (cached) return cached;
    }

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

    const result = response as GetPackListResponse;

    // Cache the result
    if (this.config.enableCaching && result.success) {
      this.setCachedData(cacheKey, result, this.config.cacheTtl);
    }

    return result;
  }

  /**
   * Get tires and wheels list
   * @description Retrieves list of available tires and wheels types
   * @cacheable 24 hours
   */
  async getTiresWheelsList(request: GetTiresWheelsListRequest = {}): Promise<GetTiresWheelsListResponse> {
    const cacheKey = 'tiresWheelsList';
    
    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.getCachedData<GetTiresWheelsListResponse>(cacheKey);
      if (cached) return cached;
    }

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

    const result = response as GetTiresWheelsListResponse;

    // Cache the result
    if (this.config.enableCaching && result.success) {
      this.setCachedData(cacheKey, result, this.config.cacheTtl);
    }

    return result;
  }

  /**
   * Get cargo description list
   * @description Retrieves list of cargo descriptions with optional search
   * @cacheable 24 hours
   */
  async getCargoDescriptionList(request: GetCargoDescriptionListRequest = {}): Promise<GetCargoDescriptionListResponse> {
    const cacheKey = `cargoDescriptionList_${JSON.stringify(request)}`;
    
    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.getCachedData<GetCargoDescriptionListResponse>(cacheKey);
      if (cached) return cached;
    }

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

    const result = response as GetCargoDescriptionListResponse;

    // Cache the result
    if (this.config.enableCaching && result.success) {
      this.setCachedData(cacheKey, result, this.config.cacheTtl);
    }

    return result;
  }

  /**
   * Get message code text
   * @description Retrieves list of error codes and their descriptions
   * @cacheable 24 hours
   */
  async getMessageCodeText(request: GetMessageCodeTextRequest = {}): Promise<GetMessageCodeTextResponse> {
    const cacheKey = 'messageCodeText';
    
    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.getCachedData<GetMessageCodeTextResponse>(cacheKey);
      if (cached) return cached;
    }

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

    const result = response as GetMessageCodeTextResponse;

    // Cache the result
    if (this.config.enableCaching && result.success) {
      this.setCachedData(cacheKey, result, this.config.cacheTtl);
    }

    return result;
  }

  /**
   * Get service types
   * @description Retrieves list of delivery service types
   * @cacheable 24 hours
   */
  async getServiceTypes(request: GetServiceTypesRequest = {}): Promise<GetServiceTypesResponse> {
    const cacheKey = 'serviceTypes';
    
    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.getCachedData<GetServiceTypesResponse>(cacheKey);
      if (cached) return cached;
    }

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

    const result = response as GetServiceTypesResponse;

    // Cache the result
    if (this.config.enableCaching && result.success) {
      this.setCachedData(cacheKey, result, this.config.cacheTtl);
    }

    return result;
  }

  /**
   * Get ownership forms list
   * @description Retrieves list of ownership forms
   * @cacheable 24 hours
   */
  async getOwnershipFormsList(request: GetOwnershipFormsListRequest = {}): Promise<GetOwnershipFormsListResponse> {
    const cacheKey = 'ownershipFormsList';
    
    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.getCachedData<GetOwnershipFormsListResponse>(cacheKey);
      if (cached) return cached;
    }

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

    const result = response as GetOwnershipFormsListResponse;

    // Cache the result
    if (this.config.enableCaching && result.success) {
      this.setCachedData(cacheKey, result, this.config.cacheTtl);
    }

    return result;
  }

  /**
   * Get time intervals
   * @description Retrieves available time intervals for delivery
   * @cacheable 1 hour
   */
  async getTimeIntervals(request: GetTimeIntervalsRequest): Promise<GetTimeIntervalsResponse> {
    const cacheKey = `timeIntervals_${JSON.stringify(request)}`;
    
    // Check cache first (shorter TTL for time-sensitive data)
    if (this.config.enableCaching) {
      const cached = this.getCachedData<GetTimeIntervalsResponse>(cacheKey, 3600000); // 1 hour
      if (cached) return cached;
    }

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

    const result = response as GetTimeIntervalsResponse;

    // Cache the result with shorter TTL
    if (this.config.enableCaching && result.success) {
      this.setCachedData(cacheKey, result, 3600000); // 1 hour
    }

    return result;
  }

  /**
   * Get pickup time intervals
   * @description Retrieves available time intervals for pickup
   * @cacheable 1 hour
   */
  async getPickupTimeIntervals(request: GetPickupTimeIntervalsRequest): Promise<GetPickupTimeIntervalsResponse> {
    const cacheKey = `pickupTimeIntervals_${JSON.stringify(request)}`;
    
    // Check cache first (shorter TTL for time-sensitive data)
    if (this.config.enableCaching) {
      const cached = this.getCachedData<GetPickupTimeIntervalsResponse>(cacheKey, 3600000); // 1 hour
      if (cached) return cached;
    }

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

    const result = response as GetPickupTimeIntervalsResponse;

    // Cache the result with shorter TTL
    if (this.config.enableCaching && result.success) {
      this.setCachedData(cacheKey, result, 3600000); // 1 hour
    }

    return result;
  }

  /**
   * Get backward delivery cargo types
   * @description Retrieves list of backward delivery cargo types
   * @cacheable 24 hours
   */
  async getBackwardDeliveryCargoTypes(request: GetBackwardDeliveryCargoTypesRequest = {}): Promise<GetBackwardDeliveryCargoTypesResponse> {
    const cacheKey = 'backwardDeliveryCargoTypes';
    
    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.getCachedData<GetBackwardDeliveryCargoTypesResponse>(cacheKey);
      if (cached) return cached;
    }

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

    const result = response as GetBackwardDeliveryCargoTypesResponse;

    // Cache the result
    if (this.config.enableCaching && result.success) {
      this.setCachedData(cacheKey, result, this.config.cacheTtl);
    }

    return result;
  }

  /**
   * Get types of payers for redelivery
   * @description Retrieves list of payer types for redelivery
   * @cacheable 24 hours
   */
  async getTypesOfPayersForRedelivery(request: GetTypesOfPayersForRedeliveryRequest = {}): Promise<GetTypesOfPayersForRedeliveryResponse> {
    const cacheKey = 'typesOfPayersForRedelivery';
    
    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.getCachedData<GetTypesOfPayersForRedeliveryResponse>(cacheKey);
      if (cached) return cached;
    }

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

    const result = response as GetTypesOfPayersForRedeliveryResponse;

    // Cache the result
    if (this.config.enableCaching && result.success) {
      this.setCachedData(cacheKey, result, this.config.cacheTtl);
    }

    return result;
  }

  /**
   * Clear all cached reference data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear specific cached entry
   */
  clearCacheEntry(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    entries: Array<{
      key: string;
      timestamp: number;
      ttl: number;
      expired: boolean;
    }>;
  } {
    const entries: Array<{
      key: string;
      timestamp: number;
      ttl: number;
      expired: boolean;
    }> = [];

    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      entries.push({
        key,
        timestamp: entry.timestamp,
        ttl: entry.ttl,
        expired: now > entry.timestamp + entry.ttl,
      });
    }

    return {
      size: this.cache.size,
      entries,
    };
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

  // Private cache management methods
  private getCachedData<T>(key: string, customTtl?: number): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const ttl = customTtl || entry.ttl;
    const now = Date.now();
    
    if (now > entry.timestamp + ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCachedData<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }
}