/**
 * Types for waybill (express document) operations
 */

import type {
  NovaPoshtaResponse,
  NovaPoshtaRef,
  CityRef,
  CounterpartyRef,
  ContactRef,
  AddressRef,
  WarehouseRef,
  DocumentRef,
  String36,
  String50,
  PhoneNumber,
  NovaPoshtaDate,
  Weight,
  Volume,
  Dimensions,
  Cost,
  CargoDimensions,
  MoneyAmount,
  TimeInterval,
} from './base';
import {
  PaymentMethod,
  PayerType,
  CargoType,
  ServiceType,
  TimeIntervalType,
  AdditionalService,
  BackwardDeliveryType,
  DocumentType,
} from './enums';

// Base waybill properties
interface BaseWaybillProperties {
  /** Payer type */
  readonly payerType: PayerType;
  /** Payment method */
  readonly paymentMethod: PaymentMethod;
  /** Shipping date (dd.mm.yyyy) */
  readonly dateTime: NovaPoshtaDate;
  /** Cargo type */
  readonly cargoType: CargoType;
  /** Actual weight in kg (min 0.1) */
  readonly weight: Weight;
  /** Service type */
  readonly serviceType: ServiceType;
  /** Number of seats */
  readonly seatsAmount: number;
  /** Description */
  readonly description: String36;
  /** Declared value */
  readonly cost: Cost;
  /** Sender city ref */
  readonly citySender: CityRef;
  /** Sender ref */
  readonly sender: CounterpartyRef;
  /** Sender address ref */
  readonly senderAddress: AddressRef;
  /** Sender contact ref */
  readonly contactSender: ContactRef;
  /** Sender phone */
  readonly sendersPhone: PhoneNumber;
  /** Recipient city ref */
  readonly cityRecipient: CityRef;
  /** Recipient ref */
  readonly recipient: CounterpartyRef;
  /** Recipient address ref or warehouse ref */
  readonly recipientAddress: AddressRef | WarehouseRef;
  /** Recipient contact ref */
  readonly contactRecipient: ContactRef;
  /** Recipient phone */
  readonly recipientsPhone: PhoneNumber;
}

// Standard waybill creation request
export interface CreateWaybillRequest extends BaseWaybillProperties {
  /** Sender warehouse index (optional) */
  readonly senderWarehouseIndex?: String36;
  /** Recipient warehouse index (optional) */
  readonly recipientWarehouseIndex?: String36;
  /** Total volume in cubic meters (optional if OptionsSeat not provided) */
  readonly volumeGeneral?: Volume;
}

// Waybill with options (advanced features)
export interface CreateWaybillWithOptionsRequest extends BaseWaybillProperties {
  /** Sender warehouse index (optional) */
  readonly senderWarehouseIndex?: String36;
  /** Recipient warehouse index (optional) */
  readonly recipientWarehouseIndex?: String36;
  /** Total volume in cubic meters (optional if OptionsSeat provided) */
  readonly volumeGeneral?: Volume;
  /** Cargo parameters for each seat */
  readonly optionsSeat: readonly OptionsSeatItem[];
  /** RedBox barcode (uppercase required) */
  readonly redBoxBarcode?: String36;
  /** Third person payer ref (required if payerType is ThirdPerson) */
  readonly thirdPerson?: CounterpartyRef;
  /** Backward delivery data */
  readonly backwardDeliveryData?: readonly BackwardDeliveryItem[];
  /** Additional services */
  readonly additionalServices?: AdditionalServices;
}

// Postomat waybill creation (with restrictions)
export interface CreatePoshtomatWaybillRequest extends BaseWaybillProperties {
  /** Sender warehouse index (optional) */
  readonly senderWarehouseIndex?: String36;
  /** Recipient warehouse index (optional) */
  readonly recipientWarehouseIndex?: String36;
  /** Cargo parameters for each seat (required for postomat) */
  readonly optionsSeat: readonly PoshtomatOptionsSeatItem[];
  /** Cargo type must be Parcel or Documents only */
  readonly cargoType: CargoType.Parcel | CargoType.Documents;
  /** Service type must be DoorsWarehouse or WarehouseWarehouse */
  readonly serviceType: ServiceType.DoorsWarehouse | ServiceType.WarehouseWarehouse;
  /** Max declared value 10000 UAH */
  readonly cost: Cost; // max 10000
}

// Update waybill request
export interface UpdateWaybillRequest extends BaseWaybillProperties {
  /** Document ref to update */
  readonly ref: DocumentRef;
  /** Total volume in cubic meters (optional if OptionsSeat not provided) */
  readonly volumeGeneral?: Volume;
}

// Delete waybill request
export interface DeleteWaybillRequest {
  /** Document refs to delete */
  readonly documentRefs: readonly DocumentRef[];
}

// Cargo seat options
export interface OptionsSeatItem extends CargoDimensions {
  /** Weight in kg */
  readonly weight: Weight;
  /** Width in cm */
  readonly volumetricWidth: Dimensions;
  /** Length in cm */
  readonly volumetricLength: Dimensions;
  /** Height in cm */
  readonly volumetricHeight: Dimensions;
  /** Volume in cubic meters (optional) */
  readonly volumetricVolume?: Volume;
  /** Package ref (optional) */
  readonly packRef?: NovaPoshtaRef;
  /** Declared value for this seat (optional) */
  readonly cost?: Cost;
  /** Description for this seat (optional) */
  readonly description?: String36;
  /** Special cargo flag */
  readonly specialCargo?: '0' | '1';
}

// Postomat-specific seat options with restrictions
export interface PoshtomatOptionsSeatItem extends OptionsSeatItem {
  /** Max weight 20kg */
  readonly weight: Weight; // max 20
  /** Max width 40cm */
  readonly volumetricWidth: Dimensions; // max 40
  /** Max length 60cm */
  readonly volumetricLength: Dimensions; // max 60
  /** Max height 30cm */
  readonly volumetricHeight: Dimensions; // max 30
}

// Backward delivery configuration
export interface BackwardDeliveryItem {
  /** Backward delivery type */
  readonly cargoType: BackwardDeliveryType;
  /** Amount for money transfer */
  readonly amount?: Cost;
  /** Service type */
  readonly serviceType?: ServiceType;
  /** Payer type */
  readonly payerType?: PayerType;
  /** Payment method */
  readonly paymentMethod?: PaymentMethod;
}

// Additional services configuration
export interface AdditionalServices {
  /** Saturday delivery */
  readonly saturdayDelivery?: '0' | '1';
  /** Delivery by hand personally */
  readonly deliveryByHand?: '0' | '1';
  /** List of authorized recipients */
  readonly deliveryByHandRecipients?: readonly string[];
  /** Payment control amount */
  readonly afterpaymentOnGoodsCost?: Cost;
  /** Local express service */
  readonly localExpress?: '0' | '1';
  /** Time interval */
  readonly timeInterval?: TimeIntervalType;
  /** Preferred delivery date */
  readonly preferredDeliveryDate?: NovaPoshtaDate;
  /** Packing number */
  readonly packingNumber?: String36;
  /** Client internal order number */
  readonly infoRegClientBarcodes?: String36;
  /** Accompanying documents */
  readonly accompanyingDocuments?: String36;
  /** Additional information */
  readonly additionalInformation?: String36;
  /** Floor lifting (number of floors) */
  readonly numberOfFloorsLifting?: number;
  /** Floor descent (number of floors) */
  readonly numberOfFloorsDescent?: number;
  /** Elevator availability */
  readonly elevator?: '0' | '1';
  /** Piece control count */
  readonly forwardingCount?: number;
  /** RedBox barcode */
  readonly redBoxBarcode?: String36;
  /** Special cargo handling */
  readonly specialCargo?: '0' | '1';
  /** Same day delivery */
  readonly sameDayDelivery?: '0' | '1';
  /** Express waybill payment */
  readonly expressWaybillPayment?: '0' | '1';
}

// Waybill creation response
export interface WaybillCreationData {
  /** Document ref */
  readonly ref: DocumentRef;
  /** Cost on site */
  readonly costOnSite: Cost;
  /** Estimated delivery date */
  readonly estimatedDeliveryDate: NovaPoshtaDate;
  /** Internet document number */
  readonly intDocNumber: String36;
  /** Document type */
  readonly typeDocument: DocumentType;
}

export type CreateWaybillResponse = NovaPoshtaResponse<readonly WaybillCreationData[]>;

// Waybill update response
export interface WaybillUpdateData {
  /** Document ref */
  readonly ref: DocumentRef;
  /** Cost on site */
  readonly costOnSite: Cost;
  /** Estimated delivery date */
  readonly estimatedDeliveryDate: NovaPoshtaDate;
  /** Internet document number */
  readonly intDocNumber: String36;
  /** Document type */
  readonly typeDocument: DocumentType;
}

export type UpdateWaybillResponse = NovaPoshtaResponse<readonly WaybillUpdateData[]>;

// Waybill deletion response
export interface WaybillDeletionData {
  /** Deleted document ref */
  readonly ref: DocumentRef;
}

export type DeleteWaybillResponse = NovaPoshtaResponse<readonly WaybillDeletionData[]>;

// Delivery date calculation
export interface DeliveryDateRequest {
  /** Creation date time (optional) */
  readonly dateTime?: NovaPoshtaDate;
  /** Service type */
  readonly serviceType: ServiceType;
  /** Sender city ref */
  readonly citySender: CityRef;
  /** Recipient city ref */
  readonly cityRecipient: CityRef;
}

export interface DeliveryDateData {
  /** Delivery date info */
  readonly deliveryDate: {
    readonly date: string;
    readonly timezone_type: number;
    readonly timezone: string;
  };
}

export type DeliveryDateResponse = NovaPoshtaResponse<readonly DeliveryDateData[]>;

// Price calculation
export interface PriceCalculationRequest {
  /** Sender city ref */
  readonly citySender: CityRef;
  /** Recipient city ref */
  readonly cityRecipient: CityRef;
  /** Weight in kg */
  readonly weight: Weight;
  /** Service type */
  readonly serviceType: ServiceType;
  /** Declared value */
  readonly cost: Cost;
  /** Cargo type */
  readonly cargoType: CargoType;
  /** Number of seats */
  readonly seatsAmount: number;
  /** Backward delivery calculation (optional) */
  readonly redeliveryCalculate?: BackwardDeliveryCalculation;
  /** Package count (optional) */
  readonly packCount?: number;
  /** Package ref (optional) */
  readonly packRef?: NovaPoshtaRef;
  /** Amount (optional) */
  readonly amount?: number;
  /** Cargo details (optional) */
  readonly cargoDetails?: readonly CargoDetail[];
  /** Cargo description ref (optional) */
  readonly cargoDescription?: NovaPoshtaRef;
  /** Options seat (optional) */
  readonly optionsSeat?: readonly OptionsSeatItem[];
}

export interface BackwardDeliveryCalculation {
  /** Cargo type for backward delivery */
  readonly cargoType: CargoType;
  /** Amount for backward delivery */
  readonly amount: Cost;
}

export interface CargoDetail {
  /** Cargo description ref */
  readonly cargoDescription: NovaPoshtaRef;
  /** Amount */
  readonly amount: number;
}

export interface TariffZoneInfo {
  /** Tariff zone name */
  readonly tzoneName: string;
  /** Tariff zone ID */
  readonly tzoneID: string;
}

export interface PriceCalculationData {
  /** Assessed cost */
  readonly assessedCost: Cost;
  /** Delivery cost */
  readonly cost: Cost;
  /** Backward delivery cost */
  readonly costRedelivery: Cost;
  /** Tariff zone info */
  readonly tzoneInfo: TariffZoneInfo;
  /** Packing cost */
  readonly costPack: Cost;
}

export type PriceCalculationResponse = NovaPoshtaResponse<readonly PriceCalculationData[]>;

// Validation helpers
export function isValidPoshtomatDimensions(seat: OptionsSeatItem): seat is PoshtomatOptionsSeatItem {
  return seat.weight <= 20 &&
         seat.volumetricWidth <= 40 &&
         seat.volumetricLength <= 60 &&
         seat.volumetricHeight <= 30;
}

export function isValidPoshtomatCargoType(cargoType: CargoType): cargoType is CargoType.Parcel | CargoType.Documents {
  return cargoType === CargoType.Parcel || cargoType === CargoType.Documents;
}

export function isValidPoshtomatServiceType(serviceType: ServiceType): serviceType is ServiceType.DoorsWarehouse | ServiceType.WarehouseWarehouse {
  return serviceType === ServiceType.DoorsWarehouse || serviceType === ServiceType.WarehouseWarehouse;
}

export function calculateTotalWeight(seats: readonly OptionsSeatItem[]): Weight {
  return seats.reduce((total, seat) => total + seat.weight, 0) as Weight;
}

export function calculateTotalVolume(seats: readonly OptionsSeatItem[]): Volume {
  return seats.reduce((total, seat) => {
    const volume = (seat.volumetricWidth * seat.volumetricLength * seat.volumetricHeight) / 1000000; // cm³ to m³
    return total + volume;
  }, 0) as Volume;
}

// Type guards
export function hasAdditionalServices(request: CreateWaybillWithOptionsRequest): request is CreateWaybillWithOptionsRequest & { additionalServices: AdditionalServices } {
  return request.additionalServices !== undefined;
}

export function hasBackwardDelivery(request: CreateWaybillWithOptionsRequest): request is CreateWaybillWithOptionsRequest & { backwardDeliveryData: readonly BackwardDeliveryItem[] } {
  return request.backwardDeliveryData !== undefined && request.backwardDeliveryData.length > 0;
}

export function isThirdPersonPayer(request: BaseWaybillProperties): request is BaseWaybillProperties & { thirdPerson: CounterpartyRef } {
  return request.payerType === PayerType.ThirdPerson;
}