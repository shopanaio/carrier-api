// code and comments in English
import { CarrierError, CarrierErrorCategory } from '@shopana/carrier-core';
import { MEEST_PUBLIC_CARRIER } from '../errors';
import type { BranchQuery, BranchesFilter, Coordinates, MeestBranch, NearestFilter, PublicLang } from '../types';
import { PublicService, joinFilter } from './base';

/** Branch register, single branch and nearest-branch lookups. */
export class BranchesService extends PublicService {
  readonly namespace = 'branches' as const;

  /** Register of branches by server-side filters. Short form unless `viewdata: 'full'`. */
  list(filter: BranchesFilter = {}): Promise<MeestBranch[]> {
    const query = {
      city: filter.city,
      district: filter.district,
      region: filter.region,
      type: joinFilter(filter.type),
      lang: filter.lang,
      viewdata: filter.viewdata,
    };
    return this.cached(`branches:${JSON.stringify(query)}`, () => this.listJson<MeestBranch>('/branches', query));
  }

  /**
   * One branch in the full form, by showcase number (`num_showcase`) or `br_id`.
   * Throws a not_found CarrierError when the API knows no such branch.
   */
  async get(numberOrId: string | number, options: { lang?: PublicLang } = {}): Promise<MeestBranch> {
    const items = await this.getJson<MeestBranch[]>('/branches/{id}', { lang: options.lang }, { id: String(numberOrId) });
    const branch = items[0];
    if (!branch) {
      throw new CarrierError({
        carrier: MEEST_PUBLIC_CARRIER,
        code: 'EMPTY_RESULT',
        message: `Meest returned no branch for ${numberOrId}`,
        category: CarrierErrorCategory.NotFound,
      });
    }
    return branch;
  }

  /** Up to 10 nearest branches (full form, sorted by `distance`) to a geocoded address. */
  nearestByAddress(address: string, filter: NearestFilter = {}): Promise<MeestBranch[]> {
    return this.listJson<MeestBranch>('/locator/{address}', { type: joinFilter(filter.type) }, { address });
  }

  /** Up to 10 nearest branches (full form, sorted by `distance`) to a point. */
  nearestByCoords(point: Coordinates, filter: NearestFilter = {}): Promise<MeestBranch[]> {
    return this.listJson<MeestBranch>('/locator/coord', { lat: point.lat, lng: point.lng, type: joinFilter(filter.type) });
  }

  /** Filters the short register on the client; combine with a `cache` so the register is downloaded once. */
  async find(query: BranchQuery, filter: BranchesFilter = {}): Promise<MeestBranch[]> {
    const all = await this.list(filter);
    return all.filter(b => {
      if (query.cityId && b.city_id !== query.cityId) return false;
      if (query.typeId && b.type_id !== query.typeId) return false;
      if (query.minParcelMaxKg !== undefined) {
        const max = Number(b.parcel_max_kg ?? 0);
        if (max !== 0 && max < query.minParcelMaxKg) return false;
      }
      return true;
    });
  }
}
