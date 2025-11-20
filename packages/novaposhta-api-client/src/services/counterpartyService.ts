/**
 * Counterparty service for Nova Poshta API
 * Handles all counterparty-related operations
 */

import type { HttpTransport } from '../http/transport';
import type { ClientContext } from '../core/client';
import { toHttpTransport } from '../core/client';
import type {
  GetCounterpartiesRequest,
  GetCounterpartiesResponse,
  GetCounterpartyAddressesRequest,
  GetCounterpartyAddressesResponse,
  GetCounterpartyContactPersonsRequest,
  GetCounterpartyContactPersonsResponse,
  SaveCounterpartyRequest,
  SaveCounterpartyResponse,
  UpdateCounterpartyRequest,
  UpdateCounterpartyResponse,
  DeleteCounterpartyRequest,
  DeleteCounterpartyResponse,
  GetCounterpartyOptionsRequest,
  GetCounterpartyOptionsResponse,
} from '../types/counterparty';
import type { NovaPoshtaRequest } from '../types/base';
import { NovaPoshtaModel, NovaPoshtaMethod } from '../types/enums';

/**
 * Service for managing counterparty operations
 *
 * @example
 * ```typescript
 * const client = createClient({ apiKey, transport, baseUrl })
 *   .use(new CounterpartyService());
 *
 * const senders = await client.counterparty.getCounterparties({
 *   counterpartyProperty: 'Sender',
 * });
 * ```
 */
export class CounterpartyService {
  readonly namespace = 'counterparty' as const;
  private transport!: HttpTransport;
  private apiKey?: string;

  attach(ctx: ClientContext) {
    this.transport = toHttpTransport(ctx);
    this.apiKey = ctx.apiKey;
  }

  /**
   * Get counterparties
   * @description Retrieves list of counterparties by property (Sender/Recipient/ThirdPerson)
   * @cacheable 1 hour
   */
  async getCounterparties(request: GetCounterpartiesRequest): Promise<GetCounterpartiesResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.Counterparty,
      calledMethod: NovaPoshtaMethod.GetCounterparties,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<GetCounterpartiesResponse['data']>(apiRequest);
  }

  /**
   * Get counterparty addresses
   * @description Retrieves addresses for a specific counterparty
   * @cacheable 1 hour
   */
  async getCounterpartyAddresses(request: GetCounterpartyAddressesRequest): Promise<GetCounterpartyAddressesResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.Counterparty,
      calledMethod: NovaPoshtaMethod.GetCounterpartyAddresses,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<GetCounterpartyAddressesResponse['data']>(apiRequest);
  }

  /**
   * Get counterparty contact persons
   * @description Retrieves contact persons for a counterparty
   * @cacheable 1 hour
   */
  async getCounterpartyContactPersons(
    request: GetCounterpartyContactPersonsRequest,
  ): Promise<GetCounterpartyContactPersonsResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.Counterparty,
      calledMethod: NovaPoshtaMethod.GetCounterpartyContactPersons,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<GetCounterpartyContactPersonsResponse['data']>(apiRequest);
  }

  /**
   * Save counterparty
   * @description Creates a new counterparty (sender or recipient)
   */
  async save(request: SaveCounterpartyRequest): Promise<SaveCounterpartyResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.Counterparty,
      calledMethod: NovaPoshtaMethod.Save,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<SaveCounterpartyResponse['data']>(apiRequest);
  }

  /**
   * Update counterparty
   * @description Updates an existing counterparty
   */
  async update(request: UpdateCounterpartyRequest): Promise<UpdateCounterpartyResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.Counterparty,
      calledMethod: NovaPoshtaMethod.Update,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<UpdateCounterpartyResponse['data']>(apiRequest);
  }

  /**
   * Delete counterparty
   * @description Deletes a counterparty by reference (only recipients)
   */
  async delete(request: DeleteCounterpartyRequest): Promise<DeleteCounterpartyResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.Counterparty,
      calledMethod: NovaPoshtaMethod.Delete,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<DeleteCounterpartyResponse['data']>(apiRequest);
  }

  /**
   * Get counterparty options
   * @description Retrieves available options (payments, delays) for counterparty
   * @cacheable 1 hour
   */
  async getCounterpartyOptions(request: GetCounterpartyOptionsRequest): Promise<GetCounterpartyOptionsResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.Counterparty,
      calledMethod: NovaPoshtaMethod.GetCounterpartyOptions,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<GetCounterpartyOptionsResponse['data']>(apiRequest);
  }
}
