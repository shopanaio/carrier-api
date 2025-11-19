/**
 * Types for tracking and document status operations
 */

import type {
  NovaPoshtaResponse,
  NovaPoshtaRef,
  String36,
  String50,
  PhoneNumber,
  NovaPoshtaDate,
  NovaPoshtaDateTime,
  Cost,
  Weight,
} from './base';
import {
  PaymentMethod,
  PayerType,
  CargoType,
  ServiceType,
  DeliveryStatus,
} from './enums';

// Document tracking request
export interface TrackDocumentsRequest {
  /** Array of documents to track */
  readonly documents: readonly TrackDocumentItem[];
}

export interface TrackDocumentItem {
  /** Document number to track */
  readonly documentNumber: string;
  /** Phone number of sender/recipient for extended information (optional) */
  readonly phone?: PhoneNumber;
}

// Tracking response data
export interface TrackingStatusData {
  // Availability flags
  /** Availability to order cargo return service */
  readonly PossibilityCreateReturn: boolean;
  /** Availability to order cargo refusal service */
  readonly PossibilityCreateRefusal: boolean;
  /** Availability to order waybill changes service */
  readonly PossibilityChangeEW: boolean;
  /** Availability to order redirection service */
  readonly PossibilityCreateRedirecting: boolean;
  /** Possibility to change cash to card payment */
  readonly PossibilityChangeCash2Card: boolean;
  /** Possibility to change delivery intervals */
  readonly PossibilityChangeDeliveryIntervals: boolean;
  /** Possibility to extend storage term */
  readonly PossibilityTermExtension: boolean;

  // Basic document info
  /** Waybill number */
  readonly Number: String36;
  /** Document reference ID */
  readonly RefEW: NovaPoshtaRef;
  /** Document type */
  readonly TypeDocument: string;
  /** Creation date */
  readonly DateCreated: NovaPoshtaDateTime;
  /** Description */
  readonly Description?: String36;

  // Redelivery info
  /** Redelivery identifier */
  readonly Redelivery: String36;
  /** Redelivery sum */
  readonly RedeliverySum: String36;
  /** Redelivery number */
  readonly RedeliveryNum: String36;
  /** Redelivery payer */
  readonly RedeliveryPayer: String36;

  // Document basis info
  /** Owner document type */
  readonly OwnerDocumentType: String36;
  /** Owner document number */
  readonly OwnerDocumentNumber: String36;
  /** Last created on basis document type */
  readonly LastCreatedOnTheBasisDocumentType: String36;
  /** Last created on basis payer type */
  readonly LastCreatedOnTheBasisPayerType: String36;
  /** Last created on basis date time */
  readonly LastCreatedOnTheBasisDateTime: String36;
  /** Last created on basis number */
  readonly LastCreatedOnTheBasisNumber: String36;
  /** Created on the basis */
  readonly CreatedOnTheBasis: String36;

  // Money transfer info
  /** Last transaction status for money transfer */
  readonly LastTransactionStatusGM: String36;
  /** Last transaction date time for money transfer */
  readonly LastTransactionDateTimeGM: String36;
  /** Last amount transfer for money transfer */
  readonly LastAmountTransferGM: String36;
  /** Last amount received commission for money transfer */
  readonly LastAmountReceivedCommissionGM: String36;

  // Weight and cost info
  /** Document weight */
  readonly DocumentWeight: Weight;
  /** Actual weight */
  readonly FactualWeight: Weight;
  /** Volumetric weight */
  readonly VolumeWeight: Weight;
  /** Check weight */
  readonly CheckWeight: String36;
  /** Check weight method */
  readonly CheckWeightMethod: String36;
  /** Calculated weight */
  readonly CalculatedWeight: Weight;
  /** Sum before check weight */
  readonly SumBeforeCheckWeight: String36;
  /** Document cost */
  readonly DocumentCost: Cost;
  /** Announced price */
  readonly AnnouncedPrice: Cost;

  // Payment info
  /** Payer type */
  readonly PayerType: PayerType;
  /** Payment method */
  readonly PaymentMethod: PaymentMethod;
  /** Payment status */
  readonly PaymentStatus: String36;
  /** Payment status date */
  readonly PaymentStatusDate: String36;
  /** Amount to pay */
  readonly AmountToPay: String36;
  /** Amount paid */
  readonly AmountPaid: String36;
  /** Express waybill payment status */
  readonly ExpressWaybillPaymentStatus: String36;
  /** Express waybill amount to pay */
  readonly ExpressWaybillAmountToPay: String36;
  /** Card masked number */
  readonly CardMaskedNumber: String36;

  // Recipient info
  /** Recipient full name */
  readonly RecipientFullName: String36;
  /** Recipient full name from waybill */
  readonly RecipientFullNameEW: String36;
  /** Recipient phone */
  readonly PhoneRecipient: PhoneNumber;
  /** Recipient date time */
  readonly RecipientDateTime: NovaPoshtaDateTime;
  /** Recipient address */
  readonly RecipientAddress: String36;
  /** Counterparty recipient description */
  readonly CounterpartyRecipientDescription: String36;

  // Sender info
  /** Sender full name from waybill */
  readonly SenderFullNameEW: String36;
  /** Sender phone */
  readonly PhoneSender: PhoneNumber;
  /** Sender address */
  readonly SenderAddress: String36;
  /** Counterparty sender type */
  readonly CounterpartySenderType: String36;

  // Delivery info
  /** Scheduled delivery date */
  readonly ScheduledDeliveryDate: NovaPoshtaDateTime;
  /** Actual delivery date */
  readonly ActualDeliveryDate: String36;
  /** Preferred delivery date */
  readonly PreferredDeliveryDate?: NovaPoshtaDate;
  /** Delivery timeframe */
  readonly DeliveryTimeframe: String36;

  // Cargo info
  /** Cargo description string */
  readonly CargoDescriptionString: String36;
  /** Cargo type */
  readonly CargoType: CargoType;
  /** Service type */
  readonly ServiceType: ServiceType;
  /** Number of seats */
  readonly SeatsAmount: String36;

  // Location info
  /** Sender city */
  readonly CitySender: String36;
  /** Recipient city */
  readonly CityRecipient: String36;
  /** Ref city sender */
  readonly RefCitySender: NovaPoshtaRef;
  /** Ref city recipient */
  readonly RefCityRecipient: NovaPoshtaRef;
  /** Ref settlement sender */
  readonly RefSettlementSender: NovaPoshtaRef;
  /** Ref settlement recipient */
  readonly RefSettlementRecipient: NovaPoshtaRef;

  // Warehouse info
  /** Warehouse sender */
  readonly WarehouseSender: String36;
  /** Warehouse sender address */
  readonly WarehouseSenderAddress: String36;
  /** Warehouse sender internet address ref */
  readonly WarehouseSenderInternetAddressRef: String36;
  /** Warehouse recipient */
  readonly WarehouseRecipient: String36;
  /** Warehouse recipient number */
  readonly WarehouseRecipientNumber: String36;
  /** Warehouse recipient address */
  readonly WarehouseRecipientAddress: String36;
  /** Warehouse recipient internet address ref */
  readonly WarehouseRecipientInternetAddressRef: NovaPoshtaRef;
  /** Warehouse recipient ref */
  readonly WarehouseRecipientRef: NovaPoshtaRef;
  /** Recipient warehouse type ref */
  readonly RecipientWarehouseTypeRef: NovaPoshtaRef;
  /** Category of warehouse */
  readonly CategoryOfWarehouse: String36;

  // Status info
  /** Status */
  readonly Status: String36;
  /** Status code */
  readonly StatusCode: DeliveryStatus;
  /** Date scan */
  readonly DateScan: NovaPoshtaDateTime;
  /** Tracking update date */
  readonly TrackingUpdateDate: NovaPoshtaDateTime;

  // Additional services
  /** Afterpayment on goods cost */
  readonly AfterPaymentOnGoodsCost: Cost;
  /** Counterparty type */
  readonly CounterpartyType: String36;

  // Backward delivery info
  /** Backward delivery sub types actions */
  readonly BackwardDeliverySubTypesActions: String36;
  /** Backward delivery sub types services */
  readonly BackwardDeliverySubTypesServices: String36;

  // Undelivery info
  /** Undelivery reasons */
  readonly UndeliveryReasons: String36;
  /** Undelivery reasons subtype description */
  readonly UndeliveryReasonsSubtypeDescription: String36;
  /** Undelivery reasons date */
  readonly UndeliveryReasonsDate: String36;

  // Storage info
  /** Date payed keeping */
  readonly DatePayedKeeping: String36;
  /** Date first day storage */
  readonly DateFirstDayStorage: String36;
  /** Days storage cargo */
  readonly DaysStorageCargo: String36;
  /** Storage amount */
  readonly StorageAmount: String36;
  /** Storage price */
  readonly StoragePrice: String36;

  // Return info
  /** Date return cargo */
  readonly DateReturnCargo: String36;
  /** Date moving */
  readonly DateMoving: String36;
  /** Cargo return refusal */
  readonly CargoReturnRefusal: String36;

  // International delivery
  /** International delivery type */
  readonly InternationalDeliveryType: String36;

  // Postomat info
  /** Postomat V3 cell reservation number */
  readonly PostomatV3CellReservationNumber: String36;

  // Marketplace info
  /** Marketplace partner token */
  readonly MarketplacePartnerToken: String36;
  /** Client barcode */
  readonly ClientBarcode: String36;

  // Additional info
  /** Additional information EW */
  readonly AdditionalInformationEW: String36;
  /** Avia delivery */
  readonly AviaDelivery: String36;
  /** Barcode RedBox */
  readonly BarcodeRedBox: String36;

  // Packaging info
  /** Packaging */
  readonly Packaging: unknown[] | null;
  /** Partial return goods */
  readonly PartialReturnGoods: unknown[] | null;

  // Security and loyalty
  /** Secure payment */
  readonly SecurePayment: String36;
  /** Free shipping */
  readonly FreeShipping: String36;
  /** Loyalty card recipient */
  readonly LoyaltyCardRecipient: String36;
}

// Tracking response type
export type TrackingResponse = NovaPoshtaResponse<readonly TrackingStatusData[]>;

// Document movement tracking
export interface DocumentMovementRequest {
  /** Array of documents to track movement */
  readonly documents: readonly TrackDocumentItem[];
  /** Show delivery details */
  readonly showDeliveryDetails?: boolean;
}

export interface DocumentMovementData {
  /** Document number */
  readonly Number: String36;
  /** Document ref */
  readonly DocumentRef: NovaPoshtaRef;
  /** Movement date */
  readonly Date: NovaPoshtaDateTime;
  /** Status */
  readonly Status: String36;
  /** Status code */
  readonly StatusCode: DeliveryStatus;
  /** City sender */
  readonly CitySender: String36;
  /** City recipient */
  readonly CityRecipient: String36;
  /** Scanning date */
  readonly ScanningDate?: NovaPoshtaDateTime;
  /** Comment */
  readonly Comment?: String36;
}

export type DocumentMovementResponse = NovaPoshtaResponse<readonly DocumentMovementData[]>;

// Document list request
export interface DocumentListRequest {
  /** Date from (format: dd.mm.yyyy) */
  readonly dateTimeFrom: NovaPoshtaDate;
  /** Date to (format: dd.mm.yyyy) */
  readonly dateTimeTo: NovaPoshtaDate;
  /** Page number */
  readonly page?: number;
  /** Get full list */
  readonly getFullList?: '0' | '1';
  /** Date time */
  readonly dateTime?: NovaPoshtaDate;
}

export interface DocumentListData {
  /** Document ref */
  readonly Ref: NovaPoshtaRef;
  /** Document number */
  readonly IntDocNumber: String36;
  /** Creation date */
  readonly DateCreated: NovaPoshtaDateTime;
  /** Status description */
  readonly StatusDescription: String36;
  /** Sender description */
  readonly SenderDescription: String36;
  /** Recipient description */
  readonly RecipientDescription: String36;
  /** Cost on site */
  readonly CostOnSite: Cost;
  /** Estimated delivery date */
  readonly EstimatedDeliveryDate: NovaPoshtaDate;
}

export type DocumentListResponse = NovaPoshtaResponse<readonly DocumentListData[]>;

// Type guards
export function isTrackingSuccessful(data: TrackingStatusData): boolean {
  return data.StatusCode !== DeliveryStatus.NotFound &&
         data.StatusCode !== DeliveryStatus.Deleted;
}

export function isDocumentDelivered(data: TrackingStatusData): boolean {
  return data.StatusCode === DeliveryStatus.Received ||
         data.StatusCode === DeliveryStatus.ReceivedAwaitingMoneyTransfer ||
         data.StatusCode === DeliveryStatus.ReceivedAndMoneyTransferred;
}

export function isDocumentInTransit(data: TrackingStatusData): boolean {
  return data.StatusCode === DeliveryStatus.InTransitToRecipientCity ||
         data.StatusCode === DeliveryStatus.OnTheWayToRecipient ||
         data.StatusCode === DeliveryStatus.BeingPacked;
}

export function isDocumentAtWarehouse(data: TrackingStatusData): boolean {
  return data.StatusCode === DeliveryStatus.ArrivedAtWarehouse ||
         data.StatusCode === DeliveryStatus.ArrivedAtPostomat ||
         data.StatusCode === DeliveryStatus.InRecipientCityAwaitingDelivery;
}