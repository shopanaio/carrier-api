/**
 * Zod validation schemas for Nova Poshta API
 */

import { z } from 'zod';
import {
  PaymentMethod,
  CargoType,
  ServiceType,
  PayerType,
  TimeIntervalType,
  Language,
} from '../types/enums';

// Base validation schemas
export const novaPoshtaRefSchema = z.string().min(1).regex(/^[a-f0-9-]+$/i, 'Invalid Nova Poshta reference format');
export const phoneNumberSchema = z.string().regex(/^(\+?380|380|0)[0-9]{9}$/, 'Invalid phone number format');
export const novaPoshtaDateSchema = z.string().regex(/^\d{2}\.\d{2}\.\d{4}$/, 'Date must be in dd.mm.yyyy format');
export const novaPoshtaDateTimeSchema = z.string().regex(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}:\d{2}$/, 'DateTime must be in dd.mm.yyyy hh:mm:ss format');

// String length constraints
export const string36Schema = z.string().max(36, 'String must not exceed 36 characters');
export const string50Schema = z.string().max(50, 'String must not exceed 50 characters');
export const string100Schema = z.string().max(100, 'String must not exceed 100 characters');

// Numeric constraints
export const weightSchema = z.number().min(0.1, 'Weight must be at least 0.1 kg');
export const volumeSchema = z.number().min(0.0004, 'Volume must be at least 0.0004 m³');
export const dimensionsSchema = z.number().min(1, 'Dimensions must be at least 1 cm');
export const costSchema = z.number().min(0, 'Cost cannot be negative');

// Enum schemas
export const paymentMethodSchema = z.nativeEnum(PaymentMethod);
export const cargoTypeSchema = z.nativeEnum(CargoType);
export const serviceTypeSchema = z.nativeEnum(ServiceType);
export const payerTypeSchema = z.nativeEnum(PayerType);
export const timeIntervalSchema = z.nativeEnum(TimeIntervalType);
export const languageSchema = z.nativeEnum(Language);

// Cargo seat options schema
export const optionsSeatSchema = z.object({
  Weight: weightSchema,
  VolumetricWidth: dimensionsSchema,
  VolumetricLength: dimensionsSchema,
  VolumetricHeight: dimensionsSchema,
  VolumetricVolume: volumeSchema.optional(),
  PackRef: novaPoshtaRefSchema.optional(),
  Cost: costSchema.optional(),
  Description: string36Schema.optional(),
  SpecialCargo: z.enum(['0', '1']).optional(),
});

// Postomat-specific seat options with additional constraints
export const poshtomatOptionsSeatSchema = optionsSeatSchema.extend({
  Weight: z.number().min(0.1).max(20, 'Postomat weight limit is 20 kg'),
  VolumetricWidth: z.number().min(1).max(40, 'Postomat width limit is 40 cm'),
  VolumetricLength: z.number().min(1).max(60, 'Postomat length limit is 60 cm'),
  VolumetricHeight: z.number().min(1).max(30, 'Postomat height limit is 30 cm'),
});

// Backward delivery schema
export const backwardDeliverySchema = z.object({
  CargoType: cargoTypeSchema,
  Amount: costSchema.optional(),
  ServiceType: serviceTypeSchema.optional(),
  PayerType: payerTypeSchema.optional(),
  PaymentMethod: paymentMethodSchema.optional(),
});

// Additional services schema
export const additionalServicesSchema = z.object({
  SaturdayDelivery: z.enum(['0', '1']).optional(),
  DeliveryByHand: z.enum(['0', '1']).optional(),
  DeliveryByHandRecipients: z.array(z.string()).max(15, 'Maximum 15 authorized recipients').optional(),
  AfterpaymentOnGoodsCost: costSchema.optional(),
  LocalExpress: z.enum(['0', '1']).optional(),
  TimeInterval: timeIntervalSchema.optional(),
  PreferredDeliveryDate: novaPoshtaDateSchema.optional(),
  PackingNumber: string36Schema.optional(),
  InfoRegClientBarcodes: string36Schema.optional(),
  AccompanyingDocuments: string36Schema.optional(),
  AdditionalInformation: string36Schema.optional(),
  NumberOfFloorsLifting: z.number().int().min(1).max(50).optional(),
  NumberOfFloorsDescent: z.number().int().min(1).max(50).optional(),
  Elevator: z.enum(['0', '1']).optional(),
  ForwardingCount: z.number().int().min(1).optional(),
  RedBoxBarcode: string36Schema.optional(),
  SpecialCargo: z.enum(['0', '1']).optional(),
  SameDayDelivery: z.enum(['0', '1']).optional(),
  ExpressWaybillPayment: z.enum(['0', '1']).optional(),
}).refine(data => {
  // If deliveryByHand is enabled, deliveryByHandRecipients should be provided
  if (data.DeliveryByHand === '1' && (!data.DeliveryByHandRecipients || data.DeliveryByHandRecipients.length === 0)) {
    return false;
  }
  // If timeInterval is specified, preferredDeliveryDate should also be specified
  if (data.TimeInterval && !data.PreferredDeliveryDate) {
    return false;
  }
  return true;
}, {
  message: 'Invalid additional services configuration',
});

// Base waybill properties schema
const baseWaybillPropertiesObject = {
  PayerType: payerTypeSchema,
  PaymentMethod: paymentMethodSchema,
  DateTime: novaPoshtaDateSchema,
  CargoType: cargoTypeSchema,
  Weight: weightSchema,
  ServiceType: serviceTypeSchema,
  SeatsAmount: z.number().int().min(1, 'At least 1 seat is required'),
  Description: string36Schema,
  Cost: costSchema,
  CitySender: novaPoshtaRefSchema,
  Sender: novaPoshtaRefSchema,
  SenderAddress: novaPoshtaRefSchema,
  ContactSender: novaPoshtaRefSchema,
  SendersPhone: phoneNumberSchema,
  CityRecipient: novaPoshtaRefSchema,
  Recipient: novaPoshtaRefSchema,
  RecipientAddress: novaPoshtaRefSchema,
  ContactRecipient: novaPoshtaRefSchema,
  RecipientsPhone: phoneNumberSchema,
} as const;

const baseWaybillPropertiesCore = z.object(baseWaybillPropertiesObject);

const applyBaseWaybillRules = <T extends z.ZodTypeAny>(schema: T) =>
  schema.superRefine((data, ctx) => {
    const payload = data as z.infer<typeof baseWaybillPropertiesCore>;
    if (payload.PayerType === PayerType.ThirdPerson && payload.PaymentMethod !== PaymentMethod.NonCash) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid waybill properties configuration' });
    }
    if (payload.CargoType === CargoType.Documents && ![0.1, 0.5, 1].includes(payload.Weight)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid waybill properties configuration' });
    }
  });

export const baseWaybillPropertiesSchema = applyBaseWaybillRules(baseWaybillPropertiesCore);

// Create waybill request schema
export const createWaybillRequestSchema = applyBaseWaybillRules(
  baseWaybillPropertiesCore.extend({
    SenderWarehouseIndex: string36Schema.optional(),
    RecipientWarehouseIndex: string36Schema.optional(),
    VolumeGeneral: volumeSchema.optional(),
  }),
);

// Create waybill with options request schema
export const createWaybillWithOptionsRequestSchema = applyBaseWaybillRules(
  baseWaybillPropertiesCore.extend({
    SenderWarehouseIndex: string36Schema.optional(),
    RecipientWarehouseIndex: string36Schema.optional(),
    VolumeGeneral: volumeSchema.optional(),
    OptionsSeat: z.array(optionsSeatSchema).min(1, 'At least one seat option is required'),
    RedBoxBarcode: string36Schema.optional(),
    ThirdPerson: novaPoshtaRefSchema.optional(),
    BackwardDeliveryData: z.array(backwardDeliverySchema).optional(),
    AdditionalServices: additionalServicesSchema.optional(),
  }),
).superRefine((data, ctx) => {
  if (data.PayerType === PayerType.ThirdPerson && !data.ThirdPerson) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid waybill with options configuration' });
  }
  if (!data.VolumeGeneral && (!data.OptionsSeat || data.OptionsSeat.length === 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid waybill with options configuration' });
  }
  if (data.OptionsSeat && data.SeatsAmount !== data.OptionsSeat.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid waybill with options configuration' });
  }
});

// Create postomat waybill request schema
export const createPoshtomatWaybillRequestSchema = applyBaseWaybillRules(
  baseWaybillPropertiesCore.extend({
    SenderWarehouseIndex: string36Schema.optional(),
    RecipientWarehouseIndex: string36Schema.optional(),
    OptionsSeat: z.array(poshtomatOptionsSeatSchema).length(1, 'Postomat allows only one seat per shipment'),
    CargoType: z.enum([CargoType.Parcel, CargoType.Documents]),
    ServiceType: z.enum([ServiceType.DoorsWarehouse, ServiceType.WarehouseWarehouse]),
    Cost: z.number().min(0).max(10000, 'Postomat declared value limit is 10000 UAH'),
  }),
);

// Update waybill request schema
export const updateWaybillRequestSchema = applyBaseWaybillRules(
  baseWaybillPropertiesCore.extend({
    Ref: novaPoshtaRefSchema,
    VolumeGeneral: volumeSchema.optional(),
  }),
);

// Delete waybill request schema
export const deleteWaybillRequestSchema = z.object({
  DocumentRefs: z.array(novaPoshtaRefSchema).min(1, 'At least one document reference is required'),
});

// Tracking request schemas
export const trackDocumentItemSchema = z.object({
  documentNumber: z.string().min(1, 'Document number is required'),
  phone: phoneNumberSchema.optional(),
});

export const trackDocumentsRequestSchema = z.object({
  documents: z.array(trackDocumentItemSchema).min(1).max(100, 'Maximum 100 documents can be tracked at once'),
});

export const documentMovementRequestSchema = trackDocumentsRequestSchema.extend({
  showDeliveryDetails: z.boolean().optional(),
});

// Delivery date request schema
export const deliveryDateRequestSchema = z.object({
  DateTime: novaPoshtaDateSchema.optional(),
  ServiceType: serviceTypeSchema,
  CitySender: novaPoshtaRefSchema,
  CityRecipient: novaPoshtaRefSchema,
});

// Price calculation request schema
export const priceCalculationRequestSchema = z.object({
  CitySender: novaPoshtaRefSchema,
  CityRecipient: novaPoshtaRefSchema,
  Weight: weightSchema,
  ServiceType: serviceTypeSchema,
  Cost: costSchema,
  CargoType: cargoTypeSchema,
  SeatsAmount: z.number().int().min(1),
  RedeliveryCalculate: z.object({
    CargoType: cargoTypeSchema,
    Amount: costSchema,
  }).optional(),
  PackCount: z.number().int().min(1).optional(),
  PackRef: novaPoshtaRefSchema.optional(),
  Amount: z.number().int().min(1).optional(),
  CargoDetails: z.array(z.object({
    CargoDescription: novaPoshtaRefSchema,
    Amount: z.number().int().min(1),
  })).optional(),
  CargoDescription: novaPoshtaRefSchema.optional(),
  OptionsSeat: z.array(optionsSeatSchema).optional(),
});

// Address and reference data schemas
export const searchSettlementsRequestSchema = z.object({
  CityName: string36Schema,
  Page: z.number().int().min(1).default(1),
  Limit: z.number().int().min(1).max(500).default(50),
});

export const searchSettlementStreetsRequestSchema = z.object({
  StreetName: string36Schema,
  SettlementRef: novaPoshtaRefSchema,
  Limit: z.number().int().min(1).max(500).optional(),
});

export const citiesRequestSchema = z.object({
  Ref: novaPoshtaRefSchema.optional(),
  FindByString: string36Schema.optional(),
  Page: z.number().int().min(1).optional(),
  Limit: z.number().int().min(1).max(500).optional(),
});

export const timeIntervalsRequestSchema = z.object({
  RecipientCityRef: novaPoshtaRefSchema,
  DateTime: string36Schema.optional(),
});

export const pickupTimeIntervalsRequestSchema = z.object({
  SenderCityRef: novaPoshtaRefSchema,
  DateTime: novaPoshtaDateSchema,
});

// Reference data request schemas
export const getCargoTypesRequestSchema = z.object({});

export const getPalletsListRequestSchema = z.object({});

export const getPackListRequestSchema = z.object({
  Length: z.number().int().min(1).optional(),
  Width: z.number().int().min(1).optional(),
  Height: z.number().int().min(1).optional(),
  VolumetricWeight: z.number().min(0).optional(),
  TypeOfPacking: z.string().optional(),
});

export const getTiresWheelsListRequestSchema = z.object({});

export const getCargoDescriptionListRequestSchema = z.object({
  FindByString: string36Schema.optional(),
  Page: z.number().int().min(1).max(500).optional(),
});

export const getMessageCodeTextRequestSchema = z.object({});

export const getServiceTypesRequestSchema = z.object({});

export const getOwnershipFormsListRequestSchema = z.object({});

export const getBackwardDeliveryCargoTypesRequestSchema = z.object({});

export const getTypesOfPayersForRedeliveryRequestSchema = z.object({});

// Address request schemas
export const getSettlementsRequestSchema = z.object({
  Ref: novaPoshtaRefSchema.optional(),
});

export const getSettlementCountryRegionRequestSchema = z.object({
  AreaRef: novaPoshtaRefSchema,
});

export const getStreetRequestSchema = z.object({
  CityRef: novaPoshtaRefSchema,
  FindByString: string36Schema.optional(),
  Page: z.number().int().min(1).optional(),
  Limit: z.number().int().min(1).max(500).optional(),
});

// Response validation schemas
export const novaPoshtaResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  info: z.array(z.string()),
  messageCodes: z.array(z.string()),
  errorCodes: z.array(z.string()),
  warningCodes: z.array(z.string()),
  infoCodes: z.array(z.string()),
});

export const waybillCreationDataSchema = z.object({
  ref: novaPoshtaRefSchema,
  costOnSite: string36Schema,
  estimatedDeliveryDate: novaPoshtaDateSchema,
  intDocNumber: string36Schema,
  typeDocument: z.string(),
});

export const waybillCreationResponseSchema = novaPoshtaResponseSchema.extend({
  data: z.array(waybillCreationDataSchema),
});

// Configuration validation schemas
export const transportConfigSchema = z.object({
  baseUrl: z.string().url().optional(),
  timeout: z.number().int().min(1000).optional(),
  maxRetries: z.number().int().min(0).max(10).optional(),
  retryDelay: z.number().int().min(100).optional(),
  maxRetryDelay: z.number().int().min(1000).optional(),
  backoffMultiplier: z.number().min(1).max(10).optional(),
  rateLimit: z.number().int().min(1).max(100).optional(),
  headers: z.record(z.string()).optional(),
  enableLogging: z.boolean().optional(),
});

export const clientConfigSchema = z.object({
  apiKey: z.string().min(32, 'API key must be at least 32 characters'),
  language: languageSchema.optional(),
  environment: z.enum(['production', 'staging', 'development']).optional(),
  transport: transportConfigSchema.optional(),
  enableValidation: z.boolean().optional(),
  enableCaching: z.boolean().optional(),
  cacheTtl: z.number().int().min(0).optional(),
  enableMetrics: z.boolean().optional(),
  enableLogging: z.boolean().optional(),
  userAgent: z.string().optional(),
  clientInfo: z.object({
    name: z.string(),
    version: z.string(),
  }).optional(),
});

// Export all schemas for use in validation
export const schemas = {
  // Base schemas
  novaPoshtaRef: novaPoshtaRefSchema,
  phoneNumber: phoneNumberSchema,
  novaPoshtaDate: novaPoshtaDateSchema,
  novaPoshtaDateTime: novaPoshtaDateTimeSchema,
  string36: string36Schema,
  string50: string50Schema,
  string100: string100Schema,
  weight: weightSchema,
  volume: volumeSchema,
  dimensions: dimensionsSchema,
  cost: costSchema,

  // Enum schemas
  paymentMethod: paymentMethodSchema,
  cargoType: cargoTypeSchema,
  serviceType: serviceTypeSchema,
  payerType: payerTypeSchema,
  timeInterval: timeIntervalSchema,
  language: languageSchema,

  // Complex schemas
  optionsSeat: optionsSeatSchema,
  poshtomatOptionsSeat: poshtomatOptionsSeatSchema,
  backwardDelivery: backwardDeliverySchema,
  additionalServices: additionalServicesSchema,

  // Request schemas
  createWaybillRequest: createWaybillRequestSchema,
  createWaybillWithOptionsRequest: createWaybillWithOptionsRequestSchema,
  createPoshtomatWaybillRequest: createPoshtomatWaybillRequestSchema,
  updateWaybillRequest: updateWaybillRequestSchema,
  deleteWaybillRequest: deleteWaybillRequestSchema,
  trackDocumentsRequest: trackDocumentsRequestSchema,
  documentMovementRequest: documentMovementRequestSchema,
  deliveryDateRequest: deliveryDateRequestSchema,
  priceCalculationRequest: priceCalculationRequestSchema,
  searchSettlementsRequest: searchSettlementsRequestSchema,
  searchSettlementStreetsRequest: searchSettlementStreetsRequestSchema,
  citiesRequest: citiesRequestSchema,
  timeIntervalsRequest: timeIntervalsRequestSchema,
  pickupTimeIntervalsRequest: pickupTimeIntervalsRequestSchema,

  // Reference data request schemas
  getCargoTypesRequest: getCargoTypesRequestSchema,
  getPalletsListRequest: getPalletsListRequestSchema,
  getPackListRequest: getPackListRequestSchema,
  getTiresWheelsListRequest: getTiresWheelsListRequestSchema,
  getCargoDescriptionListRequest: getCargoDescriptionListRequestSchema,
  getMessageCodeTextRequest: getMessageCodeTextRequestSchema,
  getServiceTypesRequest: getServiceTypesRequestSchema,
  getOwnershipFormsListRequest: getOwnershipFormsListRequestSchema,
  getBackwardDeliveryCargoTypesRequest: getBackwardDeliveryCargoTypesRequestSchema,
  getTypesOfPayersForRedeliveryRequest: getTypesOfPayersForRedeliveryRequestSchema,

  // Address request schemas
  getSettlementsRequest: getSettlementsRequestSchema,
  getSettlementCountryRegionRequest: getSettlementCountryRegionRequestSchema,
  getStreetRequest: getStreetRequestSchema,

  // Response schemas
  novaPoshtaResponse: novaPoshtaResponseSchema,
  waybillCreationResponse: waybillCreationResponseSchema,

  // Configuration schemas
  transportConfig: transportConfigSchema,
  clientConfig: clientConfigSchema,
} as const;
