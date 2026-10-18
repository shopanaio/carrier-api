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

/** Answer of `GET /extra-statuses/inside/last`: the event plus sizes (cm), weight (g) and payment data of the shipment. */
export interface UkrposhtaExtendedStatusEvent extends UkrposhtaStatusEvent {
  height: number | null;
  length: number | null;
  weight: number | null;
  width: number | null;
  /** Amount paid for the shipment. */
  payment: number | null;
  sendingPaymentSum: number | null;
  /** Who pays for sending: a payer code of the carrier. */
  sendingPayerCode: number | null;
  indexFrom: string | null;
  indexTo: string | null;
  addresseePhoneNum: string | null;
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
