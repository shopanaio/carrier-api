/**
 * Base types for Nova Poshta API client
 * These are fundamental types used throughout the library
 */

// Branded types for better type safety
export type NovaPoshtaRef = string & { readonly __brand: 'NovaPoshtaRef' };
export type CityRef = string & { readonly __brand: 'CityRef' };
export type WarehouseRef = string & { readonly __brand: 'WarehouseRef' };
export type CounterpartyRef = string & { readonly __brand: 'CounterpartyRef' };
export type ContactRef = string & { readonly __brand: 'ContactRef' };
export type AddressRef = string & { readonly __brand: 'AddressRef' };
export type DocumentRef = string & { readonly __brand: 'DocumentRef' };
export type SettlementRef = string & { readonly __brand: 'SettlementRef' };
export type AreaRef = string & { readonly __brand: 'AreaRef' };
export type StreetRef = string & { readonly __brand: 'StreetRef' };
export type ObjectRef = string & { readonly __brand: 'ObjectRef' };

// Generic branded string type
export type BrandedString<T extends string> = string & { readonly __brand: T };

// String length constraints
export type String36 = string & { readonly __length: 36 };
export type String50 = string & { readonly __length: 50 };
export type String100 = string & { readonly __length: 100 };

// Utility type for creating branded strings
export function createRef<T extends string>(value: string): T {
  return value as T;
}

// Phone number type with validation
export type PhoneNumber = string & { readonly __format: 'phone' };

// Date types
export type NovaPoshtaDate = string & { readonly __format: 'dd.mm.yyyy' };
export type NovaPoshtaDateTime = string & { readonly __format: 'dd.mm.yyyy hh:mm:ss' };

// Numeric types with constraints
export type Weight = number & { readonly __unit: 'kg', readonly __min: 0.1 };
export type Volume = number & { readonly __unit: 'm3', readonly __min: 0.0004 };
export type Dimensions = number & { readonly __unit: 'cm', readonly __min: 1 };
export type Cost = number & { readonly __unit: 'uah', readonly __min: 0 };

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
  readonly apiKey: string;
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
  readonly ref: NovaPoshtaRef;
  readonly description: string;
  readonly descriptionRu?: string;
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
export type ConditionalProps<T, K extends keyof T> = T[K] extends true
  ? Required<T>
  : Partial<T>;

// Utility types for API responses
export type ApiData<T extends NovaPoshtaResponse<unknown>> = T extends NovaPoshtaResponse<infer U> ? U : never;
export type ApiSuccess<T extends NovaPoshtaResponse<unknown>> = T & { success: true };
export type ApiError<T extends NovaPoshtaResponse<unknown>> = T & { success: false };

// Type guards
export function isSuccessResponse<T>(response: NovaPoshtaResponse<T>): response is ApiSuccess<NovaPoshtaResponse<T>> {
  return response.success === true && response.errors.length === 0;
}

export function isErrorResponse<T>(response: NovaPoshtaResponse<T>): response is ApiError<NovaPoshtaResponse<T>> {
  return response.success === false || response.errors.length > 0;
}

// Validation helpers
export function isValidRef(ref: string): ref is NovaPoshtaRef {
  return typeof ref === 'string' && ref.length > 0 && /^[a-f0-9-]+$/i.test(ref);
}

export function isValidPhoneNumber(phone: string): phone is PhoneNumber {
  return /^(\+?380|380|0)[0-9]{9}$/.test(phone);
}

export function isValidDate(date: string): date is NovaPoshtaDate {
  return /^\d{2}\.\d{2}\.\d{4}$/.test(date);
}

export function isValidDateTime(dateTime: string): dateTime is NovaPoshtaDateTime {
  return /^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}:\d{2}$/.test(dateTime);
}
