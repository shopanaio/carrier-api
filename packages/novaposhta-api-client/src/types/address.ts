/**
 * Address service types for Nova Poshta API
 * Handles all address-related operations
 */

import type { NovaPoshtaResponse, ObjectRef, SettlementRef, CityRef, StreetRef } from './base';

// Address-specific types
export type SettlementAreaRef = string;
export type SettlementRegionRef = string;
export type StreetTypeRef = string;

// =============================================================================
// SETTLEMENTS (AREAS)
// =============================================================================

export interface GetSettlementsRequest {
  /** Area identifier (optional) */
  readonly ref?: SettlementAreaRef;
}

export interface SettlementAreaData {
  /** Area name */
  readonly Description: string;
  /** Area identifier */
  readonly Ref: SettlementAreaRef;
  /** Administrative center of the area */
  readonly AreasCenter: ObjectRef;
  /** Region type (e.g., "region") */
  readonly RegionType: string;
}

export type GetSettlementsResponse = NovaPoshtaResponse<SettlementAreaData[]>;

// =============================================================================
// SETTLEMENT COUNTRY REGIONS
// =============================================================================

export interface GetSettlementCountryRegionRequest {
  /** Area identifier */
  readonly areaRef: SettlementAreaRef;
}

export interface SettlementRegionData {
  /** Region identifier */
  readonly Ref: SettlementRegionRef;
  /** Region name */
  readonly Description: string;
  /** Region type (e.g., "district") */
  readonly RegionType: string;
  /** Administrative center */
  readonly AreasCenter: ObjectRef;
}

export type GetSettlementCountryRegionResponse = NovaPoshtaResponse<SettlementRegionData[]>;

// =============================================================================
// CITIES
// =============================================================================

export interface GetCitiesRequest {
  /** City identifier (optional) */
  readonly ref?: CityRef;
  /** Search by city name (optional) */
  readonly findByString?: string;
  /** Page number (optional) */
  readonly page?: number;
  /** Records per page (optional) */
  readonly limit?: number;
}

export interface CityData {
  /** City name in Ukrainian */
  readonly Description: string;
  /** City name in Russian */
  readonly DescriptionRu: string;
  /** City identifier */
  readonly Ref: CityRef;
  /** Delivery availability (Monday) */
  readonly Delivery1: string;
  /** Delivery availability (Tuesday) */
  readonly Delivery2: string;
  /** Delivery availability (Wednesday) */
  readonly Delivery3: string;
  /** Delivery availability (Thursday) */
  readonly Delivery4: string;
  /** Delivery availability (Friday) */
  readonly Delivery5: string;
  /** Delivery availability (Saturday) */
  readonly Delivery6: string;
  /** Delivery availability (Sunday) */
  readonly Delivery7: string;
  /** Area identifier */
  readonly Area: ObjectRef;
  /** Settlement type identifier */
  readonly SettlementType: ObjectRef;
  /** Is branch flag (1 - branch, 0 - partner) */
  readonly IsBranch: string;
  /** Prevent new streets entry flag */
  readonly PreventEntryNewStreetsUser: string;
  /** Conglomerates */
  readonly Conglomerates: string;
  /** City ID */
  readonly CityID: string;
  /** Settlement type description in Russian */
  readonly SettlementTypeDescriptionRu: string;
  /** Settlement type description in Ukrainian */
  readonly SettlementTypeDescription: string;
}

export type GetCitiesResponse = NovaPoshtaResponse<CityData[]>;

// =============================================================================
// STREETS
// =============================================================================

export interface GetStreetRequest {
  /** City identifier (required) */
  readonly cityRef: CityRef;
  /** Search string (optional, but works better without it) */
  readonly findByString?: string;
  /** Page number (optional, up to 500 records per page) */
  readonly page?: number;
  /** Records per page (optional) */
  readonly limit?: number;
}

export interface StreetData {
  /** Street identifier */
  readonly Ref: StreetRef;
  /** Street name in Ukrainian */
  readonly Description: string;
  /** Street type identifier */
  readonly StreetsTypeRef: StreetTypeRef;
  /** Street type (e.g., "line") */
  readonly StreetsType: string;
}

export type GetStreetResponse = NovaPoshtaResponse<StreetData[]>;

// =============================================================================
// SEARCH SETTLEMENTS
// =============================================================================

export interface SearchSettlementsRequest {
  /** City name or postal index (not required to be complete) */
  readonly cityName: string;
  /** Page number (up to 500 records per page) */
  readonly page: number;
  /** Records per page limit */
  readonly limit: number;
}

export interface SearchSettlementAddress {
  /** Number of warehouses */
  readonly Warehouses: number;
  /** Main description (city name) */
  readonly MainDescription: string;
  /** Area name */
  readonly Area: string;
  /** Region name */
  readonly Region: string;
  /** Settlement type code (e.g., "city", "village") */
  readonly SettlementTypeCode: string;
  /** Settlement reference from getSettlements */
  readonly Ref: SettlementRef;
  /** Delivery city reference from getCities */
  readonly DeliveryCity: CityRef;
}

export interface SearchSettlementsData {
  /** Total count of found objects */
  readonly TotalCount: number;
  /** Array of found addresses */
  readonly Addresses: SearchSettlementAddress[];
}

export type SearchSettlementsResponse = NovaPoshtaResponse<SearchSettlementsData[]>;

// =============================================================================
// SEARCH SETTLEMENT STREETS
// =============================================================================

export interface SearchSettlementStreetsRequest {
  /** Street name */
  readonly streetName: string;
  /** Settlement identifier from settlements directory */
  readonly settlementRef: SettlementRef;
  /** Response limit (optional) */
  readonly limit?: number;
}

export interface AddressLocation {
  /** Geographical latitude */
  readonly Lat: string;
  /** Geographical longitude */
  readonly Lon: string;
}

export interface SettlementStreetAddress {
  /** Settlement identifier */
  readonly SettlementRef: SettlementRef;
  /** Street identifier */
  readonly SettlementStreetRef: StreetRef;
  /** Street name */
  readonly SettlementStreetDescription: string;
  /** Full street name with type */
  readonly Present: string;
  /** Street type identifier */
  readonly StreetsType: StreetTypeRef;
  /** Street type description */
  readonly StreetsTypeDescription: string;
  /** Location coordinates */
  readonly Location: AddressLocation;
  /** Street name in Russian */
  readonly SettlementStreetDescriptionRu: string;
}

export interface SearchSettlementStreetsData {
  /** Total count of found objects */
  readonly TotalCount: number;
  /** Array of found street addresses */
  readonly Addresses: SettlementStreetAddress[];
}

export type SearchSettlementStreetsResponse = NovaPoshtaResponse<SearchSettlementStreetsData[]>;

// =============================================================================
// AGGREGATE TYPES
// =============================================================================

/** All address request types */
export type AddressRequest =
  | GetSettlementsRequest
  | GetSettlementCountryRegionRequest
  | GetCitiesRequest
  | GetStreetRequest
  | SearchSettlementsRequest
  | SearchSettlementStreetsRequest;

/** All address response types */
export type AddressResponse =
  | GetSettlementsResponse
  | GetSettlementCountryRegionResponse
  | GetCitiesResponse
  | GetStreetResponse
  | SearchSettlementsResponse
  | SearchSettlementStreetsResponse;

/** All address data types */
export type AddressData =
  | SettlementAreaData
  | SettlementRegionData
  | CityData
  | StreetData
  | SearchSettlementsData
  | SearchSettlementStreetsData;
