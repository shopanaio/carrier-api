// code and comments in English
import type { RequestOptions } from '../../shared';
import type {
  DistrictsFilter,
  GeoSearchFilter,
  LocalitiesFilter,
  MeestDistrict,
  MeestLocalityItem,
  MeestPublicEnvelope,
  MeestRegion,
  MeestStreet,
  StreetsFilter,
} from '../types';
import { PublicService } from './base';

/** Geo reference data: regions, districts, localities, streets. Answers are returned exactly as Meest sends them. */
export class GeoService extends PublicService {
  readonly namespace = 'geo' as const;

  regions(filter: GeoSearchFilter = {}, options?: RequestOptions): Promise<MeestPublicEnvelope<MeestRegion[]>> {
    return this.getJson('/geo_regions', searchQuery(filter), undefined, options);
  }

  districts(filter: DistrictsFilter = {}, options?: RequestOptions): Promise<MeestPublicEnvelope<MeestDistrict[]>> {
    return this.getJson('/geo_districts', { ...searchQuery(filter), region_id: filter.regionId }, undefined, options);
  }

  /** Localities, each item wrapped in `data`. Without a filter this is the whole register (about 6 MB, no paging). */
  localities(
    filter: LocalitiesFilter = {},
    options?: RequestOptions,
  ): Promise<MeestPublicEnvelope<MeestLocalityItem[]>> {
    return this.getJson(
      '/geo_localities',
      { ...searchQuery(filter), district_id: filter.districtId },
      undefined,
      options,
    );
  }

  /** Streets of one locality; `cityId` is mandatory. */
  streets(filter: StreetsFilter, options?: RequestOptions): Promise<MeestPublicEnvelope<MeestStreet[]>> {
    return this.getJson('/geo_streets', { ...searchQuery(filter), city_id: filter.cityId }, undefined, options);
  }
}

function searchQuery(filter: GeoSearchFilter) {
  return { search_full: filter.searchFull, search_beginning: filter.searchBeginning };
}
