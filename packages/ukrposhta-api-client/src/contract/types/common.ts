// code and comments in English

/** Local date-time without a zone, as the API prints it: `2019-03-13T11:02:49`. */
export type UkrposhtaDateTime = string;

/** `VALUABLE_LETTER` is a registered letter of up to 2 kg (section 4.12); `INTERNATIONAL` an international shipment. */
export type ShipmentType = 'EXPRESS' | 'STANDARD' | 'DOCUMENT' | 'CARGO' | 'VALUABLE_LETTER' | 'INTERNATIONAL';

/** W2W post office to post office, W2D to door, D2W door to post office, D2D door to door. */
export type DeliveryType = 'W2W' | 'W2D' | 'D2W' | 'D2D';

export type ClientType = 'INDIVIDUAL' | 'COMPANY' | 'PRIVATE_ENTREPRENEUR';

export type PostPayPaymentType =
  | 'POSTPAY_PAYMENT_CASH_ONLY'
  | 'POSTPAY_PAYMENT_CASHLESS_ONLY'
  | 'POSTPAY_PAYMENT_CASH_AND_CASHLESS';

/** What happens when the recipient does not collect the shipment. `RETURN` is the default. */
export type OnFailReceiveType = 'RETURN' | 'RETURN_AFTER_7_DAYS' | 'RETURN_AFTER_5_DAYS' | 'PROCESS_AS_REFUSAL';

export type PaymentType = 'CASH' | 'CASHLESS' | 'CARD' | 'CARD_ON_SITE';

/** Shipment lifecycle (`lifecycle.status`). */
export type LifecycleStatus =
  | 'CREATED'
  | 'REGISTERED'
  | 'DELIVERING'
  | 'TRANSFERRED_COURIER'
  | 'IN_DEPARTMENT'
  | 'FORWARDING'
  | 'RETURNING'
  | 'RETURNED'
  | 'STORAGE'
  | 'DELIVERED'
  | 'CANCELED'
  | 'DELETED';

/** Sticker page sizes: 100 x 100 mm by default, or the same sticker on an A4 / A5 page (international stickers also A6, 10x10). */
export type StickerSize = 'SIZE_A4' | 'SIZE_A5' | 'SIZE_A6' | 'SIZE_10X10';

/** `{ message }` answers of action endpoints (add to group, add postpay recipient). */
export interface UkrposhtaMessage {
  message: string;
}

/** Per-call options every contract method accepts. */
export interface CallOptions {
  signal?: AbortSignal;
}
