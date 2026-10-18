// code and comments in English
import type { RequestOptions } from '../../shared';
import type {
  BranchesFilter,
  Coordinates,
  MeestBranchFull,
  MeestBranchShort,
  MeestPublicEnvelope,
  NearestFilter,
  PublicLang,
} from '../types';
import { PublicService, joinFilter } from './base';

/** Branch register, single branch and nearest-branch lookups. Answers are returned exactly as Meest sends them. */
export class BranchesService extends PublicService {
  readonly namespace = 'branches' as const;

  /**
   * Register of branches by server-side filters: the short form, or the full form with `viewdata: 'full'`.
   * A filter whose `viewdata` is only known at run time (typed `BranchesFilter`) may return either form.
   */
  list(
    filter: BranchesFilter & { viewdata: 'full' },
    options?: RequestOptions,
  ): Promise<MeestPublicEnvelope<MeestBranchFull[]>>;
  list(
    filter?: BranchesFilter & { viewdata?: undefined },
    options?: RequestOptions,
  ): Promise<MeestPublicEnvelope<MeestBranchShort[]>>;
  list(
    filter: BranchesFilter,
    options?: RequestOptions,
  ): Promise<MeestPublicEnvelope<Array<MeestBranchShort | MeestBranchFull>>>;
  list(filter: BranchesFilter = {}, options?: RequestOptions): Promise<MeestPublicEnvelope<unknown>> {
    return this.getJson(
      '/branches',
      {
        city: filter.city,
        district: filter.district,
        region: filter.region,
        type: joinFilter(filter.type),
        lang: filter.lang,
        viewdata: filter.viewdata,
      },
      undefined,
      options,
    );
  }

  /** One branch in the full form, by showcase number (`num_showcase`) or `br_id`. The API answers with a list. */
  get(
    numberOrId: string | number,
    options: RequestOptions & { lang?: PublicLang } = {},
  ): Promise<MeestPublicEnvelope<MeestBranchFull[]>> {
    return this.getJson('/branches/{id}', { lang: options.lang }, { id: String(numberOrId) }, options);
  }

  /** Up to 10 nearest branches (full form, with `distance` in km) to a geocoded address. */
  nearestByAddress(
    address: string,
    filter: NearestFilter = {},
    options?: RequestOptions,
  ): Promise<MeestPublicEnvelope<MeestBranchFull[]>> {
    return this.getJson('/locator/{address}', { type: joinFilter(filter.type) }, { address }, options);
  }

  /** Up to 10 nearest branches (full form, with `distance` in km) to a point. */
  nearestByCoords(
    point: Coordinates,
    filter: NearestFilter = {},
    options?: RequestOptions,
  ): Promise<MeestPublicEnvelope<MeestBranchFull[]>> {
    return this.getJson(
      '/locator/coord',
      { lat: point.lat, lng: point.lng, type: joinFilter(filter.type) },
      undefined,
      options,
    );
  }
}
