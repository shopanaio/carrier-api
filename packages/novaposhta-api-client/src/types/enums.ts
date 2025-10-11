/**
 * Enums for Nova Poshta API
 * All constants and enumerated values used in the API
 */

// API Models
export enum NovaPoshtaModel {
  TrackingDocument = 'TrackingDocumentGeneral',
  InternetDocument = 'InternetDocumentGeneral',
  Common = 'CommonGeneral',
  Address = 'AddressGeneral',
  Counterparty = 'CounterpartyGeneral',
  ContactPerson = 'ContactPersonGeneral',
  ScanSheet = 'ScanSheetGeneral',
  AdditionalService = 'AdditionalServiceGeneral',
}

// API Methods
export enum NovaPoshtaMethod {
  // Tracking methods
  GetStatusDocuments = 'getStatusDocuments',
  GetDocumentsEWMovement = 'getDocumentsEWMovement',

  // Internet document methods
  Save = 'save',
  Update = 'update',
  Delete = 'delete',
  GetDocumentPrice = 'getDocumentPrice',
  GetDocumentDeliveryDate = 'getDocumentDeliveryDate',
  GetDocumentList = 'getDocumentList',
  GenerateReport = 'generateReport',

  // Common methods
  GetCargoTypes = 'getCargoTypes',
  GetBackwardDeliveryCargoTypes = 'getBackwardDeliveryCargoTypes',
  GetPalletsList = 'getPalletsList',
  GetTypesOfPayersForRedelivery = 'getTypesOfPayersForRedelivery',
  GetPackList = 'getPackList',
  GetTiresWheelsList = 'getTiresWheelsList',
  GetCargoDescriptionList = 'getCargoDescriptionList',
  GetMessageCodeText = 'getMessageCodeText',
  GetServiceTypes = 'getServiceTypes',
  GetOwnershipFormsList = 'getOwnershipFormsList',
  GetTimeIntervals = 'getTimeIntervals',
  GetPickupTimeIntervals = 'getPickupTimeIntervals',

  // Address methods
  GetSettlements = 'getSettlements',
  GetCities = 'getCities',
  GetAreas = 'getAreas',
  GetWarehouses = 'getWarehouses',
  GetWarehouseTypes = 'getWarehouseTypes',
  GetStreet = 'getStreet',
  SearchSettlements = 'searchSettlements',
  SearchSettlementStreets = 'searchSettlementStreets',
  GetSettlementAreas = 'getSettlementAreas',
  GetSettlementCountryRegion = 'getSettlementCountryRegion',
}

// Payment methods
export enum PaymentMethod {
  Cash = 'Cash',
  NonCash = 'NonCash',
}

// Cargo types
export enum CargoType {
  Parcel = 'Parcel',
  Cargo = 'Cargo',
  Documents = 'Documents',
  TiresWheels = 'TiresWheels',
  Pallet = 'Pallet',
}

// Service types (delivery technologies)
export enum ServiceType {
  /** Door to door delivery */
  DoorsDoors = 'DoorsDoors',
  /** Door to warehouse delivery */
  DoorsWarehouse = 'DoorsWarehouse',
  /** Warehouse to warehouse delivery */
  WarehouseWarehouse = 'WarehouseWarehouse',
  /** Warehouse to door delivery */
  WarehouseDoors = 'WarehouseDoors',
}

// Payer types
export enum PayerType {
  /** Sender pays */
  Sender = 'Sender',
  /** Recipient pays */
  Recipient = 'Recipient',
  /** Third person pays */
  ThirdPerson = 'ThirdPerson',
}

// Delivery statuses
export enum DeliveryStatus {
  /** Created by sender but not yet dispatched */
  CreatedBySender = 1,
  /** Deleted */
  Deleted = 2,
  /** Number not found */
  NotFound = 3,
  /** Shipment in sender city (interregional) */
  InSenderCityInterregional = 4,
  /** Shipment in sender city (local within city) */
  InSenderCityLocal = 41,
  /** Shipment en route to recipient city */
  InTransitToRecipientCity = 5,
  /** Shipment in recipient city, awaiting delivery */
  InRecipientCityAwaitingDelivery = 6,
  /** Arrived at warehouse */
  ArrivedAtWarehouse = 7,
  /** Arrived at warehouse (loaded in Postomat) */
  ArrivedAtPostomat = 8,
  /** Shipment received */
  Received = 9,
  /** Shipment received, awaiting money transfer SMS */
  ReceivedAwaitingMoneyTransfer = 10,
  /** Shipment received, money transfer issued */
  ReceivedAndMoneyTransferred = 11,
  /** Nova Poshta is packaging your shipment */
  BeingPacked = 12,
  /** On the way to recipient */
  OnTheWayToRecipient = 101,
  /** Refused by recipient (return order created) */
  RefusedByRecipientReturnCreated = 102,
  /** Refused by recipient */
  RefusedByRecipient = 103,
  /** Address changed */
  AddressChanged = 104,
  /** Storage terminated */
  StorageTerminated = 105,
  /** Received and return waybill created */
  ReturnWaybillCreated = 106,
  /** Failed delivery attempt due to recipient absence */
  FailedDeliveryAttempt = 111,
  /** Delivery date rescheduled by recipient */
  DeliveryRescheduledByRecipient = 112,
}

// Warehouse types
export enum WarehouseType {
  Branch = 'Branch',
  Postomat = 'Postomat',
  PickupPoint = 'PickupPoint',
}

// Settlement types
export enum SettlementType {
  City = 'м.',
  Town = 'смт.',
  Village = 'с.',
  UrbanVillage = 'сщ.',
}

// Ownership forms
export enum OwnershipForm {
  PrivatePerson = 'PrivatePerson',
  Organization = 'Organization',
}

// Counterparty types
export enum CounterpartyType {
  PrivatePerson = 'PrivatePerson',
  Organization = 'Organization',
}

// Contact person types
export enum ContactPersonType {
  Sender = 'Sender',
  Recipient = 'Recipient',
}

// Time interval types
export enum TimeIntervalType {
  CityDeliveryTimeInterval1 = 'CityDeliveryTimeInterval1', // 9-14
  CityDeliveryTimeInterval2 = 'CityDeliveryTimeInterval2', // 14-18
  CityDeliveryTimeInterval3 = 'CityDeliveryTimeInterval3', // 18-20
  CityDeliveryTimeInterval4 = 'CityDeliveryTimeInterval4', // 20-21
}

// Pickup time intervals
export enum PickupTimeInterval {
  CityPickingTimeInterval1 = 'CityPickingTimeInterval1',
  CityPickingTimeInterval2 = 'CityPickingTimeInterval2',
  CityPickingTimeInterval3 = 'CityPickingTimeInterval3',
  CityPickingTimeInterval4 = 'CityPickingTimeInterval4',
}

// Backward delivery types
export enum BackwardDeliveryType {
  Money = 'Money',
  Documents = 'Documents',
  Cargo = 'Cargo',
}

// Backward delivery subtypes
export enum BackwardDeliverySubtype {
  // Money subtypes
  MoneyTransfer = 'MoneyTransfer',

  // Documents subtypes
  DocumentsReturn = 'DocumentsReturn',

  // Cargo subtypes
  CargoReturn = 'CargoReturn',
}

// Additional services
export enum AdditionalService {
  /** Saturday delivery */
  SaturdayDelivery = 'SaturdayDelivery',
  /** Delivery to hands personally */
  DeliveryByHand = 'DeliveryByHand',
  /** Payment control */
  AfterpaymentOnGoodsCost = 'AfterpaymentOnGoodsCost',
  /** Local express */
  LocalExpress = 'LocalExpress',
  /** Preferred delivery date */
  PreferredDeliveryDate = 'PreferredDeliveryDate',
  /** Delivery in time intervals */
  TimeInterval = 'TimeInterval',
  /** Packing number specification */
  PackingNumber = 'PackingNumber',
  /** Client barcode specification */
  InfoRegClientBarcodes = 'InfoRegClientBarcodes',
  /** Accompanying documents */
  AccompanyingDocuments = 'AccompanyingDocuments',
  /** Additional information */
  AdditionalInformation = 'AdditionalInformation',
  /** Floor lifting service */
  NumberOfFloorsLifting = 'NumberOfFloorsLifting',
  /** Floor descent service */
  NumberOfFloorsDescent = 'NumberOfFloorsDescent',
  /** Piece-by-piece control */
  ForwardingCount = 'ForwardingCount',
  /** RedBox service */
  RedBoxBarcode = 'RedBoxBarcode',
  /** Special cargo handling */
  SpecialCargo = 'SpecialCargo',
}

// Document types
export enum DocumentType {
  InternetDocument = 'InternetDocument',
  ReturnDocument = 'ReturnDocument',
  RedirectionDocument = 'RedirectionDocument',
}

// Currencies
export enum Currency {
  UAH = 'UAH',
  USD = 'USD',
  EUR = 'EUR',
  RUB = 'RUB',
}

// Languages
export enum Language {
  Ukrainian = 'ua',
  Russian = 'ru',
}

// Days of week for delivery availability
export enum DeliveryDay {
  Monday = 'Delivery1',
  Tuesday = 'Delivery2',
  Wednesday = 'Delivery3',
  Thursday = 'Delivery4',
  Friday = 'Delivery5',
  Saturday = 'Delivery6',
  Sunday = 'Delivery7',
}

// Packing types
export enum PackingType {
  Box = 'Box',
  Tube = 'Tube',
  Envelope = 'Envelope',
  Bag = 'Bag',
}

// Tire and wheel types
export enum TireWheelType {
  Tires = 'Tires',
  Wheels = 'Wheels',
}

// Street types
export enum StreetType {
  Street = 'вул.',
  Avenue = 'просп.',
  Boulevard = 'бул.',
  Lane = 'пров.',
  Square = 'пл.',
  Embankment = 'наб.',
}

// Export all enums as const assertions for better type inference
export const NOVA_POSHTA_MODELS = Object.values(NovaPoshtaModel);
export const NOVA_POSHTA_METHODS = Object.values(NovaPoshtaMethod);
export const PAYMENT_METHODS = Object.values(PaymentMethod);
export const CARGO_TYPES = Object.values(CargoType);
export const SERVICE_TYPES = Object.values(ServiceType);
export const PAYER_TYPES = Object.values(PayerType);
export const DELIVERY_STATUSES = Object.values(DeliveryStatus);

// Type guards for enums
export function isPaymentMethod(value: string): value is PaymentMethod {
  return PAYMENT_METHODS.includes(value as PaymentMethod);
}

export function isCargoType(value: string): value is CargoType {
  return CARGO_TYPES.includes(value as CargoType);
}

export function isServiceType(value: string): value is ServiceType {
  return SERVICE_TYPES.includes(value as ServiceType);
}

export function isPayerType(value: string): value is PayerType {
  return PAYER_TYPES.includes(value as PayerType);
}
