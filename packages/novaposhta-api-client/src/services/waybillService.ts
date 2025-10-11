/**
 * Waybill service for Nova Poshta API
 * Handles all waybill-related operations
 */

import type { HttpTransport } from '../http/transport';
import type { NovaPoshtaValidator } from '../validation/validator';
import type {
  CreateWaybillRequest,
  CreateWaybillWithOptionsRequest,
  CreatePoshtomatWaybillRequest,
  UpdateWaybillRequest,
  DeleteWaybillRequest,
  CreateWaybillResponse,
  UpdateWaybillResponse,
  DeleteWaybillResponse,
  DeliveryDateRequest,
  DeliveryDateResponse,
  PriceCalculationRequest,
  PriceCalculationResponse,
} from '../types/waybill';
import type { NovaPoshtaRequest } from '../types/base';
import { NovaPoshtaModel, NovaPoshtaMethod } from '../types/enums';
import { schemas } from '../validation/schemas';

// Waybill service configuration
export interface WaybillServiceConfig {
  /** Enable request validation */
  readonly validateRequests: boolean;
  /** Enable response validation */
  readonly validateResponses: boolean;
  /** Default timeout for waybill operations */
  readonly timeout?: number;
}

// Default configuration
export const DEFAULT_WAYBILL_CONFIG: WaybillServiceConfig = {
  validateRequests: true,
  validateResponses: true,
};

/**
 * Service for managing waybills (express documents)
 */
export class WaybillService {
  constructor(
    private readonly transport: HttpTransport,
    private readonly validator: NovaPoshtaValidator,
    private readonly config: WaybillServiceConfig = DEFAULT_WAYBILL_CONFIG,
  ) {}

  /**
   * Create a standard waybill
   */
  async create(request: CreateWaybillRequest): Promise<CreateWaybillResponse> {
    // Validate request
    if (this.config.validateRequests) {
      this.validator.validateOrThrow(schemas.createWaybillRequest, request, 'createWaybill');
    }

    const apiRequest: NovaPoshtaRequest = {
      apiKey: '', // Will be injected by interceptor
      modelName: NovaPoshtaModel.InternetDocument,
      calledMethod: NovaPoshtaMethod.Save,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    const response = await this.transport.request<CreateWaybillResponse['data']>(apiRequest);

    // Validate response
    if (this.config.validateResponses) {
      this.validator.validateOrThrow(schemas.waybillCreationResponse, response, 'createWaybillResponse');
    }

    return response as CreateWaybillResponse;
  }

  /**
   * Create a waybill with additional options and services
   */
  async createWithOptions(request: CreateWaybillWithOptionsRequest): Promise<CreateWaybillResponse> {
    // Validate request
    if (this.config.validateRequests) {
      this.validator.validateOrThrow(schemas.createWaybillWithOptionsRequest, request, 'createWaybillWithOptions');
    }

    const apiRequest: NovaPoshtaRequest = {
      apiKey: '', // Will be injected by interceptor
      modelName: NovaPoshtaModel.InternetDocument,
      calledMethod: NovaPoshtaMethod.Save,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    const response = await this.transport.request<CreateWaybillResponse['data']>(apiRequest);

    // Validate response
    if (this.config.validateResponses) {
      this.validator.validateOrThrow(schemas.waybillCreationResponse, response, 'createWaybillWithOptionsResponse');
    }

    return response as CreateWaybillResponse;
  }

  /**
   * Create a postomat waybill (with restrictions)
   */
  async createForPostomat(request: CreatePoshtomatWaybillRequest): Promise<CreateWaybillResponse> {
    // Validate request with postomat-specific constraints
    if (this.config.validateRequests) {
      this.validator.validateOrThrow(schemas.createPoshtomatWaybillRequest, request, 'createPoshtomatWaybill');
    }

    const apiRequest: NovaPoshtaRequest = {
      apiKey: '', // Will be injected by interceptor
      modelName: NovaPoshtaModel.InternetDocument,
      calledMethod: NovaPoshtaMethod.Save,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    const response = await this.transport.request<CreateWaybillResponse['data']>(apiRequest);

    // Validate response
    if (this.config.validateResponses) {
      this.validator.validateOrThrow(schemas.waybillCreationResponse, response, 'createPoshtomatWaybillResponse');
    }

    return response as CreateWaybillResponse;
  }

  /**
   * Update an existing waybill
   */
  async update(request: UpdateWaybillRequest): Promise<UpdateWaybillResponse> {
    // Validate request
    if (this.config.validateRequests) {
      this.validator.validateOrThrow(schemas.updateWaybillRequest, request, 'updateWaybill');
    }

    const apiRequest: NovaPoshtaRequest = {
      apiKey: '', // Will be injected by interceptor
      modelName: NovaPoshtaModel.InternetDocument,
      calledMethod: NovaPoshtaMethod.Update,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    const response = await this.transport.request<UpdateWaybillResponse['data']>(apiRequest);

    return response as UpdateWaybillResponse;
  }

  /**
   * Delete waybills
   */
  async delete(request: DeleteWaybillRequest): Promise<DeleteWaybillResponse> {
    // Validate request
    if (this.config.validateRequests) {
      this.validator.validateOrThrow(schemas.deleteWaybillRequest, request, 'deleteWaybill');
    }

    const apiRequest: NovaPoshtaRequest = {
      apiKey: '', // Will be injected by interceptor
      modelName: NovaPoshtaModel.InternetDocument,
      calledMethod: NovaPoshtaMethod.Delete,
      methodProperties: {
        DocumentRefs: request.documentRefs.join(','),
      },
    };

    const response = await this.transport.request<DeleteWaybillResponse['data']>(apiRequest);

    return response as DeleteWaybillResponse;
  }

  /**
   * Calculate delivery date
   */
  async getDeliveryDate(request: DeliveryDateRequest): Promise<DeliveryDateResponse> {
    // Validate request
    if (this.config.validateRequests) {
      this.validator.validateOrThrow(schemas.deliveryDateRequest, request, 'getDeliveryDate');
    }

    const apiRequest: NovaPoshtaRequest = {
      apiKey: '', // Will be injected by interceptor
      modelName: NovaPoshtaModel.InternetDocument,
      calledMethod: NovaPoshtaMethod.GetDocumentDeliveryDate,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    const response = await this.transport.request<DeliveryDateResponse['data']>(apiRequest);

    return response as DeliveryDateResponse;
  }

  /**
   * Calculate delivery price
   */
  async getPrice(request: PriceCalculationRequest): Promise<PriceCalculationResponse> {
    // Validate request
    if (this.config.validateRequests) {
      this.validator.validateOrThrow(schemas.priceCalculationRequest, request, 'getPriceCalculation');
    }

    const apiRequest: NovaPoshtaRequest = {
      apiKey: '', // Will be injected by interceptor
      modelName: NovaPoshtaModel.InternetDocument,
      calledMethod: NovaPoshtaMethod.GetDocumentPrice,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    const response = await this.transport.request<PriceCalculationResponse['data']>(apiRequest);

    return response as PriceCalculationResponse;
  }

  /**
   * Batch create multiple waybills
   */
  async createBatch(requests: CreateWaybillRequest[]): Promise<CreateWaybillResponse[]> {
    const results: CreateWaybillResponse[] = [];
    
    // Process requests sequentially to avoid rate limiting
    for (const request of requests) {
      try {
        const result = await this.create(request);
        results.push(result);
      } catch (error) {
        // Add error information to the result
        results.push({
          success: false,
          data: [],
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          warnings: [],
          info: [],
          messageCodes: [],
          errorCodes: [],
          warningCodes: [],
          infoCodes: [],
        });
      }
    }
    
    return results;
  }

  /**
   * Batch delete multiple waybills
   */
  async deleteBatch(documentRefs: string[]): Promise<DeleteWaybillResponse> {
    return this.delete({ documentRefs: documentRefs as any });
  }

  /**
   * Get estimated delivery cost and date in one request
   */
  async getEstimate(request: PriceCalculationRequest): Promise<{
    price: PriceCalculationResponse;
    deliveryDate: DeliveryDateResponse;
  }> {
    const [price, deliveryDate] = await Promise.all([
      this.getPrice(request),
      this.getDeliveryDate({
        serviceType: request.serviceType,
        citySender: request.citySender,
        cityRecipient: request.cityRecipient,
      }),
    ]);

    return { price, deliveryDate };
  }

  /**
   * Validate waybill data without creating
   */
  async validateWaybill(request: CreateWaybillRequest): Promise<boolean> {
    try {
      if (this.config.validateRequests) {
        this.validator.validateOrThrow(schemas.createWaybillRequest, request, 'validateWaybill');
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if postomat delivery is available for the request
   */
  canDeliverToPostomat(request: Partial<CreateWaybillRequest>): boolean {
    // Check cargo type
    if (!request.cargoType || !['Parcel', 'Documents'].includes(request.cargoType)) {
      return false;
    }

    // Check service type
    if (!request.serviceType || !['DoorsWarehouse', 'WarehouseWarehouse'].includes(request.serviceType)) {
      return false;
    }

    // Check declared value
    if (request.cost && request.cost > 10000) {
      return false;
    }

    return true;
  }

  /**
   * Get service configuration
   */
  getConfig(): WaybillServiceConfig {
    return { ...this.config };
  }

  /**
   * Update service configuration
   */
  updateConfig(newConfig: Partial<WaybillServiceConfig>): void {
    Object.assign(this.config, newConfig);
  }

  // =============================================================================
  // LEGACY COMPATIBILITY METHODS
  // =============================================================================

  /**
   * Create express waybill (legacy method for compatibility)
   * @deprecated Use create() method instead
   */
  async createExpressWaybill(request: CreateWaybillRequest): Promise<CreateWaybillResponse> {
    return this.create(request);
  }

  /**
   * Create waybill with options (legacy method for compatibility)
   * @deprecated Use createWithOptions() method instead
   */
  async createWaybillWithOptions(request: CreateWaybillWithOptionsRequest): Promise<CreateWaybillResponse> {
    return this.createWithOptions(request);
  }

  /**
   * Create postomat express waybill (legacy method for compatibility)
   * @deprecated Use createForPostomat() method instead
   */
  async createPoshtomatExpressWaybill(request: CreatePoshtomatWaybillRequest): Promise<CreateWaybillResponse> {
    return this.createForPostomat(request);
  }

  /**
   * Update express waybill (legacy method for compatibility)
   * @deprecated Use update() method instead
   */
  async updateExpressWaybill(request: UpdateWaybillRequest): Promise<UpdateWaybillResponse> {
    return this.update(request);
  }

  /**
   * Delete waybill (legacy method for compatibility)
   * @deprecated Use delete() method instead
   */
  async deleteWaybill(request: DeleteWaybillRequest): Promise<DeleteWaybillResponse> {
    return this.delete(request);
  }

  /**
   * Get delivery date (legacy method for compatibility)
   * @deprecated Use getDeliveryDate() method instead
   */
  async getDocumentDeliveryDate(request: DeliveryDateRequest): Promise<DeliveryDateResponse> {
    return this.getDeliveryDate(request);
  }

  /**
   * Get delivery price (legacy method for compatibility)
   * @deprecated Use getPrice() method instead
   */
  async getDeliveryPrice(request: PriceCalculationRequest): Promise<PriceCalculationResponse> {
    return this.getPrice(request);
  }

  /**
   * Get document price (legacy method for compatibility)
   * @deprecated Use getPrice() method instead
   */
  async getDocumentPrice(request: PriceCalculationRequest): Promise<PriceCalculationResponse> {
    return this.getPrice(request);
  }
}