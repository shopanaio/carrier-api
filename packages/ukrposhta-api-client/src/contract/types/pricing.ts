// code and comments in English
import type { DeliveryType, ShipmentType, UkrposhtaDateTime } from './common';

export type TariffZone =
  | 'REGION_CENTER'
  | 'REGION'
  | 'COUNTRY'
  | 'POSTOFFICE'
  | 'ZONE_0'
  | 'ZONE_1'
  | 'ZONE_2'
  | 'ZONE_3';

export interface Tariff {
  uuid: string;
  /** Upper weight bound in grams. */
  weight: number;
  /** Upper length bound in centimeters. */
  length: number;
  shipmentType: ShipmentType;
  w2wVariation: TariffZone;
  price: number;
  pricePerKg: number;
  fromDate: UkrposhtaDateTime;
  toDate: UkrposhtaDateTime;
}

export interface PriceParcel {
  weight: number;
  length: number;
  width?: number;
  height?: number;
  declaredPrice?: number;
  /** Packaging price of the parcel in UAH (non-negative, decimal point). */
  packagingPrice?: number;
  /** The same flag as on the request, for this parcel. */
  packagingPaidByRecipient?: boolean;
}

export interface PriceDiscount {
  description?: string;
  /** Percent, not negative. */
  rate: number;
}

/** Body of `POST /domestic/delivery-price`. Postcodes are the delivery zone codes of the addresses. */
export interface DeliveryPriceRequest {
  addressFrom: { postcode: string; conglomerationPostcode?: string | null };
  addressTo: { postcode: string; conglomerationPostcode?: string | null };
  type: ShipmentType;
  deliveryType: DeliveryType;
  /** Total weight in grams; also the weight of the one parcel when `parcels` is omitted. */
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  parcels?: PriceParcel[];
  declaredPrice?: number;
  /** True: the packaging is paid by the recipient and left out of the price. Allowed on the request or on a parcel. */
  packagingPaidByRecipient?: boolean;
  postPay?: number;
  transferPostPayToCard?: boolean;
  discounts?: PriceDiscount[];
  sms?: boolean;
  documentBack?: boolean;
  /** Required when `documentBack` is true. */
  documentBackDeliveryType?: DeliveryType;
  withDeliveryNotification?: boolean;
  withEmailDeliveryNotification?: boolean;
  ascentToTheFloor?: boolean;
  lift?: boolean;
  floor?: number;
  listOfEnclosedItems?: boolean;
  /** True: also check the shipment against the restrictions of its type. */
  validate?: boolean;
  returnDeliveryPrice?: number;
  /** Tariff and surcharge tokens, price ratios and the totals of the measurables, as the documentation example shows. */
  tariffToken?: string | null;
  surchargeTariffToken?: string | null;
  lengthOverpayRatio?: number | null;
  returnDeliveryPriceRatio?: number | null;
  returnDeliveryPriceValue?: number | null;
  recalculation?: boolean;
  w2wVariation?: TariffZone;
  isMobilePostOfficeDelivery?: boolean | null;
  measurablesTotalWeight?: number;
  measurablesMaxLength?: number;
  measurablesMaxWidth?: number;
  measurablesMaxHeight?: number;
  volume?: number;
  specialTariff?: boolean;
  declaredPriceSurcharge?: number;
}

export interface DeliveryPrice {
  /** Delivery price in UAH with discounts. */
  deliveryPrice: number;
  rawDeliveryPrice: number;
  calculationDescription: string;
  postPayDeliveryPrice?: number;
  returnDeliveryPrice?: number;
  declaredPriceSurcharge?: number;
  w2wVariation?: TariffZone;
  isMobilePostOfficeDelivery?: boolean;
  conglomerationPostcode?: string;
  recalculation?: boolean;
  specialTariff?: boolean;
  parcels?: Array<PriceParcel & { isAutoSortingLine?: boolean | null; volume?: number }>;
}
