// code and comments in English
import type {
  AddressSearchByCoordRequestBody,
  AddressSearchByCoordResult,
  AddressSearchRequestBody,
  AddressSearchResult,
  BranchSearchGeoResult,
  BranchSearchRequestBody,
  BranchSearchResult,
  BranchTypesResult,
  CitySearchRequestBody,
  CitySearchResult,
  CountrySearchRequestBody,
  CountrySearchResult,
  DistrictSearchRequestBody,
  DistrictSearchResult,
  PayTerminalSearchResult,
  RegionSearchRequestBody,
  RegionSearchResult,
  ZipCodeSearchResult,
} from '../types/generated';
import { ContractService } from './base';
import type { RequestOptions } from './base';

/** Directories: countries, regions, districts, cities, addresses, branches. All calls are reads. */
export class SearchService extends ContractService {
  readonly namespace = 'search' as const;

  countries(body: CountrySearchRequestBody = {}, options?: RequestOptions): Promise<CountrySearchResult> {
    return this.httpPost({ signal: options?.signal, path: '/countrySearch', json: body, idempotent: true });
  }

  regions(body: RegionSearchRequestBody = {}, options?: RequestOptions): Promise<RegionSearchResult> {
    return this.httpPost({ signal: options?.signal, path: '/regionSearch', json: body, idempotent: true });
  }

  districts(body: DistrictSearchRequestBody = {}, options?: RequestOptions): Promise<DistrictSearchResult> {
    return this.httpPost({ signal: options?.signal, path: '/districtSearch', json: body, idempotent: true });
  }

  cities(body: CitySearchRequestBody = {}, options?: RequestOptions): Promise<CitySearchResult> {
    return this.httpPost({ signal: options?.signal, path: '/citySearch', json: body, idempotent: true });
  }

  addresses(body: AddressSearchRequestBody = {}, options?: RequestOptions): Promise<AddressSearchResult> {
    return this.httpPost({ signal: options?.signal, path: '/addressSearch', json: body, idempotent: true });
  }

  addressesByCoord(
    body: AddressSearchByCoordRequestBody,
    options?: RequestOptions,
  ): Promise<AddressSearchByCoordResult> {
    return this.httpPost({ signal: options?.signal, path: '/addressSearchByCoord', json: body, idempotent: true });
  }

  byZipCode(zipCode: string, options?: RequestOptions): Promise<ZipCodeSearchResult> {
    return this.httpGet({ signal: options?.signal, path: '/zipCodeSearch/{zipCode}', pathParams: { zipCode } });
  }

  branches(body: BranchSearchRequestBody = {}, options?: RequestOptions): Promise<BranchSearchResult> {
    return this.httpPost({ signal: options?.signal, path: '/branchSearch', json: body, idempotent: true });
  }

  /** Branches within `radius` (m) of a point. */
  branchesNear(
    latitude: number,
    longitude: number,
    radius: number,
    options?: RequestOptions,
  ): Promise<BranchSearchGeoResult> {
    return this.httpGet({
      signal: options?.signal,
      path: '/branchSearchGeo/{latitude}/{longitude}/{radius}',
      pathParams: { latitude, longitude, radius },
    });
  }

  branchTypes(options?: RequestOptions): Promise<BranchTypesResult> {
    return this.httpGet({ signal: options?.signal, path: '/branchTypes' });
  }

  /** Payment terminals within `radius` (m) of a point. */
  payTerminals(
    latitude: number,
    longitude: number,
    radius: number,
    options?: RequestOptions,
  ): Promise<PayTerminalSearchResult> {
    return this.httpGet({
      signal: options?.signal,
      path: '/payTerminalSearch/{latitude}/{longitude}/{radius}',
      pathParams: { latitude, longitude, radius },
    });
  }
}
