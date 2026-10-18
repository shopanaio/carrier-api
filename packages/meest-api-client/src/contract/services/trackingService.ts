// code and comments in English
import { formatDateTime, formatIsoDate } from '../dates';
import type { DateInput } from '../dates';
import type {
  ParcelInfoTrackingResult,
  TrackingByDateResult,
  TrackingByPeriodResult,
  TrackingDeliveredResult,
  TrackingResult,
} from '../types/generated';
import { ContractService } from './base';
import type { RequestOptions } from './base';

const MAX_PERIOD_MS = 2 * 3_600_000;

export class TrackingService extends ContractService {
  readonly namespace = 'tracking' as const;

  /** Events of one parcel by barcode or parcel number. Empty until Meest receives the parcel. */
  byNumber(trackNumber: string, options?: RequestOptions): Promise<TrackingResult> {
    return this.httpGet({ signal: options?.signal, path: '/tracking/{trackNumber}', pathParams: { trackNumber } });
  }

  parcelInfo(parcelId: string, options?: RequestOptions): Promise<ParcelInfoTrackingResult> {
    return this.httpGet({
      signal: options?.signal,
      path: '/parcelInfoTracking/{parcelID}',
      pathParams: { parcelID: parcelId },
    });
  }

  /** Events of a day (`yyyy-MM-dd`, Kyiv time for a Date). */
  byDate(date: DateInput, options?: RequestOptions): Promise<TrackingByDateResult> {
    return this.httpGet({
      signal: options?.signal,
      path: '/trackingByDate/{searchDate}',
      pathParams: { searchDate: formatIsoDate(date) },
    });
  }

  /** Events in a window of at most two hours from `dateFrom` (checked here when both bounds are `Date`s). */
  byPeriod(dateFrom: DateInput, dateTo: DateInput, options?: RequestOptions): Promise<TrackingByPeriodResult> {
    if (dateFrom instanceof Date && dateTo instanceof Date) {
      const span = dateTo.getTime() - dateFrom.getTime();
      if (span < 0 || span > MAX_PERIOD_MS)
        throw new RangeError('tracking.byPeriod accepts a window of at most two hours');
    }
    return this.httpGet({
      signal: options?.signal,
      path: '/trackingByPeriod/{dateFrom}/{dateTo}',
      pathParams: { dateFrom: formatDateTime(dateFrom), dateTo: formatDateTime(dateTo) },
    });
  }

  /**
   * Delivered parcels, 150 per page starting at 1. Both bounds are sent as `yyyy-MM-dd HH:mm:ss`; the Swagger
   * documents `dateTo` as `dd.MM.yyyy HH:mm`, so pass a string in that form if the server rejects the default.
   */
  delivered(
    dateFrom: DateInput,
    dateTo: DateInput,
    page = 1,
    options?: RequestOptions,
  ): Promise<TrackingDeliveredResult> {
    return this.httpGet({
      signal: options?.signal,
      path: '/trackingDelivered/{dateFrom}/{dateTo}/{page}',
      pathParams: { dateFrom: formatDateTime(dateFrom), dateTo: formatDateTime(dateTo), page },
    });
  }

  /** Walks `delivered` page by page until an empty page. */
  async *iterateDelivered(
    dateFrom: DateInput,
    dateTo: DateInput,
    options?: RequestOptions,
  ): AsyncGenerator<TrackingDeliveredResult[number]> {
    for (let page = 1; ; page += 1) {
      const items = await this.delivered(dateFrom, dateTo, page, options);
      if (items.length === 0) return;
      yield* items;
      if (items.length < 150) return;
    }
  }
}
