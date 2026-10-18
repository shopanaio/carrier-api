// code and comments in English
import type { BranchesFilter, Coordinates, MeestBranch, NearestFilter, PublicLang } from '../types';
import type { RequestOptions } from '../../shared';
import { PublicService, joinFilter } from './base';

/** Branch register, single branch and nearest-branch lookups. */
export class BranchesService extends PublicService {
  readonly namespace = 'branches' as const;

  /** Register of branches by server-side filters. Short form unless `viewdata: 'full'`. */
  list(filter: BranchesFilter = {}, options?: RequestOptions): Promise<MeestBranch[]> {
    const query = {
      city: filter.city,
      district: filter.district,
      region: filter.region,
      type: joinFilter(filter.type),
      lang: filter.lang,
      viewdata: filter.viewdata,
    };
    return this.cached(`branches:${JSON.stringify(query)}`, () =>
      this.getJson<MeestBranch[]>('/branches', query, undefined, options),
    );
  }

  /**
   * One branch in the full form, by showcase number (`num_showcase`) or `br_id`. The API answers with a list;
   * an unknown branch is an error (code 10111).
   */
  get(numberOrId: string | number, options: RequestOptions & { lang?: PublicLang } = {}): Promise<MeestBranch[]> {
    return this.getJson<MeestBranch[]>('/branches/{id}', { lang: options.lang }, { id: String(numberOrId) }, options);
  }

  /** Up to 10 nearest branches (full form, sorted by `distance`) to a geocoded address. */
  nearestByAddress(address: string, filter: NearestFilter = {}, options?: RequestOptions): Promise<MeestBranch[]> {
    return this.getJson<MeestBranch[]>('/locator/{address}', { type: joinFilter(filter.type) }, { address }, options);
  }

  /** Up to 10 nearest branches (full form, sorted by `distance`) to a point. */
  nearestByCoords(point: Coordinates, filter: NearestFilter = {}, options?: RequestOptions): Promise<MeestBranch[]> {
    return this.getJson<MeestBranch[]>(
      '/locator/coord',
      { lat: point.lat, lng: point.lng, type: joinFilter(filter.type) },
      undefined,
      options,
    );
  }
}
