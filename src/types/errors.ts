/**
 * Error codes and types for Nova Poshta API
 * Complete mapping of all Nova Poshta error codes with descriptions
 */

// Error code enum with all Nova Poshta error codes
export enum NovaPoshtaErrorCode {
  // Authentication and user errors (20000100xxx)
  ActivationError = '20000100007',
  UnknownError = '20000100008',
  CannotCreateVipUser = '20000100010',
  ApiKeyGenerationError = '20000100012',
  GetLoyaltyCardFail = '20000100013',
  IncorrectData = '20000100014',
  InvalidLoginOrPassword = '20000100015',
  ServiceUnavailable = '20000100016',
  EmailAlreadyUsed = '20000100017',
  InvalidPhoneNumber = '20000100018',
  CounterpartyLoyaltyProhibited = '20000100019',
  IncorrectSmsCode = '20000100020',
  UnableToSaveData = '20000100021',
  UnableToSendSms = '20000100022',
  UserAlreadyExists = '20000100023',
  UserNotFound = '20000100024',
  VipClientEmailExists = '20000100025',
  WrongActivationCode = '20000100026',
  WrongPasswordOrUserNotFound = '20000100027',

  // Document and shipment errors (20000200xxx)
  AccompanyingDocumentsLengthIncorrect = '20000200028',
  AccountNumberAndSumRequired = '20000200029',
  AdditionalInformationLengthIncorrect = '20000200030',
  AfterpaymentDisabledForInPost = '20000200031',
  AfterpaymentDisabledForNovaPoshta = '20000200032',
  AfterpaymentInvalid = '20000200033',
  AfterpaymentTooHigh = '20000200034',
  AfterpaymentUnavailable = '20000200035',
  AfterpaymentUnavailableInCityRecipient = '20000200036',
  AfterpaymentMustBeFilled = '20000200037',
  AfterpaymentToDoorsDoorsTooHigh = '20000200038',
  AfterpaymentToWarehouseDoorsTooHigh = '20000200039',
  AfterpaymentInfoMustBeArray = '20000200040',

  // Alternative recipient errors
  AlternativeContactRecipientTooLong = '20000200041',
  AlternativePayerTypeNotSelected = '20000200042',
  AlternativePaymentMethodNotSelected = '20000200043',
  AlternativePaymentNonCashUnavailable = '20000200044',
  AlternativeRecipientNotBelongToUser = '20000200046',
  AlternativeRecipientNotExists = '20000200047',
  AlternativeRecipientIncorrect = '20000200048',
  AlternativeRecipientRemoved = '20000200049',
  AlternativeRecipientNotSelected = '20000200050',
  AlternativeRecipientAddressNotBelong = '20000200051',
  AlternativeRecipientAddressNotExists = '20000200052',
  AlternativeRecipientAddressIncorrect = '20000200053',
  AlternativeRecipientAddressRemoved = '20000200054',
  AlternativeRecipientAddressNotSelected = '20000200055',
  AlternativeRecipientCityIncorrect = '20000200056',
  AlternativeRecipientCityNotFound = '20000200057',
  AlternativeRecipientCityNotSelected = '20000200058',
  AlternativeRecipientContactNotBelong = '20000200059',
  AlternativeRecipientContactNotExists = '20000200060',
  AlternativeRecipientContactIncorrect = '20000200061',
  AlternativeRecipientContactRemoved = '20000200062',
  AlternativeRecipientContactNotSelected = '20000200063',
  AlternativeRecipientPayerTypeIncorrect = '20000200064',
  AlternativeRecipientPaymentMethodIncorrect = '20000200065',
  AlternativeRecipientPhoneInvalidFormat = '20000200066',
  AlternativeRecipientPhoneEmpty = '20000200067',

  // API and system errors
  ApiAuthFail = '20000200068',
  ApiKeyEmpty = '20000200069',

  // Backward delivery errors
  BackwardDeliveryDataArrayInvalid = '20000200070',
  TraysArrayInvalid = '20000200071',
  BackwardDeliveryBannedInCrimea = '20000200072',
  BackwardDeliveryBannedInCity = '20000200073',
  BackwardDeliveryMoneyTooHigh = '20000200074',
  BackwardDeliveryCargoTypeIncorrect = '20000200075',
  BackwardDeliveryCargoTypeMustBeDifferent = '20000200076',
  BackwardDeliveryDocumentsServicesNotService = '20000200077',
  BackwardDeliveryMoneyUnavailableInCityRecipient = '20000200078',
  BackwardDeliveryMoneyRedeliveryStringInvalid = '20000200079',
  BackwardDeliveryMoneyRedeliveryStringLessThanOne = '20000200080',
  BackwardDeliveryMoneyToDoorsDoorsTooHigh = '20000200081',
  BackwardDeliveryMoneyToWarehouseDoorsTooHigh = '20000200082',
  BackwardDeliveryMustBeMoney = '20000200083',
  BackwardDeliveryPayerTypeCannotBeDifferent = '20000200084',
  BackwardDeliveryPayerTypeIncorrect = '20000200085',
  BackwardDeliveryDataMustBeArray = '20000200086',
  BackwardDeliveryRubMoneyToDoorsDoorsTooHigh = '20000200087',
  BackwardDeliveryRubMoneyToWarehouseDoorsTooHigh = '20000200088',

  // Cargo and description errors
  CargoDescriptionInvalid = '20000200090',
  CargoDetailsAmountEmpty = '20000200091',
  CargoDetailsAmountInvalid = '20000200092',
  CargoDetailsAmountTooHigh = '20000200093',
  CargoDetailsCargoDescriptionEmpty = '20000200094',
  CargoDetailsCargoDescriptionIncorrect = '20000200095',
  CargoDetailsCountInvalid = '20000200096',
  CargoDetailsMustBeArray = '20000200097',
  CargoDetailsMustBeEmpty = '20000200098',
  CargoTypeNotSelected = '20000200099',

  // Certificate and city errors
  Certificate = '20000200101',
  CityRecipientIncorrect = '20000200102',
  CityRecipientNotFound = '20000200103',
  CityRecipientNotSelected = '20000200104',
  CitySenderIncorrect = '20000200105',
  CitySenderNotFound = '20000200106',
  CitySenderNotSelected = '20000200107',

  // Cost errors
  CostInvalid = '20000200118',
  CostTooHigh = '20000200119',
  CostShouldBeString = '20000200120',

  // More cost related errors
  CostFromCannotBeLessThanCostTo = '20000300407',
  CostFromInvalid = '20000300408',
  CostFromTooHigh = '20000300409',
  CostOnSiteFromCannotBeLessThanCostOnSiteTo = '20000200124',
  CostOnSiteFromInvalid = '20000200125',
  CostOnSiteFromTooHigh = '20000200126',
  CostOnSiteToInvalid = '20000200127',
  CostOnSiteToTooHigh = '20000200128',
  CostToInvalid = '20000300410',
  CostToTooHigh = '20000300411',

  // Contact errors
  ContactRecipientNotBelongToRecipient = '20000300397',
  ContactRecipientNotExists = '20000300398',
  ContactRecipientIncorrect = '20000300399',
  ContactRecipientRemoved = '20000300400',
  ContactRecipientNotSelected = '20000300401',
  ContactSenderNotBelongToSender = '20000300402',
  ContactSenderNotExists = '20000300403',
  ContactSenderIncorrect = '20000300404',
  ContactSenderRemoved = '20000300405',
  ContactSenderNotSelected = '20000300406',

  // Counterparty errors
  CounterpartyCreationProblem = '20000200131',
  CounterpartyForAlternativePaymentNonCashInvalid = '20000200132',
  CounterpartyForForwardingCountInvalid = '20000200133',
  CounterpartyForIsTakeAttorneyInvalid = '20000200134',
  CounterpartyForPaymentNonCashInvalid = '20000200135',
  CounterpartyForSameDayDeliveryInvalid = '20000200136',
  CounterpartyForThirdPersonInvalid = '20000200137',
  CounterpartyNotFoundByCity = '20000200138',

  // Country and date errors
  CountrySenderInvalid = '20000200139',
  CountrySenderRequired = '20000200140',
  CreateTimeFilteringInvalidFormat = '20000300412',
  DateTimeCannotBeLessThanNow = '20000400455',
  DateTimeCannotBeLessThanPreferredDeliveryDate = '20000200143',
  DateTimeFilteringInvalidFormat = '20000300413',
  DateTimeEmpty = '20000200145',
  DateTimeInvalidFormat = '20000400456',

  // Delivery errors
  DeliveryMustBeToTheDoor = '20000200147',
  DeliveryByHandInvalid = '20000200148',
  DeliveryDateTimeFilteringInvalidFormat = '20000300414',

  // Description and document errors
  DescriptionEmpty = '20000200150',
  DescriptionNotValid = '20000200151',
  DescriptionTooLong = '20000200152',
  DocumentInRegistry = '20000200153',
  DocumentAlreadyPrinted = '20000200154',
  DocumentNotFound = '20000300415',
  DocumentNotFoundByOwner = '20000300416',
  DocumentNumberEmpty = '20000200157',
  DocumentNumberIncorrect = '20000200158',
  DocumentsMustBeArray = '20000200159',
  DocumentsNotFound = '20000200161',
  DocumentsRedeliveryNotValid = '20000200162',
  DocumentsRedeliveryTooLong = '20000200163',

  // Other validation errors
  EdrpouInvalid = '20000200164',
  EdrpouMustNotBeEmpty = '20000200165',
  FailedToConvertSettlementToCity = '20000200166',
  FailedToCreateRecipientBuilding = '20000200167',
  FailedToCreateSenderBuilding = '20000200168',
  FailedToValidateRecipientBuildingNumber = '20000200169',
  FailedToValidateRecipientSettlementStreetRef = '20000200170',
  FailedToValidateSenderBuildingNumber = '20000200171',
  FailedToValidateSenderSettlementStreetRef = '20000200172',

  // Service-specific errors
  FillingWarrantyIncorrect = '20000200173',
  FillingWarrantyUnavailable = '20000200174',
  ForBackwardDeliveryTraysPayerTypeMustBeSender = '20000200175',
  ForwardingCountUnavailable = '20000200176',

  // Dimension errors
  HeightEmpty = '20000400460',
  HeightTooHigh = '20000200179',
  HeightTooHighForInPost = '20000200180',
  HeightTooHighForPostomatNP = '20000200181',
  LengthEmpty = '20000400464',
  LengthTooHigh = '20000200210',
  LengthTooHighForInPost = '20000200211',
  LengthTooHighForPostomatNP = '20000200212',

  // Holiday and delivery restrictions
  ImpossibleToDeliverCargoOnHoliday = '20000200182',
  ImpossibleToDeliverCargoOnThisDay = '20000200183',

  // Validation errors
  IncorrectCargoType = '20000200184',
  IncorrectSummValue = '20000200185',
  IncorrectTimeInterval = '20000200186',
  IncorrectTimeIntervalHour = '20000200187',

  // Client barcode errors
  InfoRegClientBarcodesHasInvalidCharacters = '20000200188',
  InfoRegClientBarcodesTooLong = '20000200189',

  // International shipment errors
  IntDocNumberUndefined = '20000200190',
  InternationalCitySenderInvalid = '20000200191',
  InternationalCitySenderRequired = '20000200192',
  InternationalContactSenderInvalid = '20000200193',
  InternationalContactSenderRequired = '20000200194',
  InternationalEmailInvalid = '20000200195',
  InternationalSenderInvalid = '20000200196',
  InternationalSenderAddressInvalid = '20000200197',
  InternationalSenderAddressRequired = '20000200198',
  InternationalSendersPhoneInvalid = '20000200199',
  InternationalSendersPhoneRequired = '20000200200',
  InternationalWaybillInvalid = '20000200201',
  InternationalWaybillRequired = '20000200202',
  InternationalWaybillPriceInvalid = '20000200203',
  InternationalWaybillPriceRequired = '20000200204',

  // Internet document errors
  InternetDocumentNotFound = '20000200205',
  InternetDocumentNotFoundByOwner = '20000200206',

  // Attorney and items errors
  IsTakeAttorneyUnavailable = '20000200207',
  ItemsEmpty = '20000200208',

  // Marketplace token error
  MarketplacePartnerTokenIncorrect = '20000100541',
}

// Error categories for better organization
export enum ErrorCategory {
  Authentication = 'authentication',
  Validation = 'validation',
  BusinessLogic = 'business_logic',
  Network = 'network',
  Configuration = 'configuration',
  Unknown = 'unknown',
}

// Error severity levels
export enum ErrorSeverity {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical',
}

// Base error interface
export interface NovaPoshtaError {
  readonly code: NovaPoshtaErrorCode | string;
  readonly message: string;
  readonly messageUa?: string;
  readonly messageRu?: string;
  readonly category: ErrorCategory;
  readonly severity: ErrorSeverity;
  readonly context?: Record<string, unknown>;
  readonly timestamp: Date;
  readonly retryable: boolean;
}

// Specific error types
export interface ValidationError extends NovaPoshtaError {
  readonly category: ErrorCategory.Validation;
  readonly field?: string;
  readonly value?: unknown;
  readonly constraint?: string;
}

export interface AuthenticationError extends NovaPoshtaError {
  readonly category: ErrorCategory.Authentication;
  readonly apiKey?: string;
}

export interface NetworkError extends NovaPoshtaError {
  readonly category: ErrorCategory.Network;
  readonly statusCode?: number;
  readonly url?: string;
  readonly method?: string;
}

export interface BusinessLogicError extends NovaPoshtaError {
  readonly category: ErrorCategory.BusinessLogic;
  readonly businessRule?: string;
}

export interface ConfigurationError extends NovaPoshtaError {
  readonly category: ErrorCategory.Configuration;
  readonly configKey?: string;
}

// Error messages mapping
export const ERROR_MESSAGES: Partial<Record<NovaPoshtaErrorCode, {
  en: string;
  ua: string;
  ru: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  retryable: boolean;
}>> = {
  [NovaPoshtaErrorCode.ApiKeyEmpty]: {
    en: 'API key is not specified',
    ua: 'API-ключ не вказано',
    ru: 'API-ключ не указан',
    category: ErrorCategory.Authentication,
    severity: ErrorSeverity.Critical,
    retryable: false,
  },
  [NovaPoshtaErrorCode.ApiAuthFail]: {
    en: 'API authentication failed',
    ua: 'Помилка автентифікації API',
    ru: 'Ошибка аутентификации API',
    category: ErrorCategory.Authentication,
    severity: ErrorSeverity.Critical,
    retryable: false,
  },
  [NovaPoshtaErrorCode.ServiceUnavailable]: {
    en: 'Service unavailable',
    ua: 'Сервіс недоступний',
    ru: 'Сервис недоступен',
    category: ErrorCategory.Network,
    severity: ErrorSeverity.High,
    retryable: true,
  },
  [NovaPoshtaErrorCode.CityRecipientNotFound]: {
    en: 'Recipient city not found',
    ua: 'Місто отримувача не знайдено',
    ru: 'Город получателя не найден',
    category: ErrorCategory.Validation,
    severity: ErrorSeverity.Medium,
    retryable: false,
  },
  [NovaPoshtaErrorCode.CitySenderNotFound]: {
    en: 'Sender city not found',
    ua: 'Місто відправника не знайдено',
    ru: 'Город отправителя не найден',
    category: ErrorCategory.Validation,
    severity: ErrorSeverity.Medium,
    retryable: false,
  },
  [NovaPoshtaErrorCode.DocumentNotFound]: {
    en: 'Document not found',
    ua: 'Документ не знайдено',
    ru: 'Документ не найден',
    category: ErrorCategory.BusinessLogic,
    severity: ErrorSeverity.Medium,
    retryable: false,
  },
  [NovaPoshtaErrorCode.CostTooHigh]: {
    en: 'Cost is too high',
    ua: 'Вартість занадто висока',
    ru: 'Стоимость слишком высокая',
    category: ErrorCategory.Validation,
    severity: ErrorSeverity.Medium,
    retryable: false,
  },
  // Add more error mappings as needed...
} as const;

// Helper functions
export function getErrorInfo(code: NovaPoshtaErrorCode | string): typeof ERROR_MESSAGES[NovaPoshtaErrorCode] | null {
  return ERROR_MESSAGES[code as NovaPoshtaErrorCode] || null;
}

export function isRetryableError(error: NovaPoshtaError): boolean {
  return error.retryable || error.category === ErrorCategory.Network;
}

export function getErrorSeverity(code: NovaPoshtaErrorCode | string): ErrorSeverity {
  const info = getErrorInfo(code);
  return info?.severity || ErrorSeverity.Medium;
}

export function categorizeError(code: NovaPoshtaErrorCode | string): ErrorCategory {
  const info = getErrorInfo(code);
  return info?.category || ErrorCategory.Unknown;
}
