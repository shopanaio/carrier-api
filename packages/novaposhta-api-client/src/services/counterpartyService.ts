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
    const methodProperties: Record<string, string | undefined> = {
      CounterpartyProperty: request.counterpartyProperty,
      Page: request.page?.toString(),
      FindByString: request.findByString,
      CityRef: request.cityRef,
    };

    const cleanProperties = Object.fromEntries(
      Object.entries(methodProperties).filter(([, value]) => value !== undefined && value !== ''),
    );

    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.Counterparty,
      calledMethod: NovaPoshtaMethod.GetCounterparties,
      methodProperties: cleanProperties,
    };

    return await this.transport.request<GetCounterpartiesResponse['data']>(apiRequest);
  }

  /**
   * Get counterparty addresses
   * @description Retrieves addresses for a specific counterparty
   * @cacheable 1 hour
   */
  async getCounterpartyAddresses(request: GetCounterpartyAddressesRequest): Promise<GetCounterpartyAddressesResponse> {
    const methodProperties: Record<string, string | undefined> = {
      Ref: request.ref,
      CounterpartyProperty: request.counterpartyProperty,
      Page: request.page?.toString(),
    };

    const cleanProperties = Object.fromEntries(
      Object.entries(methodProperties).filter(([, value]) => value !== undefined && value !== ''),
    );

    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.Counterparty,
      calledMethod: NovaPoshtaMethod.GetCounterpartyAddresses,
      methodProperties: cleanProperties,
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
    const methodProperties: Record<string, string | undefined> = {
      Ref: request.ref,
      Page: request.page?.toString(),
    };

    const cleanProperties = Object.fromEntries(
      Object.entries(methodProperties).filter(([, value]) => value !== undefined && value !== ''),
    );

    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.Counterparty,
      calledMethod: NovaPoshtaMethod.GetCounterpartyContactPersons,
      methodProperties: cleanProperties,
    };

    return await this.transport.request<GetCounterpartyContactPersonsResponse['data']>(apiRequest);
  }

  /**
   * Save counterparty
   * @description Creates a new counterparty (sender or recipient)
   */
  async save(request: SaveCounterpartyRequest): Promise<SaveCounterpartyResponse> {
    const methodProperties: Record<string, string | undefined> = {
      CounterpartyType: request.counterpartyType,
      CounterpartyProperty: request.counterpartyProperty,
      Phone: request.phone,
      Email: request.email,
    };

    if (request.counterpartyType === 'PrivatePerson') {
      // For private persons, firstName and lastName are required
      methodProperties.FirstName = request.firstName;
      methodProperties.MiddleName = request.middleName;
      methodProperties.LastName = request.lastName;
    } else {
      // For organizations, ownershipForm and edrpou are required
      methodProperties.OwnershipForm = request.ownershipForm;
      methodProperties.EDRPOU = request.edrpou;
      // Contact person details are optional for organizations
      if (request.firstName) methodProperties.FirstName = request.firstName;
      if (request.middleName) methodProperties.MiddleName = request.middleName;
      if (request.lastName) methodProperties.LastName = request.lastName;
    }

    const cleanProperties = Object.fromEntries(
      Object.entries(methodProperties).filter(([, value]) => value !== undefined && value !== ''),
    );

    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.Counterparty,
      calledMethod: NovaPoshtaMethod.Save,
      methodProperties: cleanProperties,
    };

    return await this.transport.request<SaveCounterpartyResponse['data']>(apiRequest);
  }

  /**
   * Update counterparty
   * @description Updates an existing counterparty
   */
  async update(request: UpdateCounterpartyRequest): Promise<UpdateCounterpartyResponse> {
    const methodProperties: Record<string, string | undefined> = {
      Ref: request.ref,
      CounterpartyProperty: request.counterpartyProperty,
      FirstName: request.firstName,
      MiddleName: request.middleName,
      LastName: request.lastName,
      Phone: request.phone,
      Email: request.email,
    };

    const cleanProperties = Object.fromEntries(
      Object.entries(methodProperties).filter(([, value]) => value !== undefined && value !== ''),
    );

    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.Counterparty,
      calledMethod: NovaPoshtaMethod.Update,
      methodProperties: cleanProperties,
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
      methodProperties: {
        Ref: request.ref,
      },
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
      methodProperties: {
        Ref: request.ref,
      },
    };

    return await this.transport.request<GetCounterpartyOptionsResponse['data']>(apiRequest);
  }
}
