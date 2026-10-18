// code and comments in English
import type { LetterDto, PackageType } from '../generated/types';
import type { UkrposhtaDateTime } from './common';

// ---- Letter tariffs (letters documentation of 07.10.2026, section 3) ----

export type LetterPriority = 'PRIORITY' | 'NOT_PRIORITY';

export interface LetterTariff {
  uuid: string;
  priority: LetterPriority;
  /** Weight range in grams. */
  rangeFrom: number;
  rangeTo: number;
  price: number;
  vat: number;
  /** `YYYY-MM-DD`. */
  fromDate: string;
  toDate: string | null;
}

export interface LetterSurchargeTariff {
  uuid: string;
  /** `DELIVERY_NOTIFICATION`, `RECOMMENDED`, `SMS`, ... */
  surchargeType: string;
  price: number;
  vat: number;
  fromDate: string;
  toDate?: string | null;
}

// ---- International tariffs (international documentation of 16.10.2026, section 6) ----

export interface InternationalParcelTariff {
  id: number;
  /** Grams. */
  weight: number;
  /** Prices in US dollars. */
  priceBase: number;
  priceGround: number;
  priceAvia: number;
  /** Percent of the weight tariff. */
  priceBulky: number;
  declaredStatusSurcharge: number;
  expeditionSurcharge: number;
  /** Percent of the declared price. */
  declaredPriceSurcharge: number;
  countryISO3166: string;
  fromDate: UkrposhtaDateTime;
  /** True for parcels with a declared value above 10 kg. */
  isCommercial: boolean;
}

export interface InternationalWrapperTariff {
  id: number;
  packageType: 'LETTER' | 'SMALL_BAG';
  /** Grams. */
  weight: number;
  /** Prices in US dollars. */
  priceGround: number;
  priceAvia: number;
  recommendedSurcharge: number;
  declaredStatusSurcharge: number;
  declaredPriceSurcharge: number;
  tariffZoneCode: string;
  fromDate: UkrposhtaDateTime;
}

// ---- Countries ----

export type TransportType = 'AVIA' | 'GROUND';

/** Answer of `GET /countries/delivery-availability`. */
export interface DeliveryAvailability {
  country: string;
  packageType: PackageType;
  transportType: TransportType;
  available: boolean;
}

/** One entry of `GET /countries/delivery-types-availability`. */
export interface DeliveryTypeAvailability {
  packageType: PackageType;
  transportType: TransportType;
}

// ---- Forms 119e and 20e (electronic delivery notification) ----

export type DeliveredType = 'PERSONALLY' | 'FAMILY_MEMBER' | 'WARRANTY_PERSON';

/** Body of `POST .../form119e`. `recipientName` is required for `FAMILY_MEMBER` and `WARRANTY_PERSON`. */
export interface Form119eRequest {
  /** Uuid or barcode of a shipment or letter with `withEmailDeliveryNotification: true`. */
  idcode: string;
  deliveredType: DeliveredType;
  /** `dd.MM.yyyy`. */
  deliveredDate: string;
  recipientName?: string;
}

export type StorageReason =
  | 'WRONG_ADDRESS'
  | 'ADDRESSEE_MISSING'
  | 'REFUSAL_ADDRESSEE'
  | 'SENDERS_REQUESTED'
  | 'RECIPIENT_REQUESTED'
  | 'EXPIRY'
  | 'OTHERS';

export type ReturnReason = 'EXPIRY' | 'REFUSAL_RECEIVE' | 'OTHERS';

/** Body of `POST .../form20e`. */
export interface Form20eRequest {
  idcode: string;
  deliveredStates: Array<{
    /** `returned` (not delivered) or `storage` (in storage). */
    stateDeliveredType: 'returned' | 'storage';
    properties: { ReasonStorage?: StorageReason; ReasonReturned?: ReturnReason };
  }>;
}

/** `frmOption`: 0 returns a ZIP archive, 1 a PDF. */
export type FormOption = 0 | 1;

// ---- Delivery notifications ----

/** One entry of the answer of `POST /shipments/delivery-notification`. */
export interface ShipmentDeliveryNotificationBarcodes {
  shipmentBarcode: string;
  deliveryNotificationBarcode: string;
}

/** Body of `POST /signed-notifications/{clientUuid}/batch`. */
export interface SignedNotificationsRequest {
  /** `YYYY-MM-DD`. */
  dateFrom: string;
  dateTo: string;
  barcodes?: string[];
  dispatchType?: 'LETTER' | 'SHIPMENT';
  /** `ZIP` answers an archive (several archives come as multipart/form-data), `JSON` the data. */
  responseType?: 'ZIP' | 'JSON';
}

// ---- Bonus shipments ----

export interface FreeShipments {
  type: string;
  fromDate: UkrposhtaDateTime;
  toDate: UkrposhtaDateTime;
  freeShipmentsType: string;
  freeShipmentsGrantedType: string;
  limit: number;
  usedShipments: unknown[];
}

// ---- Payments with an electronic stamp ----

export interface PaymentBalance {
  balance: number;
  edrpou: string;
}

/** Body of `POST /payments/payments-bank-account/payment`: `amount` is the sum with VAT for all letters. */
export interface EstampPaymentRequest {
  amount: number;
  edrpou: string;
  clientUuid: string;
  barcodes: string[];
}

/** Body of `POST /payments-bank-account/payment-international`. */
export interface InternationalEstampPaymentRequest {
  balance: number;
  edrpou: string;
  clientUuid: string;
  barcodes: string[];
}

/** Body of `PUT /payments/letters/estamp/paid-cashless`. */
export interface EstampCashlessPaymentRequest {
  type: 'DOMESTICAL' | 'INTERNATIONAL';
  clientUuid: string;
  amount: number;
  barcodes: string[];
}

/** Body of `POST /payments/payments-bank-account/by-letter-group`. */
export interface LetterGroupPaymentRequest {
  letterGroupUuid: string;
}

/** Envelope sizes of `GET /letters/domestic/{letterUuid}/e-stamp`. */
export type EnvelopeSize = 'LETTER_110_X_220' | 'LETTER_114_X_162' | 'LETTER_162_X_229' | 'LETTER_229_X_324';

/** One element of the answer of `POST /letters/domestic/groups/{letterGroupUuid}/letters/async`. */
export interface LetterInGroupCreation {
  letter: LetterDto;
  result: {
    status: 'SUCCESS' | 'FAILURE';
    details: string;
  };
}
