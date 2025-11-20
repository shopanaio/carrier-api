/**
 * Address service types for Nova Poshta API
 * Handles all address-related operations
 */

import type {
  NovaPoshtaResponse,
  ObjectRef,
  SettlementRef,
  CityRef,
  StreetRef,
  CounterpartyRef,
  AddressRef,
} from './base';

// Address-specific types
export type SettlementAreaRef = string;
export type SettlementRegionRef = string;
export type StreetTypeRef = string;

// =============================================================================
// SETTLEMENTS (AREAS)
// =============================================================================

export interface GetSettlementsRequest {
  /** Area identifier (optional) */
  readonly Ref?: SettlementAreaRef;
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
  readonly AreaRef: SettlementAreaRef;
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
  readonly Ref?: CityRef;
  /** Search by city name (optional) */
  readonly FindByString?: string;
  /** Page number (optional) */
  readonly Page?: number;
  /** Records per page (optional) */
  readonly Limit?: number;
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
  readonly CityRef: CityRef;
  /** Search string (optional, but works better without it) */
  readonly FindByString?: string;
  /** Page number (optional, up to 500 records per page) */
  readonly Page?: number;
  /** Records per page (optional) */
  readonly Limit?: number;
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
  readonly CityName: string;
  /** Page number (up to 500 records per page) */
  readonly Page: number;
  /** Records per page limit */
  readonly Limit: number;
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
  readonly StreetName: string;
  /** Settlement identifier from settlements directory */
  readonly SettlementRef: SettlementRef;
  /** Response limit (optional) */
  readonly Limit?: number;
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
// WAREHOUSES
// =============================================================================

export interface GetWarehousesRequest {
  /** Specific warehouse reference (returns single warehouse) */
  readonly Ref?: string;
  /** City name filter */
  readonly CityName?: string;
  /** City identifier */
  readonly CityRef?: CityRef;
  /** Settlement identifier from getSettlements */
  readonly SettlementRef?: SettlementRef;
  /** Search by warehouse number (e.g., "1" for Branch #1) */
  readonly WarehouseId?: string;
  /** Search string for warehouse name or address */
  readonly FindByString?: string;
  /** Warehouse type reference filter */
  readonly TypeOfWarehouseRef?: string;
  /** Filter by bicycle parking availability (1/0) */
  readonly BicycleParking?: string;
  /** Filter by NovaPay cash desk availability (1/0) */
  readonly PostFinance?: string;
  /** Filter by POS terminal availability (1/0) */
  readonly POSTerminal?: string;
  /** Page number (max 500 records per page) */
  readonly Page?: number;
  /** Records per page (works with Page parameter) */
  readonly Limit?: number;
  /** Language code (UA or RU, default UA) */
  readonly Language?: string;
}

export interface DimensionsLimitation {
  /** Width in cm */
  readonly Width: number;
  /** Height in cm */
  readonly Height: number;
  /** Length in cm */
  readonly Length: number;
}

export interface WarehouseData {
  /** Warehouse code */
  readonly SiteKey: string;
  /** Warehouse name in Ukrainian */
  readonly Description: string;
  /** Warehouse name in Russian */
  readonly DescriptionRu: string;
  /** Short address in Ukrainian */
  readonly ShortAddress: string;
  /** Short address in Russian */
  readonly ShortAddressRu: string;
  /** Phone number */
  readonly Phone: string;
  /** Type of warehouse */
  readonly TypeOfWarehouse: string;
  /** Warehouse identifier */
  readonly Ref: string;
  /** Warehouse number */
  readonly Number: string;
  /** City identifier */
  readonly CityRef: CityRef;
  /** City name in Ukrainian */
  readonly CityDescription: string;
  /** City name in Russian */
  readonly CityDescriptionRu: string;
  /** Settlement identifier */
  readonly SettlementRef: SettlementRef;
  /** Settlement description */
  readonly SettlementDescription: string;
  /** Settlement area description */
  readonly SettlementAreaDescription: string;
  /** Settlement region description */
  readonly SettlementRegionsDescription: string;
  /** Settlement type in Ukrainian */
  readonly SettlementTypeDescription: string;
  /** Settlement type in Russian */
  readonly SettlementTypeDescriptionRu: string;
  /** Longitude coordinate */
  readonly Longitude: string;
  /** Latitude coordinate */
  readonly Latitude: string;
  /** NovaPay cash desk availability (1/0) */
  readonly PostFinance: string;
  /** Bicycle parking availability (1/0) */
  readonly BicycleParking: string;
  /** Payment access availability (1/0) */
  readonly PaymentAccess: string;
  /** POS terminal availability (1/0) */
  readonly POSTerminal: string;
  /** International shipping availability (1/0) */
  readonly InternationalShipping: string;
  /** Self-service workplaces count (1/0) */
  readonly SelfServiceWorkplacesCount: string;
  /** Total maximum weight allowed */
  readonly TotalMaxWeightAllowed: string;
  /** Maximum weight per one place */
  readonly PlaceMaxWeightAllowed: string;
  /** Sending limitations on dimensions */
  readonly SendingLimitationsOnDimensions: DimensionsLimitation;
  /** Receiving limitations on dimensions */
  readonly ReceivingLimitationsOnDimensions: DimensionsLimitation;
  /** Reception schedule */
  readonly Reception: Record<string, string>;
  /** Delivery schedule (same day) */
  readonly Delivery: Record<string, string>;
  /** Working schedule */
  readonly Schedule: Record<string, string>;
  /** District code */
  readonly DistrictCode: string;
  /** Warehouse status */
  readonly WarehouseStatus: string;
  /** Warehouse status date */
  readonly WarehouseStatusDate: string;
  /** Category of warehouse */
  readonly CategoryOfWarehouse: string;
  /** Region/City */
  readonly RegionCity: string;
  /** Warehouse belongs to franchise network (1/0) */
  readonly WarehouseForAgent: string;
  /** Maximum declared cost */
  readonly MaxDeclaredCost: string;
  /** Deny to select warehouse in Internet Document (0/1) */
  readonly DenyToSelect: string;
  /** Postomat type (None/FullDayService/PartTime/ForResidentOfEntrance/Private/LimitedAccess) */
  readonly PostMachineType: string;
  /** Postal code of warehouse address */
  readonly PostalCodeUA: string;
  /** Only receiving parcel flag (1/0) */
  readonly OnlyReceivingParcel: string;
  /** Digital warehouse address (settlement index/warehouse number) */
  readonly WarehouseIndex: string;
}

export type GetWarehousesResponse = NovaPoshtaResponse<WarehouseData[]>;

// =============================================================================
// ADDRESS CRUD OPERATIONS
// =============================================================================

export interface SaveAddressRequest {
  /** Counterparty reference (sender or recipient) */
  readonly CounterpartyRef: CounterpartyRef;
  /** Street reference */
  readonly StreetRef: StreetRef;
  /** Building number (house) */
  readonly BuildingNumber: string;
  /** Apartment number */
  readonly Flat?: string;
  /** Additional note */
  readonly Note?: string;
}

export interface SavedAddressData {
  /** Address reference */
  readonly Ref: AddressRef;
  /** Human readable description */
  readonly Description: string;
}

export type SaveAddressResponse = NovaPoshtaResponse<SavedAddressData[]>;

export interface UpdateAddressRequest {
  /** Address reference */
  readonly Ref: AddressRef;
  /** Counterparty reference */
  readonly CounterpartyRef: CounterpartyRef;
  /** Street reference */
  readonly StreetRef: StreetRef;
  /** Building number */
  readonly BuildingNumber: string;
  /** Apartment number */
  readonly Flat?: string;
  /** Additional note */
  readonly Note?: string;
}

export type UpdateAddressResponse = NovaPoshtaResponse<SavedAddressData[]>;

export interface DeleteAddressRequest {
  /** Address reference */
  readonly Ref: AddressRef;
}

export interface AddressDeletionData {
  /** Deleted address reference */
  readonly Ref: AddressRef;
}

export type DeleteAddressResponse = NovaPoshtaResponse<AddressDeletionData[]>;

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
  | SearchSettlementStreetsRequest
  | GetWarehousesRequest
  | SaveAddressRequest
  | UpdateAddressRequest
  | DeleteAddressRequest;

/** All address response types */
export type AddressResponse =
  | GetSettlementsResponse
  | GetSettlementCountryRegionResponse
  | GetCitiesResponse
  | GetStreetResponse
  | SearchSettlementsResponse
  | SearchSettlementStreetsResponse
  | GetWarehousesResponse
  | SaveAddressResponse
  | UpdateAddressResponse
  | DeleteAddressResponse;

/** All address data types */
export type AddressData =
  | SettlementAreaData
  | SettlementRegionData
  | CityData
  | StreetData
  | SearchSettlementsData
  | SearchSettlementStreetsData
  | WarehouseData
  | SavedAddressData
  | AddressDeletionData;
