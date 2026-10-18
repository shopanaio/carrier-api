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

/** Directories: countries, regions, districts, cities, addresses, branches. All calls are reads. */
export class SearchService extends ContractService {
  readonly namespace = 'search' as const;

  countries(body: CountrySearchRequestBody = {}): Promise<CountrySearchResult> {
    return this.httpPost({ path: '/countrySearch', json: body, idempotent: true });
  }

  regions(body: RegionSearchRequestBody = {}): Promise<RegionSearchResult> {
    return this.httpPost({ path: '/regionSearch', json: body, idempotent: true });
  }

  districts(body: DistrictSearchRequestBody = {}): Promise<DistrictSearchResult> {
    return this.httpPost({ path: '/districtSearch', json: body, idempotent: true });
  }

  cities(body: CitySearchRequestBody = {}): Promise<CitySearchResult> {
    return this.httpPost({ path: '/citySearch', json: body, idempotent: true });
  }

  addresses(body: AddressSearchRequestBody = {}): Promise<AddressSearchResult> {
    return this.httpPost({ path: '/addressSearch', json: body, idempotent: true });
  }

  addressesByCoord(body: AddressSearchByCoordRequestBody): Promise<AddressSearchByCoordResult> {
    return this.httpPost({ path: '/addressSearchByCoord', json: body, idempotent: true });
  }

  byZipCode(zipCode: string): Promise<ZipCodeSearchResult> {
    return this.httpGet({ path: '/zipCodeSearch/{zipCode}', pathParams: { zipCode } });
  }

  branches(body: BranchSearchRequestBody = {}): Promise<BranchSearchResult> {
    return this.httpPost({ path: '/branchSearch', json: body, idempotent: true });
  }

  /** Branches within `radius` (m) of a point. */
  branchesNear(latitude: number, longitude: number, radius: number): Promise<BranchSearchGeoResult> {
    return this.httpGet({ path: '/branchSearchGeo/{latitude}/{longitude}/{radius}', pathParams: { latitude, longitude, radius } });
  }

  branchTypes(): Promise<BranchTypesResult> {
    return this.httpGet({ path: '/branchTypes' });
  }

  /** Payment terminals within `radius` (m) of a point. */
  payTerminals(latitude: number, longitude: number, radius: number): Promise<PayTerminalSearchResult> {
    return this.httpGet({ path: '/payTerminalSearch/{latitude}/{longitude}/{radius}', pathParams: { latitude, longitude, radius } });
  }
}
