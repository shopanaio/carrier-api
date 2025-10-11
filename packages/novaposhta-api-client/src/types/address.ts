/**
 * Address service types for Nova Poshta API
 * Handles all address-related operations
 */

import type { NovaPoshtaResponse, ObjectRef, BrandedString } from './base';

// Branded types for address data
export type SettlementRef = BrandedString<'SettlementRef'>;
export type SettlementAreaRef = BrandedString<'SettlementAreaRef'>;
export type SettlementRegionRef = BrandedString<'SettlementRegionRef'>;
export type CityRef = BrandedString<'CityRef'>;
export type StreetRef = BrandedString<'StreetRef'>;
export type StreetTypeRef = BrandedString<'StreetTypeRef'>;

// =============================================================================
// SETTLEMENTS (AREAS)
// =============================================================================

export interface GetSettlementsRequest {
  /** Area identifier (optional) */
  readonly ref?: SettlementAreaRef;
}

export interface SettlementAreaData {
  /** Area name */
  readonly description: string;
  /** Area identifier */
  readonly ref: SettlementAreaRef;
  /** Administrative center of the area */
  readonly areasCenter: ObjectRef;
  /** Region type (e.g., "region") */
  readonly regionType: string;
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
  readonly ref: SettlementRegionRef;
  /** Region name */
  readonly description: string;
  /** Region type (e.g., "district") */
  readonly regionType: string;
  /** Administrative center */
  readonly areasCenter: ObjectRef;
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
  readonly description: string;
  /** City name in Russian */
  readonly descriptionRu: string;
  /** City identifier */
  readonly ref: CityRef;
  /** Delivery availability (Monday) */
  readonly delivery1: string;
  /** Delivery availability (Tuesday) */
  readonly delivery2: string;
  /** Delivery availability (Wednesday) */
  readonly delivery3: string;
  /** Delivery availability (Thursday) */
  readonly delivery4: string;
  /** Delivery availability (Friday) */
  readonly delivery5: string;
  /** Delivery availability (Saturday) */
  readonly delivery6: string;
  /** Delivery availability (Sunday) */
  readonly delivery7: string;
  /** Area identifier */
  readonly area: ObjectRef;
  /** Settlement type identifier */
  readonly settlementType: ObjectRef;
  /** Is branch flag (1 - branch, 0 - partner) */
  readonly isBranch: string;
  /** Prevent new streets entry flag */
  readonly preventEntryNewStreetsUser: string;
  /** Conglomerates */
  readonly conglomerates: string;
  /** City ID */
  readonly cityID: string;
  /** Settlement type description in Russian */
  readonly settlementTypeDescriptionRu: string;
  /** Settlement type description in Ukrainian */
  readonly settlementTypeDescription: string;
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
  readonly ref: StreetRef;
  /** Street name in Ukrainian */
  readonly description: string;
  /** Street type identifier */
  readonly streetsTypeRef: StreetTypeRef;
  /** Street type (e.g., "line") */
  readonly streetsType: string;
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
  readonly warehouses: number;
  /** Main description (city name) */
  readonly mainDescription: string;
  /** Area name */
  readonly area: string;
  /** Region name */
  readonly region: string;
  /** Settlement type code (e.g., "city", "village") */
  readonly settlementTypeCode: string;
  /** Settlement reference from getSettlements */
  readonly ref: SettlementRef;
  /** Delivery city reference from getCities */
  readonly deliveryCity: CityRef;
}

export interface SearchSettlementsData {
  /** Total count of found objects */
  readonly totalCount: number;
  /** Array of found addresses */
  readonly addresses: SearchSettlementAddress[];
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
  readonly lat: string;
  /** Geographical longitude */
  readonly lon: string;
}

export interface SettlementStreetAddress {
  /** Settlement identifier */
  readonly settlementRef: SettlementRef;
  /** Street identifier */
  readonly settlementStreetRef: StreetRef;
  /** Street name */
  readonly settlementStreetDescription: string;
  /** Full street name with type */
  readonly present: string;
  /** Street type identifier */
  readonly streetsType: StreetTypeRef;
  /** Street type description */
  readonly streetsTypeDescription: string;
  /** Location coordinates */
  readonly location: AddressLocation;
  /** Street name in Russian */
  readonly settlementStreetDescriptionRu: string;
}

export interface SearchSettlementStreetsData {
  /** Total count of found objects */
  readonly totalCount: number;
  /** Array of found street addresses */
  readonly addresses: SettlementStreetAddress[];
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

// =============================================================================
// HELPER TYPES
// =============================================================================

/** City search result with additional metadata */
export interface CitySearchResult extends CityData {
  /** Calculated relevance score */
  readonly relevanceScore?: number;
  /** Distance from search location */
  readonly distance?: number;
}

/** Street search result with additional metadata */
export interface StreetSearchResult extends StreetData {
  /** Parent city information */
  readonly cityInfo?: Pick<CityData, 'description' | 'ref'>;
  /** Calculated relevance score */
  readonly relevanceScore?: number;
}
