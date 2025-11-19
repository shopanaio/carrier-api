/**
 * Base types for Nova Poshta API client
 * These are fundamental types used throughout the library
 */

// Reference types
export type NovaPoshtaRef = string;
export type CityRef = string;
export type WarehouseRef = string;
export type CounterpartyRef = string;
export type ContactRef = string;
export type AddressRef = string;
export type DocumentRef = string;
export type SettlementRef = string;
export type AreaRef = string;
export type StreetRef = string;
export type ObjectRef = string;

// String types
export type String36 = string;
export type String50 = string;
export type String100 = string;

// Phone number type
export type PhoneNumber = string;

// Date types
export type NovaPoshtaDate = string;
export type NovaPoshtaDateTime = string;

// Numeric types
export type Weight = number;
export type Volume = number;
export type Dimensions = number;
export type Cost = number;

// Generic response wrapper
export interface NovaPoshtaResponse<T = unknown> {
  readonly success: boolean;
  readonly data: T;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly info: readonly string[];
  readonly messageCodes: readonly string[];
  readonly errorCodes: readonly string[];
  readonly warningCodes: readonly string[];
  readonly infoCodes: readonly string[];
}

// API request base structure
export interface NovaPoshtaRequest {
  readonly apiKey?: string;
  readonly modelName: string;
  readonly calledMethod: string;
  readonly methodProperties: Record<string, unknown>;
}

// Pagination support
export interface PaginationParams {
  readonly page?: number;
  readonly limit?: number;
}

export interface PaginatedResponse<T> extends NovaPoshtaResponse<T> {
  readonly totalCount?: number;
  readonly currentPage?: number;
  readonly totalPages?: number;
}

// Search parameters
export interface SearchParams extends PaginationParams {
  readonly findByString?: string;
}

// Generic identifier with description
export interface ReferenceItem {
  readonly Ref: NovaPoshtaRef;
  readonly Description: string;
  readonly DescriptionRu?: string;
}

// Location coordinates
export interface Location {
  readonly lat: string;
  readonly lon: string;
}

// Address components
export interface AddressComponents {
  readonly settlement: string;
  readonly settlementRef: SettlementRef;
  readonly area: string;
  readonly areaRef: AreaRef;
  readonly region?: string;
  readonly regionRef?: AreaRef;
  readonly street?: string;
  readonly streetRef?: StreetRef;
  readonly buildingNumber?: string;
  readonly flat?: string;
}

// Time interval
export interface TimeInterval {
  readonly start: string;
  readonly end: string;
}

// Cargo dimensions
export interface CargoDimensions {
  readonly weight: Weight;
  readonly length?: Dimensions;
  readonly width?: Dimensions;
  readonly height?: Dimensions;
  readonly volume?: Volume;
}

// Money amount with currency
export interface MoneyAmount {
  readonly amount: Cost;
  readonly currency: 'UAH' | 'USD' | 'EUR';
}

// Result types for operations
export type Result<T, E = Error> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

// Optional with reason
export type Optional<T, R extends string = 'optional'> = T | undefined;

// Conditional types for service-specific parameters
export type ConditionalProps<T, K extends keyof T> = T[K] extends true ? Required<T> : Partial<T>;

// Utility types for API responses
export type ApiData<T extends NovaPoshtaResponse<unknown>> = T extends NovaPoshtaResponse<infer U> ? U : never;
