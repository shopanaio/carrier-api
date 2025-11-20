/**
 * Reference service types for Nova Poshta API
 * Handles all reference data operations
 */

import type { NovaPoshtaResponse, ObjectRef } from './base';

// Reference data types
export type CargoTypeRef = string;
export type PalletRef = string;
export type PackRef = string;
export type TireWheelRef = string;
export type CargoDescriptionRef = string;
export type MessageCodeRef = string;
export type ServiceTypeRef = string;
export type OwnershipFormRef = string;
export type TimeIntervalRef = string;
export type PickupTimeIntervalRef = string;
export type BackwardDeliveryCargoTypeRef = string;
export type PayerTypeRef = string;

// =============================================================================
// CARGO TYPES
// =============================================================================

export interface GetCargoTypesRequest {
  // Empty request - no parameters needed
}

export interface CargoTypeData {
  /** Cargo type identifier */
  readonly Ref: CargoTypeRef;
  /** Description in Ukrainian */
  readonly Description: string;
}

export type GetCargoTypesResponse = NovaPoshtaResponse<CargoTypeData[]>;

// =============================================================================
// PALLETS
// =============================================================================

export interface GetPalletsListRequest {
  // Empty request - no parameters needed
}

export interface PalletData {
  /** Pallet identifier */
  readonly Ref: PalletRef;
  /** Description in Ukrainian */
  readonly Description: string;
  /** Description in Russian */
  readonly DescriptionRu: string;
  /** Weight in kg */
  readonly Weight: string;
}

export type GetPalletsListResponse = NovaPoshtaResponse<PalletData[]>;

// =============================================================================
// PACK LIST
// =============================================================================

export interface GetPackListRequest {
  /** Length in mm (optional) */
  readonly Length?: number;
  /** Width in mm (optional) */
  readonly Width?: number;
  /** Height in mm (optional) */
  readonly Height?: number;
  /** Volumetric weight (optional) */
  readonly VolumetricWeight?: number;
  /** Type of packing (optional) */
  readonly TypeOfPacking?: string;
}

export interface PackData {
  /** Pack identifier */
  readonly Ref: PackRef;
  /** Description in Ukrainian */
  readonly Description: string;
  /** Description in Russian */
  readonly DescriptionRu: string;
  /** Length in mm */
  readonly Length: string;
  /** Width in mm */
  readonly Width: string;
  /** Height in mm */
  readonly Height: string;
  /** Volumetric weight */
  readonly VolumetricWeight: string;
  /** Type of packing */
  readonly TypeOfPacking: string;
}

export type GetPackListResponse = NovaPoshtaResponse<PackData[]>;

// =============================================================================
// TIRES AND WHEELS
// =============================================================================

export interface GetTiresWheelsListRequest {
  // Empty request - no parameters needed
}

export interface TireWheelData {
  /** Tire/wheel identifier */
  readonly Ref: TireWheelRef;
  /** Description in Ukrainian */
  readonly Description: string;
  /** Description in Russian */
  readonly DescriptionRu: string;
  /** Weight in kg */
  readonly Weight: string;
  /** Type description (Tires or Wheels) */
  readonly DescriptionType: 'Tires' | 'Wheels';
}

export type GetTiresWheelsListResponse = NovaPoshtaResponse<TireWheelData[]>;

// =============================================================================
// CARGO DESCRIPTION
// =============================================================================

export interface GetCargoDescriptionListRequest {
  /** Search string (optional) */
  readonly FindByString?: string;
  /** Page number (optional, up to 500 records per page) */
  readonly Page?: number;
  /** Limit number (optional, up to 500 records per page) */
  readonly Limit?: number;
}

export interface CargoDescriptionData {
  /** Cargo description identifier */
  readonly Ref: CargoDescriptionRef;
  /** Description in Ukrainian */
  readonly Description: string;
  /** Description in Russian */
  readonly DescriptionRu: string;
}

export type GetCargoDescriptionListResponse = NovaPoshtaResponse<CargoDescriptionData[]>;

// =============================================================================
// MESSAGE CODES
// =============================================================================

export interface GetMessageCodeTextRequest {
  // Empty request - no parameters needed
}

export interface MessageCodeData {
  /** Message code */
  readonly MessageCode: MessageCodeRef;
  /** Message text in English */
  readonly MessageText: string;
  /** Message description in Russian */
  readonly MessageDescriptionRU: string;
  /** Message description in Ukrainian */
  readonly MessageDescriptionUA: string;
}

export type GetMessageCodeTextResponse = NovaPoshtaResponse<MessageCodeData[]>;

// =============================================================================
// SERVICE TYPES
// =============================================================================

export interface GetServiceTypesRequest {
  // Empty request - no parameters needed
}

export interface ServiceTypeData {
  /** Service type identifier */
  readonly Ref: ServiceTypeRef;
  /** Description in Ukrainian */
  readonly Description: string;
}

export type GetServiceTypesResponse = NovaPoshtaResponse<ServiceTypeData[]>;

// =============================================================================
// OWNERSHIP FORMS
// =============================================================================

export interface GetOwnershipFormsListRequest {
  // Empty request - no parameters needed
}

export interface OwnershipFormData {
  /** Ownership form identifier */
  readonly Ref: OwnershipFormRef;
  /** Description in Ukrainian */
  readonly Description: string;
  /** Full name */
  readonly FullName: string;
}

export type GetOwnershipFormsListResponse = NovaPoshtaResponse<OwnershipFormData[]>;

// =============================================================================
// TIME INTERVALS
// =============================================================================

export interface GetTimeIntervalsRequest {
  /** Recipient city identifier */
  readonly RecipientCityRef: ObjectRef;
  /** Date for time intervals (optional, defaults to current date) */
  readonly DateTime?: string;
}

export interface TimeIntervalData {
  /** Time interval identifier */
  readonly Number: TimeIntervalRef;
  /** Start time (e.g., "12:00") */
  readonly Start: string;
  /** End time (e.g., "15:00") */
  readonly End: string;
}

export type GetTimeIntervalsResponse = NovaPoshtaResponse<TimeIntervalData[]>;

// =============================================================================
// PICKUP TIME INTERVALS
// =============================================================================

export interface GetPickupTimeIntervalsRequest {
  /** Sender city identifier */
  readonly SenderCityRef: ObjectRef;
  /** Date for available time intervals */
  readonly DateTime: string;
}

export interface PickupTimeIntervalData {
  /** Time interval name */
  readonly Number: PickupTimeIntervalRef;
  /** Start time */
  readonly Start: string;
  /** End time */
  readonly End: string;
  /** Boundary time for pickup */
  readonly BoundaryTime: string;
}

export type GetPickupTimeIntervalsResponse = NovaPoshtaResponse<PickupTimeIntervalData[]>;

// =============================================================================
// BACKWARD DELIVERY CARGO TYPES
// =============================================================================

export interface GetBackwardDeliveryCargoTypesRequest {
  // Empty request - no parameters needed
}

export interface BackwardDeliveryCargoTypeData {
  /** Backward delivery cargo type identifier */
  readonly Ref: BackwardDeliveryCargoTypeRef;
  /** Description in Ukrainian */
  readonly Description: string;
}

export type GetBackwardDeliveryCargoTypesResponse = NovaPoshtaResponse<BackwardDeliveryCargoTypeData[]>;

// =============================================================================
// PAYER TYPES FOR REDELIVERY
// =============================================================================

export interface GetTypesOfPayersForRedeliveryRequest {
  // Empty request - no parameters needed
}

export interface PayerForRedeliveryData {
  /** Payer type identifier */
  readonly Ref: PayerTypeRef;
  /** Description in Ukrainian */
  readonly Description: string;
}

export type GetTypesOfPayersForRedeliveryResponse = NovaPoshtaResponse<PayerForRedeliveryData[]>;

// =============================================================================
// TYPES OF PAYERS
// =============================================================================

export interface GetTypesOfPayersRequest {
  /** Response language (ua/ru) */
  readonly Language?: string;
}

export interface PayerTypeData {
  /** Payer type identifier */
  readonly Ref: string;
  /** Description in Ukrainian */
  readonly Description: string;
}

export type GetTypesOfPayersResponse = NovaPoshtaResponse<PayerTypeData[]>;

// =============================================================================
// PAYMENT FORMS
// =============================================================================

export interface GetPaymentFormsRequest {
  /** Response language (ua/ru) */
  readonly Language?: string;
}

export interface PaymentFormData {
  /** Payment form identifier */
  readonly Ref: string;
  /** Description in Ukrainian */
  readonly Description: string;
}

export type GetPaymentFormsResponse = NovaPoshtaResponse<PaymentFormData[]>;

// =============================================================================
// TYPES OF COUNTERPARTIES
// =============================================================================

export interface GetTypesOfCounterpartiesRequest {
  /** Response language (ua/ru) */
  readonly Language?: string;
}

export interface CounterpartyTypeData {
  /** Counterparty type identifier */
  readonly Ref: string;
  /** Description in Ukrainian */
  readonly Description: string;
}

export type GetTypesOfCounterpartiesResponse = NovaPoshtaResponse<CounterpartyTypeData[]>;

// =============================================================================
// AGGREGATE TYPES
// =============================================================================

/** All reference request types */
export type ReferenceRequest =
  | GetCargoTypesRequest
  | GetPalletsListRequest
  | GetPackListRequest
  | GetTiresWheelsListRequest
  | GetCargoDescriptionListRequest
  | GetMessageCodeTextRequest
  | GetServiceTypesRequest
  | GetOwnershipFormsListRequest
  | GetTimeIntervalsRequest
  | GetPickupTimeIntervalsRequest
  | GetBackwardDeliveryCargoTypesRequest
  | GetTypesOfPayersForRedeliveryRequest
  | GetTypesOfPayersRequest
  | GetPaymentFormsRequest
  | GetTypesOfCounterpartiesRequest;

/** All reference response types */
export type ReferenceResponse =
  | GetCargoTypesResponse
  | GetPalletsListResponse
  | GetPackListResponse
  | GetTiresWheelsListResponse
  | GetCargoDescriptionListResponse
  | GetMessageCodeTextResponse
  | GetServiceTypesResponse
  | GetOwnershipFormsListResponse
  | GetTimeIntervalsResponse
  | GetPickupTimeIntervalsResponse
  | GetBackwardDeliveryCargoTypesResponse
  | GetTypesOfPayersForRedeliveryResponse
  | GetTypesOfPayersResponse
  | GetPaymentFormsResponse
  | GetTypesOfCounterpartiesResponse;

/** All reference data types */
export type ReferenceData =
  | CargoTypeData
  | PalletData
  | PackData
  | TireWheelData
  | CargoDescriptionData
  | MessageCodeData
  | ServiceTypeData
  | OwnershipFormData
  | TimeIntervalData
  | PickupTimeIntervalData
  | BackwardDeliveryCargoTypeData
  | PayerForRedeliveryData
  | PayerTypeData
  | PaymentFormData
  | CounterpartyTypeData;
