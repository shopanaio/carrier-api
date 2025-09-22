/**
 * Nova Poshta API Client - Main Entry Point
 *
 * A fully typed, enterprise-grade Nova Poshta API client for Node.js and browsers
 * with comprehensive error handling, validation, caching, and retry logic.
 *
 * @example
 * ```typescript
 * import { NovaPoshtaClient, createConfig, Language, PayerType, PaymentMethod } from '@novaposhta/client';
 *
 * // Create configuration
 * const config = createConfig(process.env.NOVA_POSHTA_API_KEY!)
 *   .environment('production')
 *   .language(Language.Ukrainian)
 *   .validation(true)
 *   .caching(true)
 *   .build();
 *
 * // Initialize client
 * const client = new NovaPoshtaClient(config);
 *
 * // Track a document
 * const tracking = await client.tracking.trackDocument('20400048799000');
 * console.log('Status:', tracking?.status);
 *
 * // Get reference data
 * const cargoTypes = await client.reference.getCargoTypes();
 * const pallets = await client.reference.getPalletsList();
 *
 * // Work with addresses
 * const cities = await client.address.getCities({ FindByString: 'Kyiv' });
 * const settlements = await client.address.searchSettlements({
 *   CityName: 'kyiv',
 *   Page: 1,
 *   Limit: 50
 * });
 *
 * // Create a waybill
 * const waybill = await client.waybill.create({
 *   PayerType: PayerType.Sender,
 *   PaymentMethod: PaymentMethod.Cash,
 *   DateTime: '25.12.2024',
 *   CargoType: CargoType.Parcel,
 *   Weight: 1.5,
 *   ServiceType: ServiceType.WarehouseWarehouse,
 *   SeatsAmount: 1,
 *   Description: 'Test package',
 *   Cost: 1000,
 *   CitySender: 'sender-city-ref',
 *   Sender: 'sender-ref',
 *   SenderAddress: 'sender-address-ref',
 *   ContactSender: 'sender-contact-ref',
 *   SendersPhone: '380501234567',
 *   CityRecipient: 'recipient-city-ref',
 *   Recipient: 'recipient-ref',
 *   RecipientAddress: 'recipient-address-ref',
 *   ContactRecipient: 'recipient-contact-ref',
 *   RecipientsPhone: '380507654321',
 * });
 * ```
 *
 * @packageDocumentation
 */

// Core client
export { NovaPoshtaClient } from './core/novaPoshtaClient';
export type { ClientState, ClientMetrics, HealthCheckResult } from './core/novaPoshtaClient';

// Configuration
export {
  createConfig,
  createProductionConfig,
  createDevelopmentConfig,
  createTestConfig,
  validateConfig,
  loadConfigFromEnv,
  mergeConfigs,
  ConfigBuilder,
  DEFAULT_CLIENT_CONFIG,
} from './config';
export type { NovaPoshtaClientConfig, RequiredConfig } from './config';

// HTTP Transport
export { FetchHttpTransport, MockHttpTransport, DEFAULT_TRANSPORT_CONFIG } from './http/transport';
export type { HttpTransport, TransportConfig, RequestInterceptor, ResponseInterceptor, ErrorInterceptor } from './http/transport';

// Interceptors
export {
  LoggingInterceptor,
  ApiKeyInterceptor,
  RequestIdInterceptor,
  ResponseValidationInterceptor,
  MetricsInterceptor,
  CachingInterceptor,
  RateLimitingInterceptor,
  UserAgentInterceptor,
  TimeoutInterceptor,
  ErrorTransformInterceptor,
  RetryPolicyInterceptor,
} from './http/interceptors';
export type { MetricsCollector, CacheStorage } from './http/interceptors';

// Services
export { WaybillService, DEFAULT_WAYBILL_CONFIG } from './services/waybillService';
export type { WaybillServiceConfig } from './services/waybillService';

export { TrackingService, DEFAULT_TRACKING_CONFIG } from './services/trackingService';
export type {
  TrackingServiceConfig,
  TrackingStatistics,
  TrackingFilter
} from './services/trackingService';

export { ReferenceService, DEFAULT_REFERENCE_CONFIG } from './services/referenceService';
export type { ReferenceServiceConfig } from './services/referenceService';

export { AddressService, DEFAULT_ADDRESS_CONFIG } from './services/addressService';
export type { AddressServiceConfig, SearchSuggestions } from './services/addressService';

// Validation
export { NovaPoshtaValidator, ValidationException, validator, DEFAULT_VALIDATOR_CONFIG } from './validation/validator';
export type { ValidationResult, ValidatorConfig } from './validation/validator';
export { schemas } from './validation/schemas';

// Validation utilities
export {
  isValidNovaPoshtaRef,
  isValidPhoneNumber,
  isValidNovaPoshtaDate,
  isValidWeight,
  isValidCost,
  validateAndCast,
  validateAsync,
} from './validation/validator';

// Base types
export type {
  NovaPoshtaRef,
  CityRef,
  WarehouseRef,
  CounterpartyRef,
  ContactRef,
  AddressRef,
  DocumentRef,
  SettlementRef,
  AreaRef,
  StreetRef,
  String36,
  String50,
  String100,
  PhoneNumber,
  NovaPoshtaDate,
  NovaPoshtaDateTime,
  Weight,
  Volume,
  Dimensions,
  Cost,
  NovaPoshtaResponse,
  NovaPoshtaRequest,
  PaginationParams,
  PaginatedResponse,
  SearchParams,
  ReferenceItem,
  Location,
  AddressComponents,
  TimeInterval,
  CargoDimensions,
  MoneyAmount,
  Result,
} from './types/base';

// Base utility functions
export {
  createRef,
  isSuccessResponse,
  isErrorResponse,
  isValidRef,
  isValidPhoneNumber as isValidPhoneBase,
  isValidDate,
  isValidDateTime,
} from './types/base';

// Enums
export {
  NovaPoshtaModel,
  NovaPoshtaMethod,
  PaymentMethod,
  CargoType,
  ServiceType,
  PayerType,
  DeliveryStatus,
  WarehouseType,
  SettlementType,
  OwnershipForm,
  CounterpartyType,
  ContactPersonType,
  TimeIntervalType,
  PickupTimeInterval,
  BackwardDeliveryType,
  BackwardDeliverySubtype,
  AdditionalService,
  DocumentType,
  Currency,
  Language,
  DeliveryDay,
  PackingType,
  TireWheelType,
  StreetType,
} from './types/enums';

// Enum utilities
export {
  NOVA_POSHTA_MODELS,
  NOVA_POSHTA_METHODS,
  PAYMENT_METHODS,
  CARGO_TYPES,
  SERVICE_TYPES,
  PAYER_TYPES,
  DELIVERY_STATUSES,
  isPaymentMethod,
  isCargoType,
  isServiceType,
  isPayerType,
} from './types/enums';

// Error types
export {
  NovaPoshtaErrorCode,
  ErrorCategory,
  ErrorSeverity,
  ERROR_MESSAGES,
  getErrorInfo,
  isRetryableError,
  getErrorSeverity,
  categorizeError,
} from './types/errors';
export type {
  NovaPoshtaError,
  ValidationError,
  AuthenticationError,
  NetworkError,
  BusinessLogicError,
  ConfigurationError,
} from './types/errors';

// Waybill types
export type {
  CreateWaybillRequest,
  CreateWaybillWithOptionsRequest,
  CreatePoshtomatWaybillRequest,
  UpdateWaybillRequest,
  DeleteWaybillRequest,
  OptionsSeatItem,
  PoshtomatOptionsSeatItem,
  BackwardDeliveryItem,
  AdditionalServices,
  WaybillCreationData,
  CreateWaybillResponse,
  WaybillUpdateData,
  UpdateWaybillResponse,
  WaybillDeletionData,
  DeleteWaybillResponse,
  DeliveryDateRequest,
  DeliveryDateData,
  DeliveryDateResponse,
  PriceCalculationRequest,
  BackwardDeliveryCalculation,
  CargoDetail,
  TariffZoneInfo,
  PriceCalculationData,
  PriceCalculationResponse,
} from './types/waybill';

// Waybill utilities
export {
  isValidPoshtomatDimensions,
  isValidPoshtomatCargoType,
  isValidPoshtomatServiceType,
  calculateTotalWeight,
  calculateTotalVolume,
  hasAdditionalServices,
  hasBackwardDelivery,
  isThirdPersonPayer,
} from './types/waybill';

// Tracking types
export type {
  TrackDocumentsRequest,
  TrackDocumentItem,
  TrackingStatusData,
  TrackingResponse,
  DocumentMovementRequest,
  DocumentMovementData,
  DocumentMovementResponse,
  DocumentListRequest,
  DocumentListData,
  DocumentListResponse,
} from './types/tracking';

// Tracking utilities
export {
  isTrackingSuccessful,
  isDocumentDelivered,
  isDocumentInTransit,
  isDocumentAtWarehouse,
} from './types/tracking';

// Reference types
export type {
  GetCargoTypesRequest,
  GetCargoTypesResponse,
  CargoTypeData,
  GetPalletsListRequest,
  GetPalletsListResponse,
  PalletData,
  GetPackListRequest,
  GetPackListResponse,
  PackData,
  GetTiresWheelsListRequest,
  GetTiresWheelsListResponse,
  TireWheelData,
  GetCargoDescriptionListRequest,
  GetCargoDescriptionListResponse,
  CargoDescriptionData,
  GetMessageCodeTextRequest,
  GetMessageCodeTextResponse,
  MessageCodeData,
  GetServiceTypesRequest,
  GetServiceTypesResponse,
  ServiceTypeData,
  GetOwnershipFormsListRequest,
  GetOwnershipFormsListResponse,
  OwnershipFormData,
  GetTimeIntervalsRequest,
  GetTimeIntervalsResponse,
  TimeIntervalData,
  GetPickupTimeIntervalsRequest,
  GetPickupTimeIntervalsResponse,
  PickupTimeIntervalData,
  GetBackwardDeliveryCargoTypesRequest,
  GetBackwardDeliveryCargoTypesResponse,
  BackwardDeliveryCargoTypeData,
  GetTypesOfPayersForRedeliveryRequest,
  GetTypesOfPayersForRedeliveryResponse,
  PayerForRedeliveryData,
  ReferenceRequest,
  ReferenceResponse,
  ReferenceData,
} from './types/reference';

// Address types
export type {
  GetSettlementsRequest,
  GetSettlementsResponse,
  SettlementAreaData,
  GetSettlementCountryRegionRequest,
  GetSettlementCountryRegionResponse,
  SettlementRegionData,
  GetCitiesRequest,
  GetCitiesResponse,
  CityData,
  GetStreetRequest,
  GetStreetResponse,
  StreetData,
  SearchSettlementsRequest,
  SearchSettlementsResponse,
  SearchSettlementAddress,
  SearchSettlementsData,
  SearchSettlementStreetsRequest,
  SearchSettlementStreetsResponse,
  AddressLocation,
  SettlementStreetAddress,
  SearchSettlementStreetsData,
  AddressRequest,
  AddressResponse,
  AddressData,
  CitySearchResult,
  StreetSearchResult,
} from './types/address';

// Version information
export const VERSION = '1.0.0';
export const SUPPORTED_API_VERSION = '2.0';

// Default exports for convenience
import { NovaPoshtaClient } from './core/novaPoshtaClient';
import { createConfig, createProductionConfig, createDevelopmentConfig } from './config';
import { Language } from './types/enums';

export default NovaPoshtaClient;

/**
 * Quick start function for creating a client with minimal configuration
 *
 * @example
 * ```typescript
 * import { quickStart } from '@novaposhta/client';
 *
 * const client = quickStart('your-api-key');
 * const tracking = await client.tracking.trackDocument('20400048799000');
 * ```
 */
export function quickStart(apiKey: string): NovaPoshtaClient {
  const config = createConfig(apiKey).build();
  return new NovaPoshtaClient(config);
}

/**
 * Create a production-ready client with optimal settings
 *
 * @example
 * ```typescript
 * import { createProductionClient } from '@novaposhta/client';
 *
 * const client = createProductionClient('your-api-key', {
 *   language: Language.English,
 *   enableMetrics: true,
 * });
 * ```
 */
export function createProductionClient(
  apiKey: string,
  options?: {
    language?: Language;
    enableMetrics?: boolean;
    userAgent?: string;
  }
): NovaPoshtaClient {
  let config = createProductionConfig(apiKey);

  if (options?.language) {
    config = { ...config, language: options.language };
  }

  if (options?.enableMetrics) {
    config = { ...config, enableMetrics: options.enableMetrics };
  }

  if (options?.userAgent) {
    config = { ...config, userAgent: options.userAgent };
  }

  return new NovaPoshtaClient(config);
}

/**
 * Create a development client with debugging features enabled
 *
 * @example
 * ```typescript
 * import { createDevelopmentClient } from '@novaposhta/client';
 *
 * const client = createDevelopmentClient('your-api-key');
 * ```
 */
export function createDevelopmentClient(apiKey: string): NovaPoshtaClient {
  const config = createDevelopmentConfig(apiKey);
  return new NovaPoshtaClient(config);
}
