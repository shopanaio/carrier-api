/**
 * Counterparty service types for Nova Poshta API
 * Handles all counterparty-related operations
 */

import type { NovaPoshtaResponse, CounterpartyRef, CityRef, AddressRef, ContactRef } from './base';

// =============================================================================
// GET COUNTERPARTIES
// =============================================================================

export interface GetCounterpartiesRequest {
  readonly counterpartyProperty: 'Sender' | 'Recipient' | 'ThirdPerson';
  readonly page?: number;
  readonly findByString?: string;
  readonly cityRef?: CityRef;
}

export interface CounterpartyData {
  readonly Description: string;
  readonly Ref: CounterpartyRef;
  readonly City: CityRef;
  readonly Counterparty: string;
  readonly OwnershipForm: string;
  readonly OwnershipFormDescription: string;
  readonly EDRPOU: string;
  readonly CounterpartyType: string;
}

export type GetCounterpartiesResponse = NovaPoshtaResponse<CounterpartyData[]>;

// =============================================================================
// GET COUNTERPARTY ADDRESSES
// =============================================================================

export interface GetCounterpartyAddressesRequest {
  readonly ref: CounterpartyRef;
  readonly counterpartyProperty?: 'Sender' | 'Recipient';
  readonly page?: number;
}

export interface CounterpartyAddressData {
  readonly Ref: AddressRef;
  readonly Description: string;
  readonly StreetsType: string;
  readonly StreetsTypeDescription: string;
}

export type GetCounterpartyAddressesResponse = NovaPoshtaResponse<CounterpartyAddressData[]>;

// =============================================================================
// GET COUNTERPARTY CONTACT PERSONS
// =============================================================================

export interface GetCounterpartyContactPersonsRequest {
  readonly ref: CounterpartyRef;
  readonly page?: number;
}

export interface CounterpartyContactPersonData {
  readonly Description: string;
  readonly Ref: ContactRef;
  readonly Phones: string;
  readonly Email: string;
  readonly LastName: string;
  readonly FirstName: string;
  readonly MiddleName: string;
}

export type GetCounterpartyContactPersonsResponse = NovaPoshtaResponse<CounterpartyContactPersonData[]>;

// =============================================================================
// SAVE COUNTERPARTY
// =============================================================================

/**
 * Base interface for counterparty creation
 */
interface SaveCounterpartyBase {
  readonly counterpartyProperty: 'Sender' | 'Recipient';
  readonly phone: string;
  readonly email?: string;
}

/**
 * Request for creating a private person counterparty
 */
export interface SaveCounterpartyPrivatePerson extends SaveCounterpartyBase {
  readonly counterpartyType: 'PrivatePerson';
  /** Required for private persons */
  readonly firstName: string;
  readonly middleName?: string;
  /** Required for private persons */
  readonly lastName: string;
}

/**
 * Request for creating an organization counterparty
 */
export interface SaveCounterpartyOrganization extends SaveCounterpartyBase {
  readonly counterpartyType: 'Organization';
  /** Contact person first name (optional for organizations) */
  readonly firstName?: string;
  /** Contact person middle name (optional for organizations) */
  readonly middleName?: string;
  /** Contact person last name (optional for organizations) */
  readonly lastName?: string;
  /** Ownership form reference (required for organizations) */
  readonly ownershipForm: string;
  /** EDRPOU/INN code (required for organizations) */
  readonly edrpou: string;
}

/**
 * Discriminated union for counterparty creation
 */
export type SaveCounterpartyRequest = SaveCounterpartyPrivatePerson | SaveCounterpartyOrganization;

export interface SaveCounterpartyData {
  readonly Ref: CounterpartyRef;
  readonly Description: string;
  readonly ContactPerson: {
    readonly data: Array<{
      readonly Ref: ContactRef;
      readonly Description: string;
    }>;
  };
}

export type SaveCounterpartyResponse = NovaPoshtaResponse<SaveCounterpartyData[]>;

// =============================================================================
// UPDATE COUNTERPARTY
// =============================================================================

export interface UpdateCounterpartyRequest {
  readonly ref: CounterpartyRef;
  readonly counterpartyProperty: 'Sender' | 'Recipient';
  readonly firstName?: string;
  readonly middleName?: string;
  readonly lastName?: string;
  readonly phone?: string;
  readonly email?: string;
}

export type UpdateCounterpartyResponse = NovaPoshtaResponse<CounterpartyData[]>;

// =============================================================================
// DELETE COUNTERPARTY
// =============================================================================

export interface DeleteCounterpartyRequest {
  readonly ref: CounterpartyRef;
}

export interface DeleteCounterpartyData {
  readonly Ref: CounterpartyRef;
}

export type DeleteCounterpartyResponse = NovaPoshtaResponse<DeleteCounterpartyData[]>;

// =============================================================================
// GET COUNTERPARTY OPTIONS
// =============================================================================

export interface GetCounterpartyOptionsRequest {
  readonly ref: CounterpartyRef;
}

export interface CounterpartyOptionsData {
  readonly CanPayTheThirdPerson: string;
  readonly CanCreditDocuments: string;
  readonly CanEWTransporter: string;
  readonly DescentFromFloor: string;
  readonly CanBackwardDelivery: string;
  readonly CanForwardingService: string;
  readonly PrintMarkingAllowedNonCash: string;
  readonly DebtorParams: {
    readonly DayDelay: string;
    readonly DebtCurrency: string;
    readonly Debt: string;
    readonly OverdueDebt: string;
  };
}

export type GetCounterpartyOptionsResponse = NovaPoshtaResponse<CounterpartyOptionsData[]>;

// =============================================================================
// AGGREGATE TYPES
// =============================================================================

export type CounterpartyRequest =
  | GetCounterpartiesRequest
  | GetCounterpartyAddressesRequest
  | GetCounterpartyContactPersonsRequest
  | SaveCounterpartyRequest
  | UpdateCounterpartyRequest
  | DeleteCounterpartyRequest
  | GetCounterpartyOptionsRequest;

export type CounterpartyResponse =
  | GetCounterpartiesResponse
  | GetCounterpartyAddressesResponse
  | GetCounterpartyContactPersonsResponse
  | SaveCounterpartyResponse
  | UpdateCounterpartyResponse
  | DeleteCounterpartyResponse
  | GetCounterpartyOptionsResponse;
