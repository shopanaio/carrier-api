/**
 * Address service for Nova Poshta API
 * Handles all address-related operations
 */

import type { HttpTransport } from '../http/transport';
import type { ClientContext } from '../core/client';
import { toHttpTransport } from '../core/client';
import type {
  GetSettlementsRequest,
  GetSettlementsResponse,
  GetSettlementCountryRegionRequest,
  GetSettlementCountryRegionResponse,
  GetCitiesRequest,
  GetCitiesResponse,
  GetStreetRequest,
  GetStreetResponse,
  SearchSettlementsRequest,
  SearchSettlementsResponse,
  SearchSettlementStreetsRequest,
  SearchSettlementStreetsResponse,
  GetWarehousesRequest,
  GetWarehousesResponse,
  SaveAddressRequest,
  SaveAddressResponse,
  UpdateAddressRequest,
  UpdateAddressResponse,
  DeleteAddressRequest,
  DeleteAddressResponse,
} from '../types/address';
import type { NovaPoshtaRequest } from '../types/base';
import { NovaPoshtaModel, NovaPoshtaMethod } from '../types/enums';

/**
 * Service for managing address operations
 *
 * @example
 * ```typescript
 * // Get settlements (areas)
 * const settlements = await addressService.getSettlements();
 *
 * // Search for cities
 * const cities = await addressService.getCities({
 *   FindByString: 'Kyiv'
 * });
 *
 * // Search settlements online
 * const searchResults = await addressService.searchSettlements({
 *   CityName: 'kyiv',
 *   Page: 1,
 *   Limit: 50
 * });
 * ```
 */
export class AddressService {
  readonly namespace = 'address' as const;
  private transport!: HttpTransport;
  private apiKey?: string;

  attach(ctx: ClientContext) {
    this.transport = toHttpTransport(ctx);
    this.apiKey = ctx.apiKey;
  }

  /**
   * Get settlements (areas)
   * @description Retrieves list of settlement areas
   * @cacheable 12 hours
   */
  async getSettlements(request: GetSettlementsRequest = {}): Promise<GetSettlementsResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.Address,
      calledMethod: NovaPoshtaMethod.GetSettlementAreas,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<GetSettlementsResponse['data']>(apiRequest);
  }

  /**
   * Get settlement country regions
   * @description Retrieves list of settlement regions for a specific area
   * @cacheable 12 hours
   */
  async getSettlementCountryRegion(
    request: GetSettlementCountryRegionRequest,
  ): Promise<GetSettlementCountryRegionResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.Address,
      calledMethod: NovaPoshtaMethod.GetSettlementCountryRegion,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<GetSettlementCountryRegionResponse['data']>(apiRequest);
  }

  /**
   * Get cities
   * @description Retrieves list of cities with Nova Poshta offices
   * @cacheable 12 hours
   */
  async getCities(request: GetCitiesRequest = {}): Promise<GetCitiesResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.Address,
      calledMethod: NovaPoshtaMethod.GetCities,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<GetCitiesResponse['data']>(apiRequest);
  }

  /**
   * Get streets
   * @description Retrieves list of streets in a specific city
   * @cacheable 12 hours
   */
  async getStreet(request: GetStreetRequest): Promise<GetStreetResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.Address,
      calledMethod: NovaPoshtaMethod.GetStreet,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<GetStreetResponse['data']>(apiRequest);
  }

  /**
   * Search settlements online
   * @description Performs online search for settlements
   * @cacheable 1 hour
   */
  async searchSettlements(request: SearchSettlementsRequest): Promise<SearchSettlementsResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.Address,
      calledMethod: NovaPoshtaMethod.SearchSettlements,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<SearchSettlementsResponse['data']>(apiRequest);
  }

  /**
   * Search settlement streets online
   * @description Performs online search for streets in a settlement
   * @cacheable 1 hour
   */
  async searchSettlementStreets(request: SearchSettlementStreetsRequest): Promise<SearchSettlementStreetsResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.Address,
      calledMethod: NovaPoshtaMethod.SearchSettlementStreets,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<SearchSettlementStreetsResponse['data']>(apiRequest);
  }

  /**
   * Get warehouses (branches and postomats)
   * @description Retrieves list of Nova Poshta warehouses filtered by city, settlement, or other criteria
   * @cacheable 1 hour
   * @note API returns HTTP 303 Redirect with link to cached file for some cities
   */
  async getWarehouses(request: GetWarehousesRequest = {}): Promise<GetWarehousesResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.Address,
      calledMethod: NovaPoshtaMethod.GetWarehouses,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<GetWarehousesResponse['data']>(apiRequest);
  }

  /**
   * Save address
   * @description Creates a new counterparty address
   */
  async save(request: SaveAddressRequest): Promise<SaveAddressResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.Address,
      calledMethod: NovaPoshtaMethod.Save,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<SaveAddressResponse['data']>(apiRequest);
  }

  /**
   * Update address
   * @description Updates existing counterparty address
   */
  async update(request: UpdateAddressRequest): Promise<UpdateAddressResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.Address,
      calledMethod: NovaPoshtaMethod.Update,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<UpdateAddressResponse['data']>(apiRequest);
  }

  /**
   * Delete address
   * @description Deletes counterparty address by reference
   */
  async delete(request: DeleteAddressRequest): Promise<DeleteAddressResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.Address,
      calledMethod: NovaPoshtaMethod.Delete,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<DeleteAddressResponse['data']>(apiRequest);
  }
}
