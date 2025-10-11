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
  readonly possibilityCreateReturn: boolean;
  /** Availability to order cargo refusal service */
  readonly possibilityCreateRefusal: boolean;
  /** Availability to order waybill changes service */
  readonly possibilityChangeEW: boolean;
  /** Availability to order redirection service */
  readonly possibilityCreateRedirecting: boolean;
  /** Possibility to change cash to card payment */
  readonly possibilityChangeCash2Card: boolean;
  /** Possibility to change delivery intervals */
  readonly possibilityChangeDeliveryIntervals: boolean;
  /** Possibility to extend storage term */
  readonly possibilityTermExtension: boolean;

  // Basic document info
  /** Waybill number */
  readonly number: String36;
  /** Document reference ID */
  readonly refEW: NovaPoshtaRef;
  /** Document type */
  readonly typeDocument: string;
  /** Creation date */
  readonly dateCreated: NovaPoshtaDateTime;
  /** Description */
  readonly description?: String36;

  // Redelivery info
  /** Redelivery identifier */
  readonly redelivery: String36;
  /** Redelivery sum */
  readonly redeliverySum: String36;
  /** Redelivery number */
  readonly redeliveryNum: String36;
  /** Redelivery payer */
  readonly redeliveryPayer: String36;

  // Document basis info
  /** Owner document type */
  readonly ownerDocumentType: String36;
  /** Owner document number */
  readonly ownerDocumentNumber: String36;
  /** Last created on basis document type */
  readonly lastCreatedOnTheBasisDocumentType: String36;
  /** Last created on basis payer type */
  readonly lastCreatedOnTheBasisPayerType: String36;
  /** Last created on basis date time */
  readonly lastCreatedOnTheBasisDateTime: String36;
  /** Last created on basis number */
  readonly lastCreatedOnTheBasisNumber: String36;
  /** Created on the basis */
  readonly createdOnTheBasis: String36;

  // Money transfer info
  /** Last transaction status for money transfer */
  readonly lastTransactionStatusGM: String36;
  /** Last transaction date time for money transfer */
  readonly lastTransactionDateTimeGM: String36;
  /** Last amount transfer for money transfer */
  readonly lastAmountTransferGM: String36;
  /** Last amount received commission for money transfer */
  readonly lastAmountReceivedCommissionGM: String36;

  // Weight and cost info
  /** Document weight */
  readonly documentWeight: Weight;
  /** Actual weight */
  readonly factualWeight: Weight;
  /** Volumetric weight */
  readonly volumeWeight: Weight;
  /** Check weight */
  readonly checkWeight: String36;
  /** Check weight method */
  readonly checkWeightMethod: String36;
  /** Calculated weight */
  readonly calculatedWeight: Weight;
  /** Sum before check weight */
  readonly sumBeforeCheckWeight: String36;
  /** Document cost */
  readonly documentCost: Cost;
  /** Announced price */
  readonly announcedPrice: Cost;

  // Payment info
  /** Payer type */
  readonly payerType: PayerType;
  /** Payment method */
  readonly paymentMethod: PaymentMethod;
  /** Payment status */
  readonly paymentStatus: String36;
  /** Payment status date */
  readonly paymentStatusDate: String36;
  /** Amount to pay */
  readonly amountToPay: String36;
  /** Amount paid */
  readonly amountPaid: String36;
  /** Express waybill payment status */
  readonly expressWaybillPaymentStatus: String36;
  /** Express waybill amount to pay */
  readonly expressWaybillAmountToPay: String36;
  /** Card masked number */
  readonly cardMaskedNumber: String36;

  // Recipient info
  /** Recipient full name */
  readonly recipientFullName: String36;
  /** Recipient full name from waybill */
  readonly recipientFullNameEW: String36;
  /** Recipient phone */
  readonly phoneRecipient: PhoneNumber;
  /** Recipient date time */
  readonly recipientDateTime: NovaPoshtaDateTime;
  /** Recipient address */
  readonly recipientAddress: String36;
  /** Counterparty recipient description */
  readonly counterpartyRecipientDescription: String36;

  // Sender info
  /** Sender full name from waybill */
  readonly senderFullNameEW: String36;
  /** Sender phone */
  readonly phoneSender: PhoneNumber;
  /** Sender address */
  readonly senderAddress: String36;
  /** Counterparty sender type */
  readonly counterpartySenderType: String36;

  // Delivery info
  /** Scheduled delivery date */
  readonly scheduledDeliveryDate: NovaPoshtaDateTime;
  /** Actual delivery date */
  readonly actualDeliveryDate: String36;
  /** Preferred delivery date */
  readonly preferredDeliveryDate?: NovaPoshtaDate;
  /** Delivery timeframe */
  readonly deliveryTimeframe: String36;

  // Cargo info
  /** Cargo description string */
  readonly cargoDescriptionString: String36;
  /** Cargo type */
  readonly cargoType: CargoType;
  /** Service type */
  readonly serviceType: ServiceType;
  /** Number of seats */
  readonly seatsAmount: String36;

  // Location info
  /** Sender city */
  readonly citySender: String36;
  /** Recipient city */
  readonly cityRecipient: String36;
  /** Ref city sender */
  readonly refCitySender: NovaPoshtaRef;
  /** Ref city recipient */
  readonly refCityRecipient: NovaPoshtaRef;
  /** Ref settlement sender */
  readonly refSettlementSender: NovaPoshtaRef;
  /** Ref settlement recipient */
  readonly refSettlementRecipient: NovaPoshtaRef;

  // Warehouse info
  /** Warehouse sender */
  readonly warehouseSender: String36;
  /** Warehouse sender address */
  readonly warehouseSenderAddress: String36;
  /** Warehouse sender internet address ref */
  readonly warehouseSenderInternetAddressRef: String36;
  /** Warehouse recipient */
  readonly warehouseRecipient: String36;
  /** Warehouse recipient number */
  readonly warehouseRecipientNumber: String36;
  /** Warehouse recipient address */
  readonly warehouseRecipientAddress: String36;
  /** Warehouse recipient internet address ref */
  readonly warehouseRecipientInternetAddressRef: NovaPoshtaRef;
  /** Warehouse recipient ref */
  readonly warehouseRecipientRef: NovaPoshtaRef;
  /** Recipient warehouse type ref */
  readonly recipientWarehouseTypeRef: NovaPoshtaRef;
  /** Category of warehouse */
  readonly categoryOfWarehouse: String36;

  // Status info
  /** Status */
  readonly status: String36;
  /** Status code */
  readonly statusCode: DeliveryStatus;
  /** Date scan */
  readonly dateScan: NovaPoshtaDateTime;
  /** Tracking update date */
  readonly trackingUpdateDate: NovaPoshtaDateTime;

  // Additional services
  /** Afterpayment on goods cost */
  readonly afterpaymentOnGoodsCost: Cost;
  /** Counterparty type */
  readonly counterpartyType: String36;

  // Backward delivery info
  /** Backward delivery sub types actions */
  readonly backwardDeliverySubTypesActions: String36;
  /** Backward delivery sub types services */
  readonly backwardDeliverySubTypesServices: String36;

  // Undelivery info
  /** Undelivery reasons */
  readonly undeliveryReasons: String36;
  /** Undelivery reasons subtype description */
  readonly undeliveryReasonsSubtypeDescription: String36;
  /** Undelivery reasons date */
  readonly undeliveryReasonsDate: String36;

  // Storage info
  /** Date payed keeping */
  readonly datePayedKeeping: String36;
  /** Date first day storage */
  readonly dateFirstDayStorage: String36;
  /** Days storage cargo */
  readonly daysStorageCargo: String36;
  /** Storage amount */
  readonly storageAmount: String36;
  /** Storage price */
  readonly storagePrice: String36;

  // Return info
  /** Date return cargo */
  readonly dateReturnCargo: String36;
  /** Date moving */
  readonly dateMoving: String36;
  /** Cargo return refusal */
  readonly cargoReturnRefusal: String36;

  // International delivery
  /** International delivery type */
  readonly internationalDeliveryType: String36;

  // Postomat info
  /** Postomat V3 cell reservation number */
  readonly postomatV3CellReservationNumber: String36;

  // Marketplace info
  /** Marketplace partner token */
  readonly marketplacePartnerToken: String36;
  /** Client barcode */
  readonly clientBarcode: String36;

  // Additional info
  /** Additional information EW */
  readonly additionalInformationEW: String36;
  /** Avia delivery */
  readonly aviaDelivery: String36;
  /** Barcode RedBox */
  readonly barcodeRedBox: String36;

  // Packaging info
  /** Packaging */
  readonly packaging: unknown[] | null;
  /** Partial return goods */
  readonly partialReturnGoods: unknown[] | null;

  // Security and loyalty
  /** Secure payment */
  readonly securePayment: String36;
  /** Free shipping */
  readonly freeShipping: String36;
  /** Loyalty card recipient */
  readonly loyaltyCardRecipient: String36;
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
  readonly number: String36;
  /** Document ref */
  readonly documentRef: NovaPoshtaRef;
  /** Movement date */
  readonly date: NovaPoshtaDateTime;
  /** Status */
  readonly status: String36;
  /** Status code */
  readonly statusCode: DeliveryStatus;
  /** City sender */
  readonly citySender: String36;
  /** City recipient */
  readonly cityRecipient: String36;
  /** Scanning date */
  readonly scanningDate?: NovaPoshtaDateTime;
  /** Comment */
  readonly comment?: String36;
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
  readonly ref: NovaPoshtaRef;
  /** Document number */
  readonly intDocNumber: String36;
  /** Creation date */
  readonly dateCreated: NovaPoshtaDateTime;
  /** Status description */
  readonly statusDescription: String36;
  /** Sender description */
  readonly senderDescription: String36;
  /** Recipient description */
  readonly recipientDescription: String36;
  /** Cost on site */
  readonly costOnSite: Cost;
  /** Estimated delivery date */
  readonly estimatedDeliveryDate: NovaPoshtaDate;
}

export type DocumentListResponse = NovaPoshtaResponse<readonly DocumentListData[]>;

// Type guards
export function isTrackingSuccessful(data: TrackingStatusData): boolean {
  return data.statusCode !== DeliveryStatus.NotFound && 
         data.statusCode !== DeliveryStatus.Deleted;
}

export function isDocumentDelivered(data: TrackingStatusData): boolean {
  return data.statusCode === DeliveryStatus.Received ||
         data.statusCode === DeliveryStatus.ReceivedAwaitingMoneyTransfer ||
         data.statusCode === DeliveryStatus.ReceivedAndMoneyTransferred;
}

export function isDocumentInTransit(data: TrackingStatusData): boolean {
  return data.statusCode === DeliveryStatus.InTransitToRecipientCity ||
         data.statusCode === DeliveryStatus.OnTheWayToRecipient ||
         data.statusCode === DeliveryStatus.BeingPacked;
}

export function isDocumentAtWarehouse(data: TrackingStatusData): boolean {
  return data.statusCode === DeliveryStatus.ArrivedAtWarehouse ||
         data.statusCode === DeliveryStatus.ArrivedAtPostomat ||
         data.statusCode === DeliveryStatus.InRecipientCityAwaitingDelivery;
}