import { BaseService } from './baseService';
import type {
  AddressSearchByCoordRequestBody,
  AddressSearchByCoordResult,
  AddressSearchRequestBody,
  AddressSearchResult,
  BranchSearchGeoPathParams,
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
  PayTerminalSearchPathParams,
  PayTerminalSearchResult,
  RegionSearchRequestBody,
  RegionSearchResult,
  ZipCodeSearchPathParams,
  ZipCodeSearchResult,
} from '../types/search';

function buildPath(path: string, params: Array<string | number>): string {
  const encodedSegments = params.map((segment) => encodeURIComponent(String(segment)));
  return `${path}/${encodedSegments.join('/')}`.replace(/\/+$/, '');
}

export class SearchService extends BaseService {
  readonly namespace = 'search' as const;

  async countrySearch(filters: CountrySearchRequestBody = {}): Promise<CountrySearchResult> {
    return this.send<CountrySearchResult>({
      method: 'POST',
      path: '/countrySearch',
      body: filters,
    });
  }

  async regionSearch(filters: RegionSearchRequestBody = {}): Promise<RegionSearchResult> {
    return this.send<RegionSearchResult>({
      method: 'POST',
      path: '/regionSearch',
      body: filters,
    });
  }

  async districtSearch(filters: DistrictSearchRequestBody = {}): Promise<DistrictSearchResult> {
    return this.send<DistrictSearchResult>({
      method: 'POST',
      path: '/districtSearch',
      body: filters,
    });
  }

  async citySearch(filters: CitySearchRequestBody = {}): Promise<CitySearchResult> {
    return this.send<CitySearchResult>({
      method: 'POST',
      path: '/citySearch',
      body: filters,
    });
  }

  async zipCodeSearch(params: ZipCodeSearchPathParams): Promise<ZipCodeSearchResult> {
    const path = buildPath('/zipCodeSearch', [params.zipCode]);
    return this.send<ZipCodeSearchResult>({
      method: 'GET',
      path,
    });
  }

  async addressSearch(body: AddressSearchRequestBody = {}): Promise<AddressSearchResult> {
    return this.send<AddressSearchResult>({
      method: 'POST',
      path: '/addressSearch',
      body,
    });
  }

  async addressSearchByCoord(body: AddressSearchByCoordRequestBody): Promise<AddressSearchByCoordResult> {
    return this.send<AddressSearchByCoordResult>({
      method: 'POST',
      path: '/addressSearchByCoord',
      body,
    });
  }

  async branchTypes(): Promise<BranchTypesResult> {
    return this.send<BranchTypesResult>({
      method: 'GET',
      path: '/branchTypes',
    });
  }

  async branchSearch(filters: BranchSearchRequestBody = {}): Promise<BranchSearchResult> {
    return this.send<BranchSearchResult>({
      method: 'POST',
      path: '/branchSearch',
      body: filters,
    });
  }

  async branchSearchGeo(params: BranchSearchGeoPathParams): Promise<BranchSearchGeoResult> {
    const path = buildPath('/branchSearchGeo', [params.latitude, params.longitude, params.radius]);
    return this.send<BranchSearchGeoResult>({
      method: 'GET',
      path,
    });
  }

  async payTerminalSearch(params: PayTerminalSearchPathParams): Promise<PayTerminalSearchResult> {
    const path = buildPath('/payTerminalSearch', [params.latitude, params.longitude, params.radius]);
    return this.send<PayTerminalSearchResult>({
      method: 'GET',
      path,
    });
  }
}
