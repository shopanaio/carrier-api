// code and comments in English
import type { ClientContext } from '@shopana/carrier-core';
import type { UkrposhtaPublicConfig } from '../config';
import type {
  UkrposhtaExtendedStatusEvent,
  UkrposhtaLanguage,
  UkrposhtaPhoneStatusRequest,
  UkrposhtaRoute,
  UkrposhtaStatusEvent,
  UkrposhtaStatusesWithNotFound,
} from '../types/tracking';

export type UkrposhtaTrackingContext = ClientContext<UkrposhtaPublicConfig>;

export interface TrackingCallOptions {
  /** Language of event names. The service answers in Ukrainian by default. */
  lang?: UkrposhtaLanguage;
  signal?: AbortSignal;
}

/** Documented limits per request. The client does not enforce them: the service answers an error. */
export const TRACKING_MAX_BARCODES_ALL_STATUSES = 50;
export const TRACKING_MAX_BARCODES_LAST_STATUS = 100;

/** Status-tracking service (`/status-tracking/0.0.1`), authorized with the tracking bearer only. */
export class TrackingService {
  readonly namespace = 'tracking' as const;
  private ctx!: UkrposhtaTrackingContext;

  attach(ctx: UkrposhtaTrackingContext) {
    this.ctx = ctx;
  }

  /** `GET /statuses?barcode=` — every event of one shipment. */
  getStatuses(barcode: string, options: TrackingCallOptions = {}): Promise<UkrposhtaStatusEvent[]> {
    return this.ctx.http.request<UkrposhtaStatusEvent[]>({
      method: 'GET',
      path: '/statuses',
      query: { barcode, lang: options.lang },
      signal: options.signal,
    });
  }

  /** `GET /statuses/last?barcode=` — the latest event of one shipment. */
  getLastStatus(barcode: string, options: TrackingCallOptions = {}): Promise<UkrposhtaStatusEvent> {
    return this.ctx.http.request<UkrposhtaStatusEvent>({
      method: 'GET',
      path: '/statuses/last',
      query: { barcode, lang: options.lang },
      signal: options.signal,
    });
  }

  /** `POST /statuses` — every event of up to 50 shipments, as one flat list. */
  getStatusesBatch(barcodes: string[], options: TrackingCallOptions = {}): Promise<UkrposhtaStatusEvent[]> {
    return this.post<UkrposhtaStatusEvent[]>('/statuses', barcodes, options);
  }

  /** `POST /statuses/with-not-found` — like `getStatusesBatch`, plus the barcodes the service does not know. */
  getStatusesBatchWithNotFound(
    barcodes: string[],
    options: TrackingCallOptions = {},
  ): Promise<UkrposhtaStatusesWithNotFound> {
    return this.post<UkrposhtaStatusesWithNotFound>('/statuses/with-not-found', barcodes, options);
  }

  /** `POST /statuses/last` — the latest event of up to 100 shipments. */
  getLastStatusesBatch(barcodes: string[], options: TrackingCallOptions = {}): Promise<UkrposhtaStatusEvent[]> {
    return this.post<UkrposhtaStatusEvent[]>('/statuses/last', barcodes, options);
  }

  /** `POST /statuses/last/with-not-found` — latest events plus the barcodes the service does not know. */
  getLastStatusesBatchWithNotFound(
    barcodes: string[],
    options: TrackingCallOptions = {},
  ): Promise<UkrposhtaStatusesWithNotFound> {
    return this.post<UkrposhtaStatusesWithNotFound>('/statuses/last/with-not-found', barcodes, options);
  }

  /** `GET /extra-statuses/inside/last` — the latest event by barcode and phone, with sizes, weight and payment data. */
  getLastStatusInsideByPhone(
    request: UkrposhtaPhoneStatusRequest,
    options: Pick<TrackingCallOptions, 'signal'> = {},
  ): Promise<UkrposhtaExtendedStatusEvent> {
    return this.ctx.http.request<UkrposhtaExtendedStatusEvent>({
      method: 'GET',
      path: '/extra-statuses/inside/last',
      query: { barcode: request.barcode, recipientPhoneNumber: request.recipientPhoneNumber },
      signal: options.signal,
    });
  }

  /** `GET /extra-statuses/last` — the latest event by barcode and the recipient's phone number. */
  getLastStatusByPhone(
    request: UkrposhtaPhoneStatusRequest,
    options: Pick<TrackingCallOptions, 'signal'> = {},
  ): Promise<UkrposhtaStatusEvent> {
    return this.ctx.http.request<UkrposhtaStatusEvent>({
      method: 'GET',
      path: '/extra-statuses/last',
      query: { barcode: request.barcode, recipientPhoneNumber: request.recipientPhoneNumber },
      signal: options.signal,
    });
  }

  /** `POST /extra-statuses/last` — events by a list of barcode and recipient phone pairs. */
  getStatusesByPhoneBatch(
    requests: UkrposhtaPhoneStatusRequest[],
    options: Pick<TrackingCallOptions, 'signal'> = {},
  ): Promise<UkrposhtaStatusEvent[]> {
    return this.ctx.http.request<UkrposhtaStatusEvent[]>({
      method: 'POST',
      path: '/extra-statuses/last',
      json: requests,
      idempotent: true,
      signal: options.signal,
    });
  }

  /** `GET /barcodes/{barcode}/route[/in-lang/{EN|UA}]` — origin and destination of a shipment. */
  getRoute(barcode: string, options: TrackingCallOptions = {}): Promise<UkrposhtaRoute> {
    const suffix = options.lang === 'en' ? '/in-lang/EN' : options.lang === 'ua' ? '/in-lang/UA' : '';
    return this.ctx.http.request<UkrposhtaRoute>({
      method: 'GET',
      path: `/barcodes/{barcode}/route${suffix}`,
      pathParams: { barcode },
      signal: options.signal,
    });
  }

  private post<T>(path: string, barcodes: string[], options: TrackingCallOptions): Promise<T> {
    return this.ctx.http.request<T>({
      method: 'POST',
      path,
      query: { lang: options.lang },
      json: barcodes,
      // Reading statuses does not change anything, so a repeat after a 5xx is safe.
      idempotent: true,
      signal: options.signal,
    });
  }
}
