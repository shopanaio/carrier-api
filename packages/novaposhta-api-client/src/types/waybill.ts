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
  readonly PayerType: PayerType;
  /** Payment method */
  readonly PaymentMethod: PaymentMethod;
  /** Shipping date (dd.mm.yyyy) */
  readonly DateTime: NovaPoshtaDate;
  /** Cargo type */
  readonly CargoType: CargoType;
  /** Actual weight in kg (min 0.1) */
  readonly Weight: Weight;
  /** Service type */
  readonly ServiceType: ServiceType;
  /** Number of seats */
  readonly SeatsAmount: number;
  /** Description */
  readonly Description: String36;
  /** Declared value */
  readonly Cost: Cost;
  /** Sender city ref */
  readonly CitySender: CityRef;
  /** Sender ref */
  readonly Sender: CounterpartyRef;
  /** Sender address ref */
  readonly SenderAddress: AddressRef;
  /** Sender contact ref */
  readonly ContactSender: ContactRef;
  /** Sender phone */
  readonly SendersPhone: PhoneNumber;
  /** Recipient city ref */
  readonly CityRecipient: CityRef;
  /** Recipient ref */
  readonly Recipient: CounterpartyRef;
  /** Recipient address ref or warehouse ref */
  readonly RecipientAddress: AddressRef | WarehouseRef;
  /** Recipient contact ref */
  readonly ContactRecipient: ContactRef;
  /** Recipient phone */
  readonly RecipientsPhone: PhoneNumber;
}

// Standard waybill creation request
export interface CreateWaybillRequest extends BaseWaybillProperties {
  /** Sender warehouse index (optional) */
  readonly SenderWarehouseIndex?: String36;
  /** Recipient warehouse index (optional) */
  readonly RecipientWarehouseIndex?: String36;
  /** Total volume in cubic meters (optional if OptionsSeat not provided) */
  readonly VolumeGeneral?: Volume;
  /** Cargo parameters; required by Nova Poshta for sender postomats */
  readonly OptionsSeat?: readonly OptionsSeatInput[];
}

// Waybill with options (advanced features)
export interface CreateWaybillWithOptionsRequest extends BaseWaybillProperties {
  /** Sender warehouse index (optional) */
  readonly SenderWarehouseIndex?: String36;
  /** Recipient warehouse index (optional) */
  readonly RecipientWarehouseIndex?: String36;
  /** Total volume in cubic meters (optional if OptionsSeat provided) */
  readonly VolumeGeneral?: Volume;
  /** Cargo parameters for each seat */
  readonly OptionsSeat: readonly OptionsSeatInput[];
  /** RedBox barcode (uppercase required) */
  readonly RedBoxBarcode?: String36;
  /** Third person payer ref (required if payerType is ThirdPerson) */
  readonly ThirdPerson?: CounterpartyRef;
  /** Backward delivery data */
  readonly BackwardDeliveryData?: readonly BackwardDeliveryItem[];
  /** Additional services */
  readonly AdditionalServices?: AdditionalServices;
}

// Waybill creation for delivery to a postomat (with restrictions)
export interface CreateWaybillToPostomatRequest extends BaseWaybillProperties {
  /** Sender warehouse index (optional) */
  readonly SenderWarehouseIndex?: String36;
  /** Recipient postomat index (optional) */
  readonly RecipientWarehouseIndex?: String36;
  /** Cargo parameters for each seat (required for delivery to a postomat) */
  readonly OptionsSeat: readonly PoshtomatOptionsSeatInput[];
  /** Cargo type must be Parcel or Documents only */
  readonly CargoType: CargoType.Parcel | CargoType.Documents;
  /** Service type must explicitly target a postomat */
  readonly ServiceType: ServiceType.DoorsPostomat | ServiceType.WarehousePostomat;
  /** Max declared value 10000 UAH */
  readonly Cost: Cost; // max 10000
}

/**
 * @deprecated Use CreateWaybillToPostomatRequest. Nova Poshta API v2 supports
 * delivery to a postomat. Use CreateWaybillRequest with a postomat
 * SenderAddress for sending from a postomat.
 */
export type CreatePoshtomatWaybillRequest = CreateWaybillToPostomatRequest;

// Update waybill request
export interface UpdateWaybillRequest extends BaseWaybillProperties {
  /** Document ref to update */
  readonly Ref: DocumentRef;
  /** Total volume in cubic meters (optional if OptionsSeat not provided) */
  readonly VolumeGeneral?: Volume;
}

// Delete waybill request
export interface DeleteWaybillRequest {
  /** Document refs to delete */
  readonly DocumentRefs: readonly DocumentRef[];
}

// Cargo seat options
export interface OptionsSeatItem {
  /** Weight in kg */
  readonly Weight: Weight;
  /** Width in cm */
  readonly VolumetricWidth: Dimensions;
  /** Length in cm */
  readonly VolumetricLength: Dimensions;
  /** Height in cm */
  readonly VolumetricHeight: Dimensions;
  /** Volume in cubic meters (optional) */
  readonly VolumetricVolume?: Volume;
  /** Package ref (optional) */
  readonly PackRef?: NovaPoshtaRef;
  /** Declared value for this seat (optional) */
  readonly Cost?: Cost;
  /** Description for this seat (optional) */
  readonly Description?: String36;
  /** Special cargo flag */
  readonly SpecialCargo?: '0' | '1';
}

/**
 * Wire-format seat fields accepted by InternetDocument/save. The API uses
 * lower camel case inside OptionsSeat even though the surrounding request uses
 * PascalCase.
 */
export interface OptionsSeatWireItem {
  readonly weight: Weight;
  readonly volumetricWidth: Dimensions;
  readonly volumetricLength: Dimensions;
  readonly volumetricHeight: Dimensions;
  readonly volumetricVolume?: Volume;
  readonly packRef?: NovaPoshtaRef;
  readonly cost?: Cost;
  readonly description?: String36;
  readonly specialCargo?: '0' | '1';
}

/** Both the legacy SDK shape and the API wire shape are accepted. */
export type OptionsSeatInput = OptionsSeatItem | OptionsSeatWireItem;

// Postomat-specific seat options with restrictions
export interface PoshtomatOptionsSeatItem extends OptionsSeatItem {
  /** Max weight 20kg */
  readonly Weight: Weight; // max 20
  /** Max width 40cm */
  readonly VolumetricWidth: Dimensions; // max 40
  /** Max length 60cm */
  readonly VolumetricLength: Dimensions; // max 60
  /** Max height 30cm */
  readonly VolumetricHeight: Dimensions; // max 30
}

export interface PoshtomatOptionsSeatWireItem extends OptionsSeatWireItem {
  readonly weight: Weight;
  readonly volumetricWidth: Dimensions;
  readonly volumetricLength: Dimensions;
  readonly volumetricHeight: Dimensions;
}

export type PoshtomatOptionsSeatInput = PoshtomatOptionsSeatItem | PoshtomatOptionsSeatWireItem;

// Backward delivery configuration
export interface BackwardDeliveryItem {
  /** Backward delivery type */
  readonly CargoType: BackwardDeliveryType;
  /** Amount for money transfer */
  readonly Amount?: Cost;
  /** Service type */
  readonly ServiceType?: ServiceType;
  /** Payer type */
  readonly PayerType?: PayerType;
  /** Payment method */
  readonly PaymentMethod?: PaymentMethod;
}

// Additional services configuration
export interface AdditionalServices {
  /** Saturday delivery */
  readonly SaturdayDelivery?: '0' | '1';
  /** Delivery by hand personally */
  readonly DeliveryByHand?: '0' | '1';
  /** List of authorized recipients */
  readonly DeliveryByHandRecipients?: readonly string[];
  /** Payment control amount */
  readonly AfterPaymentOnGoodsCost?: Cost;
  /** Local express service */
  readonly LocalExpress?: '0' | '1';
  /** Time interval */
  readonly TimeInterval?: TimeIntervalType;
  /** Preferred delivery date */
  readonly PreferredDeliveryDate?: NovaPoshtaDate;
  /** Packing number */
  readonly PackingNumber?: String36;
  /** Client internal order number */
  readonly InfoRegClientBarcodes?: String36;
  /** Accompanying documents */
  readonly AccompanyingDocuments?: String36;
  /** Additional information */
  readonly AdditionalInformation?: String36;
  /** Floor lifting (number of floors) */
  readonly NumberOfFloorsLifting?: number;
  /** Floor descent (number of floors) */
  readonly NumberOfFloorsDescent?: number;
  /** Elevator availability */
  readonly Elevator?: '0' | '1';
  /** Piece control count */
  readonly ForwardingCount?: number;
  /** RedBox barcode */
  readonly RedBoxBarcode?: String36;
  /** Special cargo handling */
  readonly SpecialCargo?: '0' | '1';
  /** Same day delivery */
  readonly SameDayDelivery?: '0' | '1';
  /** Express waybill payment */
  readonly ExpressWaybillPayment?: '0' | '1';
}

// Waybill creation response
export interface WaybillCreationData {
  /** Document ref */
  readonly Ref: DocumentRef;
  /** Cost on site */
  readonly CostOnSite: Cost;
  /** Estimated delivery date */
  readonly EstimatedDeliveryDate: NovaPoshtaDate;
  /** Internet document number */
  readonly IntDocNumber: String36;
  /** Document type */
  readonly TypeDocument: DocumentType;
}

export type CreateWaybillResponse = NovaPoshtaResponse<readonly WaybillCreationData[]>;

// Waybill update response
export interface WaybillUpdateData {
  /** Document ref */
  readonly Ref: DocumentRef;
  /** Cost on site */
  readonly CostOnSite: Cost;
  /** Estimated delivery date */
  readonly EstimatedDeliveryDate: NovaPoshtaDate;
  /** Internet document number */
  readonly IntDocNumber: String36;
  /** Document type */
  readonly TypeDocument: DocumentType;
}

export type UpdateWaybillResponse = NovaPoshtaResponse<readonly WaybillUpdateData[]>;

// Waybill deletion response
export interface WaybillDeletionData {
  /** Deleted document ref */
  readonly Ref: DocumentRef;
}

export type DeleteWaybillResponse = NovaPoshtaResponse<readonly WaybillDeletionData[]>;

// Delivery date calculation
export interface DeliveryDateRequest {
  /** Creation date time (optional) */
  readonly DateTime?: NovaPoshtaDate;
  /** Service type */
  readonly ServiceType: ServiceType;
  /** Sender city ref */
  readonly CitySender: CityRef;
  /** Recipient city ref */
  readonly CityRecipient: CityRef;
}

export interface DeliveryDateData {
  /** Delivery date info */
  readonly DeliveryDate: {
    readonly date: string;
    readonly timezone_type: number;
    readonly timezone: string;
  };
}

export type DeliveryDateResponse = NovaPoshtaResponse<readonly DeliveryDateData[]>;

// Price calculation
export interface PriceCalculationRequest {
  /** Sender city ref */
  readonly CitySender: CityRef;
  /** Recipient city ref */
  readonly CityRecipient: CityRef;
  /** Weight in kg */
  readonly Weight: Weight;
  /** Service type */
  readonly ServiceType: ServiceType;
  /** Declared value */
  readonly Cost: Cost;
  /** Cargo type */
  readonly CargoType: CargoType;
  /** Number of seats */
  readonly SeatsAmount: number;
  /** Backward delivery calculation (optional) */
  readonly RedeliveryCalculate?: BackwardDeliveryCalculation;
  /** Package count (optional) */
  readonly PackCount?: number;
  /** Package ref (optional) */
  readonly PackRef?: NovaPoshtaRef;
  /** Amount (optional) */
  readonly Amount?: number;
  /** Cargo details (optional) */
  readonly CargoDetails?: readonly CargoDetail[];
  /** Cargo description ref (optional) */
  readonly CargoDescription?: NovaPoshtaRef;
  /** Options seat (optional) */
  readonly OptionsSeat?: readonly OptionsSeatInput[];
}

export interface BackwardDeliveryCalculation {
  /** Cargo type for backward delivery */
  readonly CargoType: CargoType;
  /** Amount for backward delivery */
  readonly Amount: Cost;
}

export interface CargoDetail {
  /** Cargo description ref */
  readonly CargoDescription: NovaPoshtaRef;
  /** Amount */
  readonly Amount: number;
}

export interface TariffZoneInfo {
  /** Tariff zone name */
  readonly TzoneName: string;
  /** Tariff zone ID */
  readonly TzoneID: string;
}

export interface PriceCalculationData {
  /** Assessed cost */
  readonly AssessedCost: Cost;
  /** Delivery cost */
  readonly Cost: Cost;
  /** Backward delivery cost */
  readonly CostRedelivery: Cost;
  /** Tariff zone info */
  readonly TzoneInfo: TariffZoneInfo;
  /** Packing cost */
  readonly CostPack: Cost;
}

export type PriceCalculationResponse = NovaPoshtaResponse<readonly PriceCalculationData[]>;

// Validation helpers
export function isValidPoshtomatDimensions(
  seat: OptionsSeatInput,
): seat is PoshtomatOptionsSeatInput {
  const dimensions = getOptionsSeatDimensions(seat);
  return (
    dimensions.weight <= 20 &&
    dimensions.volumetricWidth <= 40 &&
    dimensions.volumetricLength <= 60 &&
    dimensions.volumetricHeight <= 30
  );
}

export function isValidPoshtomatCargoType(cargoType: CargoType): cargoType is CargoType.Parcel | CargoType.Documents {
  return cargoType === CargoType.Parcel || cargoType === CargoType.Documents;
}

export function isValidPoshtomatServiceType(
  serviceType: ServiceType,
): serviceType is ServiceType.DoorsPostomat | ServiceType.WarehousePostomat {
  return serviceType === ServiceType.DoorsPostomat || serviceType === ServiceType.WarehousePostomat;
}

export function calculateTotalWeight(seats: readonly OptionsSeatInput[]): Weight {
  return seats.reduce((total, seat) => total + getOptionsSeatDimensions(seat).weight, 0) as Weight;
}

export function calculateTotalVolume(seats: readonly OptionsSeatInput[]): Volume {
  return seats.reduce((total, seat) => {
    const dimensions = getOptionsSeatDimensions(seat);
    const volume =
      (dimensions.volumetricWidth * dimensions.volumetricLength * dimensions.volumetricHeight) / 1000000; // cm³ to m³
    return total + volume;
  }, 0) as Volume;
}

export function getOptionsSeatDimensions(seat: OptionsSeatInput): {
  weight: Weight;
  volumetricWidth: Dimensions;
  volumetricLength: Dimensions;
  volumetricHeight: Dimensions;
} {
  if ('weight' in seat) {
    return seat;
  }

  return {
    weight: seat.Weight,
    volumetricWidth: seat.VolumetricWidth,
    volumetricLength: seat.VolumetricLength,
    volumetricHeight: seat.VolumetricHeight,
  };
}

// Type guards
export function hasAdditionalServices(
  request: CreateWaybillWithOptionsRequest,
): request is CreateWaybillWithOptionsRequest & { AdditionalServices: AdditionalServices } {
  return request.AdditionalServices !== undefined;
}

export function hasBackwardDelivery(
  request: CreateWaybillWithOptionsRequest,
): request is CreateWaybillWithOptionsRequest & { BackwardDeliveryData: readonly BackwardDeliveryItem[] } {
  return request.BackwardDeliveryData !== undefined && request.BackwardDeliveryData.length > 0;
}

export function isThirdPersonPayer(
  request: BaseWaybillProperties,
): request is BaseWaybillProperties & { ThirdPerson: CounterpartyRef } {
  return request.PayerType === PayerType.ThirdPerson;
}
