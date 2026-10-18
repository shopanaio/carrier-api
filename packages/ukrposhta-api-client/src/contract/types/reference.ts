// code and comments in English
import type { UkrposhtaDateTime } from './common';

export interface Bank {
  code: string;
  name: string;
}

export type BarcodeKind =
  | 'SHIPMENT_BARCODE'
  | 'LETTER_BARCODE'
  | 'DELIVERY_NOTIFICATION_BARCODE'
  | 'DOCUMENT_BACK_BARCODE';

export interface BarcodeInfo {
  type: BarcodeKind;
  created: UkrposhtaDateTime;
  barcode: string;
}

/** Status of a cash-on-delivery transfer (`GET /transfers/shipment-postpays/{barcode}/with-recipient`). */
export interface PostPayTransfer {
  recipientName?: string;
  /** Number of the transfer. */
  number?: string;
  sum?: number;
  lastStatus: string;
  lastStatusNameUa?: string;
  lastStatusNameEn?: string;
  lastStatusNameRu?: string;
  lastStatusTime?: UkrposhtaDateTime;
}

/** One recipient's share of a divided cash on delivery (`GET /shipments/{id}/postPayDivide`). */
export interface PostPayDivideShare {
  uuid: string;
  created: string;
  dividedSum: number;
  postPayDeliveryDividePrice: number;
  recipient: { uuid: string; name: string; type: string; bankAccount?: string | null };
}
