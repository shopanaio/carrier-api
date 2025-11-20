/**
 * Reference service for Nova Poshta API
 * Handles all reference data operations
 */

import type { HttpTransport } from '../http/transport';
import type { ClientContext } from '../core/client';
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
  GetTypesOfPayersRequest,
  GetTypesOfPayersResponse,
  GetPaymentFormsRequest,
  GetPaymentFormsResponse,
  GetTypesOfCounterpartiesRequest,
  GetTypesOfCounterpartiesResponse,
} from '../types/reference';
import type { NovaPoshtaRequest } from '../types/base';
import { NovaPoshtaModel, NovaPoshtaMethod } from '../types/enums';

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
  readonly namespace = 'reference' as const;
  private transport!: HttpTransport;
  private apiKey?: string;

  attach(ctx: ClientContext) {
    this.transport = toHttpTransport(ctx);
    this.apiKey = ctx.apiKey;
  }

  /**
   * Get cargo types
   * @description Retrieves list of available cargo types
   * @cacheable 24 hours
   */
  async getCargoTypes(request: GetCargoTypesRequest = {}): Promise<GetCargoTypesResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
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
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
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
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
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
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
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
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
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
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
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
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
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
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
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
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
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
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
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
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
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
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.Common,
      calledMethod: NovaPoshtaMethod.GetTypesOfPayersForRedelivery,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<GetTypesOfPayersForRedeliveryResponse['data']>(apiRequest);
  }

  /**
   * Get types of payers
   * @description Retrieves list of payer roles (Sender/Recipient/ThirdPerson)
   * @cacheable 24 hours
   */
  async getTypesOfPayers(request: GetTypesOfPayersRequest = {}): Promise<GetTypesOfPayersResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.Common,
      calledMethod: NovaPoshtaMethod.GetTypesOfPayers,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<GetTypesOfPayersResponse['data']>(apiRequest);
  }

  /**
   * Get payment forms
   * @description Retrieves list of payment forms (Cash/NonCash)
   * @cacheable 24 hours
   */
  async getPaymentForms(request: GetPaymentFormsRequest = {}): Promise<GetPaymentFormsResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.Common,
      calledMethod: NovaPoshtaMethod.GetPaymentForms,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<GetPaymentFormsResponse['data']>(apiRequest);
  }

  /**
   * Get types of counterparties
   * @description Retrieves list of counterparty types (PrivatePerson/Organization)
   * @cacheable 24 hours
   */
  async getTypesOfCounterparties(
    request: GetTypesOfCounterpartiesRequest = {},
  ): Promise<GetTypesOfCounterpartiesResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.Common,
      calledMethod: NovaPoshtaMethod.GetTypesOfCounterparties,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<GetTypesOfCounterpartiesResponse['data']>(apiRequest);
  }
}
