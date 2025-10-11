/**
 * Reference service types for Nova Poshta API
 * Handles all reference data operations
 */

import type { NovaPoshtaResponse, ObjectRef, BrandedString } from './base';
import type { CargoType, ServiceType } from './enums';

// Branded types for reference data
export type CargoTypeRef = BrandedString<'CargoTypeRef'>;
export type PalletRef = BrandedString<'PalletRef'>;
export type PackRef = BrandedString<'PackRef'>;
export type TireWheelRef = BrandedString<'TireWheelRef'>;
export type CargoDescriptionRef = BrandedString<'CargoDescriptionRef'>;
export type MessageCodeRef = BrandedString<'MessageCodeRef'>;
export type ServiceTypeRef = BrandedString<'ServiceTypeRef'>;
export type OwnershipFormRef = BrandedString<'OwnershipFormRef'>;
export type TimeIntervalRef = BrandedString<'TimeIntervalRef'>;
export type PickupTimeIntervalRef = BrandedString<'PickupTimeIntervalRef'>;
export type BackwardDeliveryCargoTypeRef = BrandedString<'BackwardDeliveryCargoTypeRef'>;
export type PayerTypeRef = BrandedString<'PayerTypeRef'>;

// =============================================================================
// CARGO TYPES
// =============================================================================

export interface GetCargoTypesRequest {
  // Empty request - no parameters needed
}

export interface CargoTypeData {
  /** Cargo type identifier */
  readonly ref: CargoTypeRef;
  /** Description in Ukrainian */
  readonly description: string;
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
  readonly ref: PalletRef;
  /** Description in Ukrainian */
  readonly description: string;
  /** Description in Russian */
  readonly descriptionRu: string;
  /** Weight in kg */
  readonly weight: string;
}

export type GetPalletsListResponse = NovaPoshtaResponse<PalletData[]>;

// =============================================================================
// PACK LIST
// =============================================================================

export interface GetPackListRequest {
  /** Length in mm (optional) */
  readonly length?: number;
  /** Width in mm (optional) */
  readonly width?: number;
  /** Height in mm (optional) */
  readonly height?: number;
  /** Volumetric weight (optional) */
  readonly volumetricWeight?: number;
  /** Type of packing (optional) */
  readonly typeOfPacking?: string;
}

export interface PackData {
  /** Pack identifier */
  readonly ref: PackRef;
  /** Description in Ukrainian */
  readonly description: string;
  /** Description in Russian */
  readonly descriptionRu: string;
  /** Length in mm */
  readonly length: string;
  /** Width in mm */
  readonly width: string;
  /** Height in mm */
  readonly height: string;
  /** Volumetric weight */
  readonly volumetricWeight: string;
  /** Type of packing */
  readonly typeOfPacking: string;
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
  readonly ref: TireWheelRef;
  /** Description in Ukrainian */
  readonly description: string;
  /** Description in Russian */
  readonly descriptionRu: string;
  /** Weight in kg */
  readonly weight: string;
  /** Type description (Tires or Wheels) */
  readonly descriptionType: 'Tires' | 'Wheels';
}

export type GetTiresWheelsListResponse = NovaPoshtaResponse<TireWheelData[]>;

// =============================================================================
// CARGO DESCRIPTION
// =============================================================================

export interface GetCargoDescriptionListRequest {
  /** Search string (optional) */
  readonly findByString?: string;
  /** Page number (optional, up to 500 records per page) */
  readonly page?: number;
}

export interface CargoDescriptionData {
  /** Cargo description identifier */
  readonly ref: CargoDescriptionRef;
  /** Description in Ukrainian */
  readonly description: string;
  /** Description in Russian */
  readonly descriptionRu: string;
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
  readonly messageCode: MessageCodeRef;
  /** Message text in English */
  readonly messageText: string;
  /** Message description in Russian */
  readonly messageDescriptionRU: string;
  /** Message description in Ukrainian */
  readonly messageDescriptionUA: string;
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
  readonly ref: ServiceTypeRef;
  /** Description in Ukrainian */
  readonly description: string;
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
  readonly ref: OwnershipFormRef;
  /** Description in Ukrainian */
  readonly description: string;
  /** Full name */
  readonly fullName: string;
}

export type GetOwnershipFormsListResponse = NovaPoshtaResponse<OwnershipFormData[]>;

// =============================================================================
// TIME INTERVALS
// =============================================================================

export interface GetTimeIntervalsRequest {
  /** Recipient city identifier */
  readonly recipientCityRef: ObjectRef;
  /** Date for time intervals (optional, defaults to current date) */
  readonly dateTime?: string;
}

export interface TimeIntervalData {
  /** Time interval identifier */
  readonly number: TimeIntervalRef;
  /** Start time (e.g., "12:00") */
  readonly start: string;
  /** End time (e.g., "15:00") */
  readonly end: string;
}

export type GetTimeIntervalsResponse = NovaPoshtaResponse<TimeIntervalData[]>;

// =============================================================================
// PICKUP TIME INTERVALS
// =============================================================================

export interface GetPickupTimeIntervalsRequest {
  /** Sender city identifier */
  readonly senderCityRef: ObjectRef;
  /** Date for available time intervals */
  readonly dateTime: string;
}

export interface PickupTimeIntervalData {
  /** Time interval name */
  readonly number: PickupTimeIntervalRef;
  /** Start time */
  readonly start: string;
  /** End time */
  readonly end: string;
  /** Boundary time for pickup */
  readonly boundaryTime: string;
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
  readonly ref: BackwardDeliveryCargoTypeRef;
  /** Description in Ukrainian */
  readonly description: string;
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
  readonly ref: PayerTypeRef;
  /** Description in Ukrainian */
  readonly description: string;
}

export type GetTypesOfPayersForRedeliveryResponse = NovaPoshtaResponse<PayerForRedeliveryData[]>;

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
  | GetTypesOfPayersForRedeliveryRequest;

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
  | GetTypesOfPayersForRedeliveryResponse;

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
  | PayerForRedeliveryData;