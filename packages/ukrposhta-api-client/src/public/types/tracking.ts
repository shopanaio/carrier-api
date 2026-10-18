// code and comments in English

/** One tracking event as returned by the status-tracking service. */
export interface UkrposhtaStatusEvent {
  barcode: string;
  step: number;
  /** Local date-time without zone, e.g. `2017-07-27T16:33:00`. */
  date: string;
  /** Post office index. */
  index: string | null;
  /** Post office name. */
  name: string | null;
  /** Event code; a number in most answers, a string in `with-not-found` answers. */
  event: number | string;
  eventName: string | null;
  country: string | null;
  eventReason: string | null;
  eventReason_id: number | null;
  /** Shipment type id (Annex A of the tracking documentation). */
  mailType: number | null;
  indexOrder: number | null;
}

export interface UkrposhtaStatusesWithNotFound {
  found: Record<string, UkrposhtaStatusEvent[]>;
  notFound: string[];
}

export interface UkrposhtaPhoneStatusRequest {
  barcode: string;
  recipientPhoneNumber: string;
}

export interface UkrposhtaRoute {
  from: string;
  to: string;
}

export type UkrposhtaLanguage = 'ua' | 'en';
