/**
 * Address service for Nova Poshta API
 * Handles all address-related operations
 */

import type { HttpTransport } from '../http/transport';
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
} from '../types/address';
import type { NovaPoshtaRequest } from '../types/base';
import { NovaPoshtaModel, NovaPoshtaMethod } from '../types/enums';

export interface AddressServiceConfig {}

export const DEFAULT_ADDRESS_CONFIG: AddressServiceConfig = {};

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
 *   findByString: 'Kyiv'
 * });
 *
 * // Search settlements online
 * const searchResults = await addressService.searchSettlements({
 *   cityName: 'kyiv',
 *   page: 1,
 *   limit: 50
 * });
 * ```
 */
export class AddressService {
  constructor(
    private readonly transport: HttpTransport,
    private readonly config: AddressServiceConfig = DEFAULT_ADDRESS_CONFIG,
  ) {}

  /**
   * Get settlements (areas)
   * @description Retrieves list of settlement areas
   * @cacheable 12 hours
   */
  async getSettlements(request: GetSettlementsRequest = {}): Promise<GetSettlementsResponse> {
    const apiRequest: NovaPoshtaRequest = {
      apiKey: '', // Will be injected by interceptor
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
      apiKey: '',
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
      apiKey: '',
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
      apiKey: '',
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
      apiKey: '',
      modelName: NovaPoshtaModel.Address,
      calledMethod: NovaPoshtaMethod.SearchSettlements,
      methodProperties: {
        CityName: request.cityName,
        Page: request.page.toString(),
        Limit: request.limit.toString(),
      },
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
      apiKey: '',
      modelName: NovaPoshtaModel.Address,
      calledMethod: NovaPoshtaMethod.SearchSettlementStreets,
      methodProperties: {
        StreetName: request.streetName,
        SettlementRef: request.settlementRef,
        Limit: request.limit?.toString(),
      },
    };

    return await this.transport.request<SearchSettlementStreetsResponse['data']>(apiRequest);
  }

  /**
   * Get service configuration
   */
  getConfig(): AddressServiceConfig {
    return { ...this.config };
  }

  /**
   * Update service configuration
   */
  updateConfig(newConfig: Partial<AddressServiceConfig>): void {
    Object.assign(this.config, newConfig);
  }
}
