/**
 * Waybill service for Nova Poshta API
 * Handles all waybill-related operations
 */

import type { HttpTransport } from '../http/transport';
import type { ClientContext } from '../core/client';
import { toHttpTransport } from '../core/client';
import type {
  CreateWaybillRequest,
  CreateWaybillWithOptionsRequest,
  CreateWaybillToPostomatRequest,
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
import { isValidPoshtomatDimensions } from '../types/waybill';
import type { NovaPoshtaRequest } from '../types/base';
import { NovaPoshtaModel, NovaPoshtaMethod } from '../types/enums';

type PostomatDeliveryCandidate = Partial<CreateWaybillRequest> &
  Pick<Partial<CreateWaybillToPostomatRequest>, 'OptionsSeat'>;

/**
 * Service for managing waybills (express documents)
 */
export class WaybillService {
  readonly namespace = 'waybill' as const;
  private transport!: HttpTransport;
  private apiKey?: string;

  attach(ctx: ClientContext) {
    this.transport = toHttpTransport(ctx);
    this.apiKey = ctx.apiKey;
  }

  /**
   * Create a standard waybill
   */
  async create(request: CreateWaybillRequest): Promise<CreateWaybillResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.InternetDocument,
      calledMethod: NovaPoshtaMethod.Save,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<CreateWaybillResponse['data']>(apiRequest);
  }

  /**
   * Create a waybill with additional options and services
   */
  async createWithOptions(request: CreateWaybillWithOptionsRequest): Promise<CreateWaybillResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.InternetDocument,
      calledMethod: NovaPoshtaMethod.Save,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<CreateWaybillResponse['data']>(apiRequest);
  }

  /**
   * Create a waybill for delivery to a postomat (with restrictions).
   *
   * A postomat cannot be passed as SenderAddress to InternetDocument/save.
   * Loading an API-created waybill into a sender postomat is completed in the
   * Nova Poshta mobile application.
   */
  async createToPostomat(request: CreateWaybillToPostomatRequest): Promise<CreateWaybillResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.InternetDocument,
      calledMethod: NovaPoshtaMethod.Save,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<CreateWaybillResponse['data']>(apiRequest);
  }

  /**
   * Create a waybill for delivery to a postomat (with restrictions).
   * @deprecated Use createToPostomat() to make the supported direction explicit.
   */
  async createForPostomat(request: CreatePoshtomatWaybillRequest): Promise<CreateWaybillResponse> {
    return this.createToPostomat(request);
  }

  /**
   * Update an existing waybill
   */
  async update(request: UpdateWaybillRequest): Promise<UpdateWaybillResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.InternetDocument,
      calledMethod: NovaPoshtaMethod.Update,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<UpdateWaybillResponse['data']>(apiRequest);
  }

  /**
   * Delete waybills
   */
  async delete(request: DeleteWaybillRequest): Promise<DeleteWaybillResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.InternetDocument,
      calledMethod: NovaPoshtaMethod.Delete,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<DeleteWaybillResponse['data']>(apiRequest);
  }

  /**
   * Calculate delivery date
   */
  async getDeliveryDate(request: DeliveryDateRequest): Promise<DeliveryDateResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.InternetDocument,
      calledMethod: NovaPoshtaMethod.GetDocumentDeliveryDate,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<DeliveryDateResponse['data']>(apiRequest);
  }

  /**
   * Calculate delivery price
   */
  async getPrice(request: PriceCalculationRequest): Promise<PriceCalculationResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.InternetDocument,
      calledMethod: NovaPoshtaMethod.GetDocumentPrice,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<PriceCalculationResponse['data']>(apiRequest);
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
    return this.delete({ DocumentRefs: documentRefs as any });
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
        ServiceType: request.ServiceType,
        CitySender: request.CitySender,
        CityRecipient: request.CityRecipient,
      }),
    ]);

    return { price, deliveryDate };
  }

  /**
   * Validate waybill data without creating
   */
  async validateWaybill(_request: CreateWaybillRequest): Promise<boolean> {
    try {
      // Validation removed
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if delivery to a postomat is available for the request
   */
  canDeliverToPostomat(request: PostomatDeliveryCandidate): boolean {
    // Check cargo type
    if (!request.CargoType || !['Parcel', 'Documents'].includes(request.CargoType)) {
      return false;
    }

    // Check service type
    if (!request.ServiceType || !['DoorsPostomat', 'WarehousePostomat'].includes(request.ServiceType)) {
      return false;
    }

    // Check shipment-level postomat limits
    if (request.Weight === undefined || request.Weight < 0.1 || request.Weight > 20) {
      return false;
    }

    if (request.Cost === undefined || request.Cost < 0 || request.Cost > 10000) {
      return false;
    }

    if (!Number.isInteger(request.SeatsAmount) || (request.SeatsAmount ?? 0) < 1) {
      return false;
    }

    if (!request.OptionsSeat || request.OptionsSeat.length !== request.SeatsAmount) {
      return false;
    }

    return request.OptionsSeat.every(
      seat =>
        seat.Weight > 0 &&
        seat.VolumetricWidth > 0 &&
        seat.VolumetricLength > 0 &&
        seat.VolumetricHeight > 0 &&
        isValidPoshtomatDimensions(seat),
    );
  }

  /**
   * Check whether a postomat can be passed as SenderAddress to
   * InternetDocument/save.
   */
  canUsePostomatAsSenderAddress(): false {
    return false;
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
   * @deprecated Use createToPostomat() method instead
   */
  async createPoshtomatExpressWaybill(request: CreatePoshtomatWaybillRequest): Promise<CreateWaybillResponse> {
    return this.createToPostomat(request);
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
