// Core client factory
export { createClient, DEFAULT_BASE_URL } from './core/client';
export type { Client, ClientContext, PluggableNamedService } from './core/client';

// Token helpers
export { TokenManager } from './core/tokenManager';

// HTTP transport types
// Note: HttpTransport interface is compatible with @shopana/carrier-transport
// For transport implementation, install @shopana/carrier-transport and use createFetchTransport
export type { HttpTransport, HttpRequest, HttpResponse, HttpMethod } from './http/transport';

// Services
export { AuthService } from './services/authService';
export { SearchService } from './services/searchService';
export { ParcelsService } from './services/parcelsService';
export { RegistersService } from './services/registersService';
export { PrintService } from './services/printService';
export type { PrintArtifact, PrintRequestOptions } from './services/printService';
export { TrackingService } from './services/trackingService';
export { MiscService } from './services/miscService';

// Shared utils
export { RequestBuilder } from './utils/requestBuilder';
export type { ServiceRequestConfig } from './utils/requestBuilder';

// Errors
export {
  MeestError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  TransportError,
  UnexpectedResponseError,
  toMeestError,
  assertOk,
} from './errors';

// Base types & enums
export type {
  Token,
  ContractId,
  ParcelId,
  ParcelNumber,
  TrackNumber,
  GeoPoint,
  PaginatedRequest,
  PaginatedResponse,
  MeestResponse,
  MeestResponseStatus,
} from './types/base';
export { PaymentType, ServiceType, ParcelService, DeliveryOption, ParcelStatusCode, PrintFormat } from './types/enums';

// Auth types
export type { LoginRequest, LoginResponse, LoginTokens, RefreshTokenRequest, RefreshResponse, RefreshTokens } from './types/auth';

// Search types
export type {
  AddressSearchRequestBody,
  AddressSearchResult,
  AddressSearchResponse,
  AddressSearchByCoordRequestBody,
  AddressSearchByCoordResult,
  AddressSearchByCoordResponse,
  BranchSearchRequestBody,
  BranchSearchResult,
  BranchSearchResponse,
  BranchSearchGeoPathParams,
  BranchSearchGeoResult,
  BranchSearchGeoResponse,
  BranchTypesResult,
  BranchTypesResponse,
  CitySearchRequestBody,
  CitySearchResult,
  CitySearchResponse,
  CountrySearchRequestBody,
  CountrySearchResult,
  CountrySearchResponse,
  DistrictSearchRequestBody,
  DistrictSearchResult,
  DistrictSearchResponse,
  RegionSearchRequestBody,
  RegionSearchResult,
  RegionSearchResponse,
  ZipCodeSearchPathParams,
  ZipCodeSearchResult,
  ZipCodeSearchResponse,
  PayTerminalSearchPathParams,
  PayTerminalSearchResult,
  PayTerminalSearchResponse,
} from './types/search';

// Parcels types
export type * from './types/parcels';

// Registers types
export type * from './types/registers';

// Print types
export type * from './types/print';

// Tracking types
export type * from './types/tracking';

// Misc types
export type * from './types/misc';
