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
 * const cities = await client.address.getCities({ findByString: 'Kyiv' });
 * const settlements = await client.address.searchSettlements({
 *   cityName: 'kyiv',
 *   page: 1,
 *   limit: 50
 * });
 *
 * // Create a waybill
 * const waybill = await client.waybill.create({
 *   payerType: PayerType.Sender,
 *   paymentMethod: PaymentMethod.Cash,
 *   dateTime: '25.12.2024',
 *   cargoType: CargoType.Parcel,
 *   weight: 1.5,
 *   serviceType: ServiceType.WarehouseWarehouse,
 *   seatsAmount: 1,
 *   description: 'Test package',
 *   cost: 1000,
 *   citySender: 'sender-city-ref',
 *   sender: 'sender-ref',
 *   senderAddress: 'sender-address-ref',
 *   contactSender: 'sender-contact-ref',
 *   sendersPhone: '380501234567',
 *   cityRecipient: 'recipient-city-ref',
 *   recipient: 'recipient-ref',
 *   recipientAddress: 'recipient-address-ref',
 *   contactRecipient: 'recipient-contact-ref',
 *   recipientsPhone: '380507654321',
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
import { createConfig } from './config';

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
