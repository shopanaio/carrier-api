// code and comments in English
import type {
  DistrictsFilter,
  GeoSearchFilter,
  LocalitiesFilter,
  MeestDistrict,
  MeestLocalityItem,
  MeestRegion,
  MeestStreet,
  StreetsFilter,
} from '../types';
import type { RequestOptions } from '../../shared';
import { PublicService } from './base';

/** Geo reference data: regions, districts, localities, streets. */
export class GeoService extends PublicService {
  readonly namespace = 'geo' as const;

  regions(filter: GeoSearchFilter = {}, options?: RequestOptions): Promise<MeestRegion[]> {
    return this.cached(`regions:${JSON.stringify(filter)}`, () =>
      this.getJson<MeestRegion[]>('/geo_regions', searchQuery(filter), undefined, options),
    );
  }

  districts(filter: DistrictsFilter = {}, options?: RequestOptions): Promise<MeestDistrict[]> {
    return this.cached(`districts:${JSON.stringify(filter)}`, () =>
      this.getJson<MeestDistrict[]>(
        '/geo_districts',
        { ...searchQuery(filter), region_id: filter.regionId },
        undefined,
        options,
      ),
    );
  }

  /**
   * Localities as the API returns them (each item wrapped in `data`). Without a filter this is the whole register (about 6 MB, no pagination):
   * pass a `cache` in the client config and refresh it once a day.
   */
  localities(filter: LocalitiesFilter = {}, options?: RequestOptions): Promise<MeestLocalityItem[]> {
    return this.cached(`localities:${JSON.stringify(filter)}`, () =>
      this.getJson<MeestLocalityItem[]>(
        '/geo_localities',
        { ...searchQuery(filter), district_id: filter.districtId },
        undefined,
        options,
      ),
    );
  }

  /** Streets of one locality; `cityId` is mandatory. */
  streets(filter: StreetsFilter, options?: RequestOptions): Promise<MeestStreet[]> {
    return this.cached(`streets:${JSON.stringify(filter)}`, () =>
      this.getJson<MeestStreet[]>(
        '/geo_streets',
        { ...searchQuery(filter), city_id: filter.cityId },
        undefined,
        options,
      ),
    );
  }
}

function searchQuery(filter: GeoSearchFilter) {
  return { search_full: filter.searchFull, search_beginning: filter.searchBeginning };
}
