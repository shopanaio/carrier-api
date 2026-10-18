// code and comments in English
import type { InternationalDataDto, PackageType, ParcelItemDto } from '../generated/types';
import type { Client } from './client';
import type {
  DeliveryType,
  LifecycleStatus,
  OnFailReceiveType,
  PaymentType,
  ShipmentType,
  UkrposhtaDateTime,
} from './common';

/** Reference to a created client; the API accepts the `uuid` only. */
export interface ClientRef {
  uuid: string;
}

/** One place of a shipment. Weight is in grams, sizes in centimeters, prices in UAH. */
export interface ParcelInput {
  /** Needed to change an existing parcel (`shipments.update`): `uuid` or `barcode`. */
  uuid?: string;
  barcode?: string;
  /** At most 32 characters. */
  name?: string;
  /** Greater than zero; at most 30 000 per parcel. DOCUMENT shipments: at most 100. */
  weight: number;
  /** The longest side. EXPRESS and STANDARD also need `width` and `height` to price by volume. */
  length: number;
  width?: number;
  height?: number;
  declaredPrice?: number;
  description?: string;
  /** Position in a multi-parcel shipment; fixes the order of parcels and stickers. */
  parcelNumber?: number;
  /** Cash on delivery of this parcel in a multi-parcel shipment; the sum must equal the shipment's `postPay`. */
  postPay?: number;
  /** Packaging of this parcel. */
  parcels_properties?: ParcelsProperties;
  /** International shipments and DOCUMENT shipments with a description of the contents. */
  parcelItems?: ParcelItemDto[] | null;
  contentsType?: 'DOCS' | 'GOODS';
}

/**
 * Packaging of one parcel (`parcels[].parcels_properties`, documentation of 02.09.2026, section 4). Added to the
 * delivery price before discounts unless `properties.packagingPaidByRecipient` is true; ignored for CARGO.
 */
export interface ParcelsProperties {
  /** Non-negative decimal with a dot, kept as given: `"10.50"`. Zero, null or absent adds nothing. */
  packagingPrice?: string | null;
  /** Packaging material code, e.g. `PACK02`. */
  KMAT?: string | null;
}

/** Extended payment and tariff parameters of a shipment (`properties`); all optional. */
export interface ShipmentProperties {
  /** True: the recipient pays for the packaging separately and it is not part of `deliveryPrice`. */
  packagingPaidByRecipient?: boolean;
  /** Buyer commission in UAH, zero or more. */
  buyer_commission?: number;
  /** Seller commission in UAH, zero or more. */
  seller_commission?: number;
  /** `2026-06-09T14:24:47`. */
  recalculationDate?: string;
  /** Uuid of an existing client the recalculation is for. */
  recalculationClient?: string;
  /** `ThirdPerson` or null. */
  payerType?: 'ThirdPerson' | null;
  /** `SUBS`. */
  tariffType?: 'SUBS';
  counterpartyRegcode?: string;
  /** For example `CASHLESS`. */
  availablePaymentTypes?: string;
}

export interface Parcel extends ParcelInput {
  uuid: string;
  barcode: string;
  autoSortingLine?: boolean | null;
}

export interface PostPayDivision {
  recipientUuid: string;
  /** Share of the cash on delivery for this recipient, at least 1. */
  sum: number;
}

/**
 * Body of `POST /shipments`. `sender` and `recipient` are uuids of clients created earlier.
 * Prices are in UAH, weights in grams, sizes in centimeters.
 */
export interface ShipmentInput {
  sender: ClientRef;
  recipient: ClientRef;
  deliveryType: DeliveryType;
  parcels: ParcelInput[];
  /** EXPRESS by default. */
  type?: ShipmentType;
  senderAddressId?: number | string;
  recipientAddressId?: number | string;
  /** Address to return the shipment to; one of the sender's addresses. */
  returnAddressId?: number | string;
  /** An extra recipient phone; it must match one of the recipient's phones. */
  recipientPhone?: string;
  recipientEmail?: string;
  /** Post office to register the shipment in, for a correct price. */
  dropOffPostcode?: string;
  externalId?: string;
  /** At most 40 characters. */
  description?: string;
  /** True: the recipient pays for delivery, false (default): the sender. */
  paidByRecipient?: boolean;
  /** Cash on delivery in UAH, not above the declared price. */
  postPay?: number;
  postPayPaidByRecipient?: boolean;
  transferPostPayToBankAccount?: boolean;
  transferPostPayToCard?: boolean;
  postPayRecipientUuid?: string;
  postPayDivide?: PostPayDivision[];
  onFailReceiveType?: OnFailReceiveType;
  returnAfterStorageDays?: number;
  returnShipmentType?: 'STANDARD' | 'EXPRESS';
  bulky?: boolean;
  fragile?: boolean;
  bees?: boolean;
  sms?: boolean;
  documentBack?: boolean;
  checkOnDelivery?: boolean;
  packedBySender?: boolean;
  withDeliveryNotification?: boolean;
  withEmailDeliveryNotification?: boolean;
  partialReceiptAllowed?: boolean;
  ascentToTheFloor?: boolean;
  listOfEnclosedItems?: boolean;
  shipmentGroupUuid?: string;
  properties?: ShipmentProperties;
  /** International shipments (see the international documentation): package type, currency and customs data. */
  packageType?: PackageType;
  international?: boolean;
  internationalData?: InternationalDataDto;
  currencyCode?: string;
  postPayCurrencyCode?: string;
}

/** Body of `PUT /shipments/{uuid}`: any subset of the creation fields; a parcel is addressed by `uuid` or `barcode`. */
export type ShipmentPatch = Partial<Omit<ShipmentInput, 'sender' | 'recipient'>>;

export interface ShipmentDiscount {
  uuid: string;
  name: string;
  fromDate: string;
  toDate: string;
  value: number;
  category: string;
  type: 'BASE' | 'MODIFIER';
}

export interface ShipmentLifecycle {
  status: LifecycleStatus;
  statusDate: UkrposhtaDateTime;
}

export interface ShipmentDirection {
  regionSortingCenter?: string;
  districtSortingCenter?: string;
  postOfficeName?: string;
  postOfficeNumber?: string;
}

export interface Shipment {
  uuid: string;
  type: ShipmentType;
  sender: Client;
  recipient: Client;
  senderAddressId: number;
  recipientAddressId: number;
  returnAddressId: number;
  recipientPhone?: string | null;
  recipientEmail?: string | null;
  dropOffPostcode?: string | null;
  shipmentGroupUuid: string | null;
  externalId: string | null;
  deliveryType: DeliveryType;
  onFailReceiveType: OnFailReceiveType;
  /** Barcode of the shipment; for a multi-parcel shipment, of the first parcel. */
  barcode: string;
  weight: number;
  length: number;
  width?: number | null;
  height?: number | null;
  declaredPrice: number | null;
  /** Price in UAH with discounts. */
  deliveryPrice: number;
  rawDeliveryPrice?: number;
  returnDeliveryPrice?: number;
  postPay: number | null;
  postPayUah?: number;
  postPayDeliveryPrice?: number;
  discounts: ShipmentDiscount[];
  lastModified: UkrposhtaDateTime;
  description: string | null;
  parcels: Parcel[];
  direction?: ShipmentDirection;
  lifecycle: ShipmentLifecycle;
  /** Estimated delivery date. */
  deliveryDate?: UkrposhtaDateTime | null;
  calculationDescription?: string;
  paidByRecipient: boolean;
  postPayPaidByRecipient?: boolean;
  bulky?: boolean;
  fragile?: boolean;
  bees?: boolean;
  sms?: boolean;
  documentBack?: boolean;
  checkOnDelivery?: boolean;
  transferPostPayToBankAccount?: boolean;
  deliveryPricePaid?: boolean;
  postPayPaid?: boolean;
  postPayDeliveryPricePaid?: boolean;
  packedBySender?: boolean;
  availablePaymentTypes?: PaymentType[];
  withDeliveryNotification?: boolean;
  free?: boolean;
  listOfEnclosedItems?: boolean;
}

/** `GET /shipments/{id}/lifecycle`. */
export interface ShipmentLifecycleInfo {
  shipmentUuid: string;
  shipmentBarcode: string;
  status: LifecycleStatus;
  statusDate: UkrposhtaDateTime;
}

/** Fields readable through `POST /shipments/{id}` with a field list. */
export type ShipmentField = keyof Shipment;
