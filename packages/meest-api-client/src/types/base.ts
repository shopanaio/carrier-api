// code and comments in English
/** Shared nominal types used across the Meest API */
export type Token = string;
export type ContractId = string;
export type ParcelId = string;
export type ParcelNumber = string;
export type TrackNumber = string;
export type PhoneNumber = string;
export type CityId = string;
export type BranchId = string;
export type CountryId = string;
export type DistrictId = string;
export type RegionId = string;
export type ZipCode = string;
export type Money = number;
export type Weight = number;
export type Volume = number;
export type Percentage = number;

export type Latitude = number;
export type Longitude = number;

export interface GeoPoint {
  latitude: Latitude;
  longitude: Longitude;
}

export type LanguageCode = 'uk' | 'en' | 'ru';

export interface PaginatedRequest {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  total?: number;
  rows: T[];
}

export type ResponseFormat = 'json' | 'arraybuffer' | 'stream';

export type MeestResponseStatus = 'OK' | 'Error';

export interface MeestResponse<T> {
  status: MeestResponseStatus;
  info?: string;
  fieldName?: string;
  message?: string;
  messageDetails?: string;
  result: T;
}

export type MaybeArray<T> = T | T[];

export interface RequestMetadata {
  requestId?: string;
  durationMs?: number;
}
