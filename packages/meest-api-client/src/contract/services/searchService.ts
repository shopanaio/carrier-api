// code and comments in English
import type {
  AddressSearchByCoordRequestBody,
  AddressSearchByCoordResponse,
  AddressSearchRequestBody,
  AddressSearchResponse,
  BranchSearchGeoResponse,
  BranchSearchRequestBody,
  BranchSearchResponse,
  BranchTypesResponse,
  CitySearchRequestBody,
  CitySearchResponse,
  CountrySearchRequestBody,
  CountrySearchResponse,
  DistrictSearchRequestBody,
  DistrictSearchResponse,
  PayTerminalSearchResponse,
  RegionSearchRequestBody,
  RegionSearchResponse,
  ZipCodeSearchResponse,
} from '../types/generated';
import { ContractService } from './base';
import type { RequestOptions } from './base';

/** Directories: countries, regions, districts, cities, addresses, branches. All calls are reads. */
export class SearchService extends ContractService {
  readonly namespace = 'search' as const;

  countries(body: CountrySearchRequestBody = {}, options?: RequestOptions): Promise<CountrySearchResponse> {
    return this.httpPost({ signal: options?.signal, path: '/countrySearch', json: body, idempotent: true });
  }

  regions(body: RegionSearchRequestBody = {}, options?: RequestOptions): Promise<RegionSearchResponse> {
    return this.httpPost({ signal: options?.signal, path: '/regionSearch', json: body, idempotent: true });
  }

  districts(body: DistrictSearchRequestBody = {}, options?: RequestOptions): Promise<DistrictSearchResponse> {
    return this.httpPost({ signal: options?.signal, path: '/districtSearch', json: body, idempotent: true });
  }

  cities(body: CitySearchRequestBody = {}, options?: RequestOptions): Promise<CitySearchResponse> {
    return this.httpPost({ signal: options?.signal, path: '/citySearch', json: body, idempotent: true });
  }

  addresses(body: AddressSearchRequestBody = {}, options?: RequestOptions): Promise<AddressSearchResponse> {
    return this.httpPost({ signal: options?.signal, path: '/addressSearch', json: body, idempotent: true });
  }

  addressesByCoord(
    body: AddressSearchByCoordRequestBody,
    options?: RequestOptions,
  ): Promise<AddressSearchByCoordResponse> {
    return this.httpPost({ signal: options?.signal, path: '/addressSearchByCoord', json: body, idempotent: true });
  }

  byZipCode(zipCode: string, options?: RequestOptions): Promise<ZipCodeSearchResponse> {
    return this.httpGet({ signal: options?.signal, path: '/zipCodeSearch/{zipCode}', pathParams: { zipCode } });
  }

  branches(body: BranchSearchRequestBody = {}, options?: RequestOptions): Promise<BranchSearchResponse> {
    return this.httpPost({ signal: options?.signal, path: '/branchSearch', json: body, idempotent: true });
  }

  /** Branches within `radius` (m) of a point. */
  branchesNear(
    latitude: number,
    longitude: number,
    radius: number,
    options?: RequestOptions,
  ): Promise<BranchSearchGeoResponse> {
    return this.httpGet({
      signal: options?.signal,
      path: '/branchSearchGeo/{latitude}/{longitude}/{radius}',
      pathParams: { latitude, longitude, radius },
    });
  }

  branchTypes(options?: RequestOptions): Promise<BranchTypesResponse> {
    return this.httpGet({ signal: options?.signal, path: '/branchTypes' });
  }

  /** Payment terminals within `radius` (m) of a point. */
  payTerminals(
    latitude: number,
    longitude: number,
    radius: number,
    options?: RequestOptions,
  ): Promise<PayTerminalSearchResponse> {
    return this.httpGet({
      signal: options?.signal,
      path: '/payTerminalSearch/{latitude}/{longitude}/{radius}',
      pathParams: { latitude, longitude, radius },
    });
  }
}
