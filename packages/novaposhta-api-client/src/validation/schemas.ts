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
  weight: weightSchema,
  volumetricWidth: dimensionsSchema,
  volumetricLength: dimensionsSchema,
  volumetricHeight: dimensionsSchema,
  volumetricVolume: volumeSchema.optional(),
  packRef: novaPoshtaRefSchema.optional(),
  cost: costSchema.optional(),
  description: string36Schema.optional(),
  specialCargo: z.enum(['0', '1']).optional(),
});

// Postomat-specific seat options with additional constraints
export const poshtomatOptionsSeatSchema = optionsSeatSchema.extend({
  weight: z.number().min(0.1).max(20, 'Postomat weight limit is 20 kg'),
  volumetricWidth: z.number().min(1).max(40, 'Postomat width limit is 40 cm'),
  volumetricLength: z.number().min(1).max(60, 'Postomat length limit is 60 cm'),
  volumetricHeight: z.number().min(1).max(30, 'Postomat height limit is 30 cm'),
});

// Backward delivery schema
export const backwardDeliverySchema = z.object({
  cargoType: cargoTypeSchema,
  amount: costSchema.optional(),
  serviceType: serviceTypeSchema.optional(),
  payerType: payerTypeSchema.optional(),
  paymentMethod: paymentMethodSchema.optional(),
});

// Additional services schema
export const additionalServicesSchema = z.object({
  saturdayDelivery: z.enum(['0', '1']).optional(),
  deliveryByHand: z.enum(['0', '1']).optional(),
  deliveryByHandRecipients: z.array(z.string()).max(15, 'Maximum 15 authorized recipients').optional(),
  afterpaymentOnGoodsCost: costSchema.optional(),
  localExpress: z.enum(['0', '1']).optional(),
  timeInterval: timeIntervalSchema.optional(),
  preferredDeliveryDate: novaPoshtaDateSchema.optional(),
  packingNumber: string36Schema.optional(),
  infoRegClientBarcodes: string36Schema.optional(),
  accompanyingDocuments: string36Schema.optional(),
  additionalInformation: string36Schema.optional(),
  numberOfFloorsLifting: z.number().int().min(1).max(50).optional(),
  numberOfFloorsDescent: z.number().int().min(1).max(50).optional(),
  elevator: z.enum(['0', '1']).optional(),
  forwardingCount: z.number().int().min(1).optional(),
  redBoxBarcode: string36Schema.optional(),
  specialCargo: z.enum(['0', '1']).optional(),
  sameDayDelivery: z.enum(['0', '1']).optional(),
  expressWaybillPayment: z.enum(['0', '1']).optional(),
}).refine(data => {
  // If deliveryByHand is enabled, deliveryByHandRecipients should be provided
  if (data.deliveryByHand === '1' && (!data.deliveryByHandRecipients || data.deliveryByHandRecipients.length === 0)) {
    return false;
  }
  // If timeInterval is specified, preferredDeliveryDate should also be specified
  if (data.timeInterval && !data.preferredDeliveryDate) {
    return false;
  }
  return true;
}, {
  message: 'Invalid additional services configuration',
});

// Base waybill properties schema (without refinement)
const baseWaybillPropertiesSchemaObject = z.object({
  payerType: payerTypeSchema,
  paymentMethod: paymentMethodSchema,
  dateTime: novaPoshtaDateSchema,
  cargoType: cargoTypeSchema,
  weight: weightSchema,
  serviceType: serviceTypeSchema,
  seatsAmount: z.number().int().min(1, 'At least 1 seat is required'),
  description: string36Schema,
  cost: costSchema,
  citySender: novaPoshtaRefSchema,
  sender: novaPoshtaRefSchema,
  senderAddress: novaPoshtaRefSchema,
  contactSender: novaPoshtaRefSchema,
  sendersPhone: phoneNumberSchema,
  cityRecipient: novaPoshtaRefSchema,
  recipient: novaPoshtaRefSchema,
  recipientAddress: novaPoshtaRefSchema,
  contactRecipient: novaPoshtaRefSchema,
  recipientsPhone: phoneNumberSchema,
});

// Base waybill properties schema with refinement
export const baseWaybillPropertiesSchema = baseWaybillPropertiesSchemaObject.refine(data => {
  // For ThirdPerson payer type, paymentMethod must be NonCash
  if (data.payerType === PayerType.ThirdPerson && data.paymentMethod !== PaymentMethod.NonCash) {
    return false;
  }
  // For Documents cargo type, weight must be 0.1, 0.5, or 1
  if (data.cargoType === CargoType.Documents && ![0.1, 0.5, 1].includes(data.weight)) {
    return false;
  }
  return true;
}, {
  message: 'Invalid waybill properties configuration',
});

// Create waybill request schema
export const createWaybillRequestSchema = baseWaybillPropertiesSchemaObject.extend({
  senderWarehouseIndex: string36Schema.optional(),
  recipientWarehouseIndex: string36Schema.optional(),
  volumeGeneral: volumeSchema.optional(),
}).refine(data => {
  // For ThirdPerson payer type, paymentMethod must be NonCash
  if (data.payerType === PayerType.ThirdPerson && data.paymentMethod !== PaymentMethod.NonCash) {
    return false;
  }
  // For Documents cargo type, weight must be 0.1, 0.5, or 1
  if (data.cargoType === CargoType.Documents && ![0.1, 0.5, 1].includes(data.weight)) {
    return false;
  }
  return true;
}, {
  message: 'Invalid waybill properties configuration',
});

// Create waybill with options request schema
export const createWaybillWithOptionsRequestSchema = baseWaybillPropertiesSchemaObject.extend({
  senderWarehouseIndex: string36Schema.optional(),
  recipientWarehouseIndex: string36Schema.optional(),
  volumeGeneral: volumeSchema.optional(),
  optionsSeat: z.array(optionsSeatSchema).min(1, 'At least one seat option is required'),
  redBoxBarcode: string36Schema.optional(),
  thirdPerson: novaPoshtaRefSchema.optional(),
  backwardDeliveryData: z.array(backwardDeliverySchema).optional(),
  additionalServices: additionalServicesSchema.optional(),
}).refine((data: any) => {
  // For ThirdPerson payer type, paymentMethod must be NonCash
  if (data.payerType === PayerType.ThirdPerson && data.paymentMethod !== PaymentMethod.NonCash) {
    return false;
  }
  // For Documents cargo type, weight must be 0.1, 0.5, or 1
  if (data.cargoType === CargoType.Documents && ![0.1, 0.5, 1].includes(data.weight)) {
    return false;
  }
  // If payerType is ThirdPerson, thirdPerson ref must be provided
  if (data.payerType === PayerType.ThirdPerson && !data.thirdPerson) {
    return false;
  }
  // If volumeGeneral is not provided, optionsSeat must be provided
  if (!data.volumeGeneral && (!data.optionsSeat || data.optionsSeat.length === 0)) {
    return false;
  }
  // Validate total seats amount matches optionsSeat array length
  if (data.optionsSeat && data.seatsAmount !== data.optionsSeat.length) {
    return false;
  }
  return true;
}, {
  message: 'Invalid waybill with options configuration',
});

// Create postomat waybill request schema
export const createPoshtomatWaybillRequestSchema = baseWaybillPropertiesSchemaObject.extend({
  senderWarehouseIndex: string36Schema.optional(),
  recipientWarehouseIndex: string36Schema.optional(),
  optionsSeat: z.array(poshtomatOptionsSeatSchema).length(1, 'Postomat allows only one seat per shipment'),
  cargoType: z.enum([CargoType.Parcel, CargoType.Documents]),
  serviceType: z.enum([ServiceType.DoorsWarehouse, ServiceType.WarehouseWarehouse]),
  cost: z.number().min(0).max(10000, 'Postomat declared value limit is 10000 UAH'),
});

// Update waybill request schema
export const updateWaybillRequestSchema = baseWaybillPropertiesSchemaObject.extend({
  ref: novaPoshtaRefSchema,
  volumeGeneral: volumeSchema.optional(),
}).refine(data => {
  // For ThirdPerson payer type, paymentMethod must be NonCash
  if (data.payerType === PayerType.ThirdPerson && data.paymentMethod !== PaymentMethod.NonCash) {
    return false;
  }
  // For Documents cargo type, weight must be 0.1, 0.5, or 1
  if (data.cargoType === CargoType.Documents && ![0.1, 0.5, 1].includes(data.weight)) {
    return false;
  }
  return true;
}, {
  message: 'Invalid waybill properties configuration',
});

// Delete waybill request schema
export const deleteWaybillRequestSchema = z.object({
  documentRefs: z.array(novaPoshtaRefSchema).min(1, 'At least one document reference is required'),
});

// Tracking request schemas
export const trackDocumentItemSchema = z.object({
  documentNumber: z.string().min(1, 'Document number is required'),
  phone: phoneNumberSchema.optional(),
});

export const trackDocumentsRequestSchema = z.object({
  documents: z.array(trackDocumentItemSchema).min(1).max(100, 'Maximum 100 documents can be tracked at once'),
});

// Delivery date request schema
export const deliveryDateRequestSchema = z.object({
  dateTime: novaPoshtaDateSchema.optional(),
  serviceType: serviceTypeSchema,
  citySender: novaPoshtaRefSchema,
  cityRecipient: novaPoshtaRefSchema,
});

// Price calculation request schema
export const priceCalculationRequestSchema = z.object({
  citySender: novaPoshtaRefSchema,
  cityRecipient: novaPoshtaRefSchema,
  weight: weightSchema,
  serviceType: serviceTypeSchema,
  cost: costSchema,
  cargoType: cargoTypeSchema,
  seatsAmount: z.number().int().min(1),
  redeliveryCalculate: z.object({
    cargoType: cargoTypeSchema,
    amount: costSchema,
  }).optional(),
  packCount: z.number().int().min(1).optional(),
  packRef: novaPoshtaRefSchema.optional(),
  amount: z.number().int().min(1).optional(),
  cargoDetails: z.array(z.object({
    cargoDescription: novaPoshtaRefSchema,
    amount: z.number().int().min(1),
  })).optional(),
  cargoDescription: novaPoshtaRefSchema.optional(),
  optionsSeat: z.array(optionsSeatSchema).optional(),
});

// Address and reference data schemas
export const searchSettlementsRequestSchema = z.object({
  cityName: string36Schema,
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(500).default(50),
});

export const searchSettlementStreetsRequestSchema = z.object({
  streetName: string36Schema,
  settlementRef: novaPoshtaRefSchema,
  limit: z.number().int().min(1).max(500).optional(),
});

export const citiesRequestSchema = z.object({
  ref: novaPoshtaRefSchema.optional(),
  findByString: string36Schema.optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(500).optional(),
});

export const timeIntervalsRequestSchema = z.object({
  recipientCityRef: novaPoshtaRefSchema,
  dateTime: string36Schema.optional(),
});

export const pickupTimeIntervalsRequestSchema = z.object({
  senderCityRef: novaPoshtaRefSchema,
  dateTime: novaPoshtaDateSchema,
});

// Reference data request schemas
export const getCargoTypesRequestSchema = z.object({});

export const getPalletsListRequestSchema = z.object({});

export const getPackListRequestSchema = z.object({
  length: z.number().int().min(1).optional(),
  width: z.number().int().min(1).optional(),
  height: z.number().int().min(1).optional(),
  volumetricWeight: z.number().min(0).optional(),
  typeOfPacking: z.string().optional(),
});

export const getTiresWheelsListRequestSchema = z.object({});

export const getCargoDescriptionListRequestSchema = z.object({
  findByString: string36Schema.optional(),
  page: z.number().int().min(1).max(500).optional(),
});

export const getMessageCodeTextRequestSchema = z.object({});

export const getServiceTypesRequestSchema = z.object({});

export const getOwnershipFormsListRequestSchema = z.object({});

export const getBackwardDeliveryCargoTypesRequestSchema = z.object({});

export const getTypesOfPayersForRedeliveryRequestSchema = z.object({});

// Address request schemas
export const getSettlementsRequestSchema = z.object({
  ref: novaPoshtaRefSchema.optional(),
});

export const getSettlementCountryRegionRequestSchema = z.object({
  areaRef: novaPoshtaRefSchema,
});

export const getStreetRequestSchema = z.object({
  cityRef: novaPoshtaRefSchema,
  findByString: string36Schema.optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(500).optional(),
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
