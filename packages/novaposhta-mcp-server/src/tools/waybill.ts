import type { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import type {
  CreateWaybillRequest,
  CreateWaybillWithOptionsRequest,
  CreateWaybillToPostomatRequest,
  DeleteWaybillRequest,
  DeliveryDateRequest,
  PriceCalculationRequest,
  UpdateWaybillRequest,
} from '@shopana/novaposhta-api-client';
import {
  isValidPoshtomatCargoType,
  isValidPoshtomatDimensions,
  isValidPoshtomatServiceType,
} from '@shopana/novaposhta-api-client';

import type { ToolArguments, ToolContext } from '../types/mcp.js';
import { toErrorResult } from '../utils/error-handler.js';
import { assertNumber, assertOptionalString, assertString, isDateFormat, isPhoneNumber } from '../utils/validation.js';
import { createTextResult, formatAsJson } from '../utils/tool-response.js';

const postomatRequestSchema: Tool['inputSchema'] = {
  type: 'object',
  properties: {
    request: {
      type: 'object',
      description:
        'Nova Poshta payload for delivery to a recipient postomat. SenderAddress must reference a supported sender address, never a postomat.',
      properties: {
        PayerType: { type: 'string', enum: ['Sender', 'Recipient', 'ThirdPerson'] },
        PaymentMethod: { type: 'string', enum: ['Cash', 'NonCash'] },
        DateTime: { type: 'string', pattern: '^\\d{2}\\.\\d{2}\\.\\d{4}$', description: 'Shipping date (dd.mm.yyyy).' },
        CargoType: { type: 'string', enum: ['Parcel', 'Documents'] },
        Weight: {
          type: 'number',
          minimum: 0.1,
          maximum: 20,
          description: 'Total shipment weight in kg (maximum 20 kg).',
        },
        ServiceType: { type: 'string', enum: ['DoorsPostomat', 'WarehousePostomat'] },
        SeatsAmount: { type: 'integer', minimum: 1 },
        Description: { type: 'string', minLength: 1, maxLength: 36 },
        Cost: { type: 'number', minimum: 0, maximum: 10000, description: 'Declared value in UAH (maximum 10,000).' },
        CitySender: { type: 'string', minLength: 1, description: 'Sender city reference.' },
        Sender: { type: 'string', minLength: 1, description: 'Sender counterparty reference.' },
        SenderAddress: {
          type: 'string',
          minLength: 1,
          description:
            'Supported sender address reference. A postomat reference is not accepted by InternetDocument/save.',
        },
        SenderWarehouseIndex: { type: 'string', minLength: 1 },
        ContactSender: { type: 'string', minLength: 1, description: 'Sender contact reference.' },
        SendersPhone: { type: 'string', pattern: '^380\\d{9}$' },
        CityRecipient: { type: 'string', minLength: 1, description: 'Recipient city reference.' },
        Recipient: { type: 'string', minLength: 1, description: 'Recipient counterparty reference.' },
        RecipientAddress: { type: 'string', minLength: 1, description: 'Recipient postomat reference.' },
        RecipientWarehouseIndex: { type: 'string', minLength: 1, description: 'Recipient postomat index.' },
        ContactRecipient: { type: 'string', minLength: 1, description: 'Recipient contact reference.' },
        RecipientsPhone: { type: 'string', pattern: '^380\\d{9}$' },
        OptionsSeat: {
          type: 'array',
          minItems: 1,
          description: 'Cargo dimensions for every seat; required for postomat delivery.',
          items: {
            type: 'object',
            properties: {
              Weight: { type: 'number', exclusiveMinimum: 0, maximum: 20 },
              VolumetricWidth: { type: 'number', exclusiveMinimum: 0, maximum: 40 },
              VolumetricLength: { type: 'number', exclusiveMinimum: 0, maximum: 60 },
              VolumetricHeight: { type: 'number', exclusiveMinimum: 0, maximum: 30 },
              VolumetricVolume: { type: 'number', exclusiveMinimum: 0 },
              PackRef: { type: 'string', minLength: 1 },
              Cost: { type: 'number', minimum: 0, maximum: 10000 },
              Description: { type: 'string', minLength: 1, maxLength: 36 },
              SpecialCargo: { type: 'string', enum: ['0', '1'] },
            },
            required: ['Weight', 'VolumetricWidth', 'VolumetricLength', 'VolumetricHeight'],
          },
        },
      },
      required: [
        'PayerType',
        'PaymentMethod',
        'DateTime',
        'CargoType',
        'Weight',
        'ServiceType',
        'SeatsAmount',
        'Description',
        'Cost',
        'CitySender',
        'Sender',
        'SenderAddress',
        'ContactSender',
        'SendersPhone',
        'CityRecipient',
        'Recipient',
        'RecipientAddress',
        'ContactRecipient',
        'RecipientsPhone',
        'OptionsSeat',
      ],
    },
  },
  required: ['request'],
};

const waybillTools: Tool[] = [
  {
    name: 'waybill_calculate_cost',
    description:
      'Calculate delivery cost and optional delivery date estimation for a shipment. Doc 1.2 explains that every Nova Poshta call sends apiKey/modelName/calledMethod/methodProperties, so this helper either forwards your raw InternetDocument payload or builds one from typed fields (CitySender, CityRecipient, ServiceType, CargoType, Cost, Weight, SeatsAmount).',
    inputSchema: {
      type: 'object',
      properties: {
        request: {
          type: 'object',
          description:
            'Raw Nova Poshta price calculation payload (CitySender, CityRecipient, ServiceType, CargoType, Cost, Weight, SeatsAmount).',
        },
        CitySender: { type: 'string', description: 'Sender city reference.' },
        CityRecipient: { type: 'string', description: 'Recipient city reference.' },
        ServiceType: { type: 'string', description: 'Service type (WarehouseWarehouse, WarehouseDoors, etc.).' },
        CargoType: { type: 'string', description: 'Cargo type (Parcel, Documents, TiresWheels, etc.).' },
        Cost: { type: 'number', description: 'Declared value in UAH.' },
        Weight: { type: 'number', description: 'Weight in kg.' },
        SeatsAmount: { type: 'number', description: 'Number of seats.' },
      },
      required: [],
    },
  },
  {
    name: 'waybill_get_estimate',
    description:
      'Get complete shipment estimate (price + delivery date) in one call via InternetDocument/getDocumentPrice and getDocumentDeliveryDate (doc 1.2). Combines cost calculation and delivery date estimation for convenience. Requires the same PascalCase parameters as waybill_calculate_cost.',
    inputSchema: {
      type: 'object',
      properties: {
        request: {
          type: 'object',
          description: 'Raw Nova Poshta price calculation payload.',
        },
        CitySender: { type: 'string', description: 'Sender city reference.' },
        CityRecipient: { type: 'string', description: 'Recipient city reference.' },
        ServiceType: { type: 'string', description: 'Service type (WarehouseWarehouse, WarehouseDoors, etc.).' },
        CargoType: { type: 'string', description: 'Cargo type (Parcel, Documents, TiresWheels, etc.).' },
        Cost: { type: 'number', description: 'Declared value in UAH.' },
        Weight: { type: 'number', description: 'Weight in kg.' },
        SeatsAmount: { type: 'number', description: 'Number of seats.' },
      },
      required: [],
    },
  },
  {
    name: 'waybill_create',
    description:
      'Create a standard Nova Poshta waybill (Internet document) via InternetDocument/save (doc 1.2). This is the basic waybill creation method. For additional services use waybill_create_with_options. For postomat delivery use waybill_create_to_postomat.',
    inputSchema: {
      type: 'object',
      properties: {
        request: {
          type: 'object',
          description: 'Raw Nova Poshta create waybill payload (see docs).',
        },
      },
      required: ['request'],
    },
  },
  {
    name: 'waybill_create_with_options',
    description:
      'Create a Nova Poshta waybill with additional options and services via InternetDocument/save (doc 1.2). Supports backward delivery, additional services, third-party payer, and RedBox barcodes. Use this when you need COD, insurance, or return shipments.',
    inputSchema: {
      type: 'object',
      properties: {
        request: {
          type: 'object',
          description:
            'Raw Nova Poshta create waybill payload with additional options (backwardDeliveryData, additionalServices, thirdPerson, redBoxBarcode).',
        },
      },
      required: ['request'],
    },
  },
  {
    name: 'waybill_create_to_postomat',
    description:
      'Create a waybill for delivery TO a recipient postomat via InternetDocument/save (doc 1.2), using ServiceType DoorsPostomat or WarehousePostomat. For physical sending FROM a postomat, create the waybill with a supported SenderAddress and use the Nova Poshta mobile app to open and load the locker; do not pass a postomat as SenderAddress. Recipient postomats accept only Parcel or Documents cargo, have a 20 kg and 10,000 UAH limit, and require OptionsSeat dimensions.',
    inputSchema: postomatRequestSchema,
  },
  {
    name: 'waybill_create_for_postomat',
    description:
      'Deprecated compatibility alias for waybill_create_to_postomat. Creates a waybill for delivery TO a recipient postomat; it does not allow a postomat as SenderAddress.',
    inputSchema: postomatRequestSchema,
  },
  {
    name: 'waybill_create_batch',
    description:
      'Batch create multiple waybills sequentially via InternetDocument/save (doc 1.2). Processes each waybill one by one to avoid rate limiting. Returns array of results including any errors. Useful for bulk shipment creation.',
    inputSchema: {
      type: 'object',
      properties: {
        requests: {
          type: 'array',
          items: { type: 'object' },
          description: 'Array of Nova Poshta create waybill payloads.',
        },
      },
      required: ['requests'],
    },
  },
  {
    name: 'waybill_update',
    description:
      'Update an existing waybill. Per doc 1.2 the same InternetDocument request envelope is used for update calls, so pass the raw payload (must include DocumentRef) exactly as defined by Nova Poshta.',
    inputSchema: {
      type: 'object',
      properties: {
        request: {
          type: 'object',
          description: 'Raw Nova Poshta update payload (must include DocumentRef).',
        },
      },
      required: ['request'],
    },
  },
  {
    name: 'waybill_delete',
    description:
      'Delete one or multiple waybills by their DocumentRef via InternetDocument/delete (doc 1.2). Waybills can only be deleted before they enter processing. Returns success/error status for the operation.',
    inputSchema: {
      type: 'object',
      properties: {
        documentRefs: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of DocumentRef values to delete.',
        },
      },
      required: ['documentRefs'],
    },
  },
  {
    name: 'waybill_delete_batch',
    description:
      'Batch delete multiple waybills by their DocumentRef via InternetDocument/delete (doc 1.2). Alias for waybill_delete that processes all refs in a single API call. Waybills can only be deleted before they enter processing.',
    inputSchema: {
      type: 'object',
      properties: {
        documentRefs: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of DocumentRef values to delete.',
        },
      },
      required: ['documentRefs'],
    },
  },
  {
    name: 'waybill_get_delivery_date',
    description:
      'Get estimated delivery date for a city pair and service type. Doc 1.2 outlines the generic Nova Poshta envelope, and this helper builds the methodProperties (CitySender, CityRecipient, ServiceType, optional DateTime) expected by the delivery-date method.',
    inputSchema: {
      type: 'object',
      properties: {
        request: {
          type: 'object',
          description: 'Raw Nova Poshta delivery date payload.',
        },
        CitySender: { type: 'string', description: 'Sender city reference.' },
        CityRecipient: { type: 'string', description: 'Recipient city reference.' },
        ServiceType: { type: 'string', description: 'Service type.' },
        DateTime: { type: 'string', description: 'Optional shipment date (dd.mm.yyyy).' },
      },
      required: [],
    },
  },
];

export function getWaybillTools(): Tool[] {
  return waybillTools;
}

export async function handleWaybillTool(
  name: string,
  args: ToolArguments,
  context: ToolContext,
): Promise<CallToolResult> {
  try {
    switch (name) {
      case 'waybill_calculate_cost':
        return await handleCalculateCost(args, context);
      case 'waybill_get_estimate':
        return await handleGetEstimate(args, context);
      case 'waybill_create':
        return await handleCreateWaybill(args, context);
      case 'waybill_create_with_options':
        return await handleCreateWaybillWithOptions(args, context);
      case 'waybill_create_to_postomat':
      case 'waybill_create_for_postomat':
        return await handleCreateToPostomat(args, context);
      case 'waybill_create_batch':
        return await handleCreateBatch(args, context);
      case 'waybill_update':
        return await handleUpdateWaybill(args, context);
      case 'waybill_delete':
        return await handleDeleteWaybill(args, context);
      case 'waybill_delete_batch':
        return await handleDeleteBatch(args, context);
      case 'waybill_get_delivery_date':
        return await handleDeliveryDate(args, context);
      default:
        throw new Error(`Unknown waybill tool: ${name}`);
    }
  } catch (error) {
    return toErrorResult(error, `Waybill tool "${name}"`);
  }
}

async function handleCalculateCost(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const request = buildPriceRequest(args);
  const [price, delivery] = await Promise.all([
    context.client.waybill.getPrice(request),
    context.client.waybill.getDeliveryDate({
      CitySender: request.CitySender,
      CityRecipient: request.CityRecipient,
      ServiceType: request.ServiceType,
    }),
  ]);

  const structured = {
    success: price.success && delivery.success,
    price: price.data?.[0],
    deliveryDate: delivery.data?.[0],
  };

  return createTextResult(formatAsJson(structured), { price, delivery });
}

async function handleCreateWaybill(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const request = ensureObject<CreateWaybillRequest>(args?.request, 'request');
  const response = await context.client.waybill.create(request);
  return createTextResult(
    formatAsJson({
      success: response.success,
      refs: response.data?.map(item => item.Ref),
      warnings: response.warnings,
    }),
    { response },
  );
}

async function handleUpdateWaybill(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const request = ensureObject<UpdateWaybillRequest>(args?.request, 'request');
  const response = await context.client.waybill.update(request);
  return createTextResult(
    formatAsJson({
      success: response.success,
      updated: response.data?.length ?? 0,
      warnings: response.warnings,
    }),
    { response },
  );
}

async function handleDeleteWaybill(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const documentRefsInput = Array.isArray(args?.documentRefs) ? (args?.documentRefs as unknown[]) : [];
  const documentRefs = documentRefsInput.map(value => assertString(value, 'documentRefs[]'));
  if (documentRefs.length === 0) {
    throw new Error('documentRefs must contain at least one DocumentRef');
  }

  const request: DeleteWaybillRequest = { DocumentRefs: documentRefs };
  const response = await context.client.waybill.delete(request);

  return createTextResult(
    formatAsJson({
      success: response.success,
      deleted: response.data?.length ?? 0,
      errors: response.errors,
    }),
    { response },
  );
}

async function handleDeliveryDate(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const request = buildDeliveryDateRequest(args);
  const response = await context.client.waybill.getDeliveryDate(request);

  return createTextResult(
    formatAsJson({
      success: response.success,
      deliveryDate: response.data?.[0],
      warnings: response.warnings,
    }),
    { response },
  );
}

function buildPriceRequest(args: ToolArguments): PriceCalculationRequest {
  const payload = resolvePayload(args);

  const CitySender = assertString(payload['CitySender'], 'CitySender');
  const CityRecipient = assertString(payload['CityRecipient'], 'CityRecipient');
  const ServiceType = assertString(payload['ServiceType'], 'ServiceType');
  const CargoType = assertString(payload['CargoType'], 'CargoType');
  const Cost = assertNumber(payload['Cost'], 'Cost');
  const Weight = assertNumber(payload['Weight'], 'Weight');
  const SeatsAmount = assertNumber(payload['SeatsAmount'] ?? 1, 'SeatsAmount');

  return {
    ...(payload as Record<string, unknown>),
    CitySender,
    CityRecipient,
    ServiceType,
    CargoType,
    Cost,
    Weight,
    SeatsAmount,
  } as PriceCalculationRequest;
}

function buildDeliveryDateRequest(args: ToolArguments): DeliveryDateRequest {
  const payload = resolvePayload(args);
  const CitySender = assertString(payload['CitySender'], 'CitySender');
  const CityRecipient = assertString(payload['CityRecipient'], 'CityRecipient');
  const ServiceType = assertString(payload['ServiceType'], 'ServiceType');
  const DateTime = assertOptionalString(payload['DateTime'], 'DateTime');

  const request: DeliveryDateRequest = {
    ...(payload as Record<string, unknown>),
    CitySender,
    CityRecipient,
    ServiceType,
  };

  if (DateTime) {
    request.DateTime = DateTime;
  }

  return request;
}

function ensureObject<T>(value: unknown, field: string): T {
  if (!value || typeof value !== 'object') {
    throw new Error(`${field} must be an object with valid Nova Poshta payload`);
  }
  return value as T;
}

async function handleGetEstimate(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const request = buildPriceRequest(args);
  const result = await context.client.waybill.getEstimate(request);

  return createTextResult(
    formatAsJson({
      price: result.price.data?.[0],
      deliveryDate: result.deliveryDate.data?.[0],
      success: result.price.success && result.deliveryDate.success,
    }),
    { price: result.price, deliveryDate: result.deliveryDate },
  );
}

async function handleCreateWaybillWithOptions(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const request = ensureObject<CreateWaybillWithOptionsRequest>(args?.request, 'request');
  const response = await context.client.waybill.createWithOptions(request);
  return createTextResult(
    formatAsJson({
      success: response.success,
      refs: response.data?.map(item => item.Ref),
      warnings: response.warnings,
    }),
    { response },
  );
}

async function handleCreateToPostomat(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const request = validateCreateToPostomatRequest(args?.request);
  const response = await context.client.waybill.createToPostomat(request);
  const result = createTextResult(
    formatAsJson({
      success: response.success,
      refs: response.data?.map(item => item.Ref),
      errors: response.errors,
      errorCodes: response.errorCodes,
      warnings: response.warnings,
    }),
    { response },
  );

  return response.success ? result : { ...result, isError: true };
}

function validateCreateToPostomatRequest(value: unknown): CreateWaybillToPostomatRequest {
  const request = ensureObject<Record<string, unknown>>(value, 'request');

  for (const field of [
    'PayerType',
    'PaymentMethod',
    'DateTime',
    'CargoType',
    'ServiceType',
    'Description',
    'CitySender',
    'Sender',
    'SenderAddress',
    'ContactSender',
    'SendersPhone',
    'CityRecipient',
    'Recipient',
    'RecipientAddress',
    'ContactRecipient',
    'RecipientsPhone',
  ]) {
    assertString(request[field], `request.${field}`);
  }

  if (!['Sender', 'Recipient', 'ThirdPerson'].includes(request['PayerType'] as string)) {
    throw new Error('Field "request.PayerType" must be Sender, Recipient, or ThirdPerson');
  }
  if (!['Cash', 'NonCash'].includes(request['PaymentMethod'] as string)) {
    throw new Error('Field "request.PaymentMethod" must be Cash or NonCash');
  }
  if (!isDateFormat(request['DateTime'])) {
    throw new Error('Field "request.DateTime" must be a valid date in dd.mm.yyyy format');
  }
  if (!isValidPoshtomatCargoType(request['CargoType'] as never)) {
    throw new Error('Field "request.CargoType" must be Parcel or Documents for postomat delivery');
  }
  if (!isValidPoshtomatServiceType(request['ServiceType'] as never)) {
    throw new Error('Field "request.ServiceType" must be DoorsPostomat or WarehousePostomat');
  }
  if (!isPhoneNumber(request['SendersPhone'])) {
    throw new Error('Field "request.SendersPhone" must contain 12 digits and start with 380');
  }
  if (!isPhoneNumber(request['RecipientsPhone'])) {
    throw new Error('Field "request.RecipientsPhone" must contain 12 digits and start with 380');
  }
  if ((request['Description'] as string).length > 36) {
    throw new Error('Field "request.Description" must not exceed 36 characters');
  }
  assertOptionalString(request['SenderWarehouseIndex'], 'request.SenderWarehouseIndex');
  assertOptionalString(request['RecipientWarehouseIndex'], 'request.RecipientWarehouseIndex');

  const weight = assertNumber(request['Weight'], 'request.Weight');
  if (weight < 0.1 || weight > 20) {
    throw new Error('Field "request.Weight" must be between 0.1 and 20 kg for postomat delivery');
  }
  const seatsAmount = assertNumber(request['SeatsAmount'], 'request.SeatsAmount');
  if (!Number.isInteger(seatsAmount) || seatsAmount < 1) {
    throw new Error('Field "request.SeatsAmount" must be a positive integer');
  }
  const cost = assertNumber(request['Cost'], 'request.Cost');
  if (cost < 0 || cost > 10000) {
    throw new Error('Field "request.Cost" must be between 0 and 10000 UAH for postomat delivery');
  }

  const optionsSeat = request['OptionsSeat'];
  if (!Array.isArray(optionsSeat) || optionsSeat.length === 0) {
    throw new Error('Field "request.OptionsSeat" must contain at least one seat for postomat delivery');
  }
  if (seatsAmount !== optionsSeat.length) {
    throw new Error('Field "request.SeatsAmount" must match the number of request.OptionsSeat items');
  }
  optionsSeat.forEach((value, index) => {
    const seat = ensureObject<Record<string, unknown>>(value, `request.OptionsSeat[${index}]`);
    const normalizedSeat = {
      ...seat,
      Weight: assertNumber(seat['Weight'], `request.OptionsSeat[${index}].Weight`),
      VolumetricWidth: assertNumber(seat['VolumetricWidth'], `request.OptionsSeat[${index}].VolumetricWidth`),
      VolumetricLength: assertNumber(seat['VolumetricLength'], `request.OptionsSeat[${index}].VolumetricLength`),
      VolumetricHeight: assertNumber(seat['VolumetricHeight'], `request.OptionsSeat[${index}].VolumetricHeight`),
    };
    if (
      normalizedSeat.Weight <= 0 ||
      normalizedSeat.VolumetricWidth <= 0 ||
      normalizedSeat.VolumetricLength <= 0 ||
      normalizedSeat.VolumetricHeight <= 0 ||
      !isValidPoshtomatDimensions(normalizedSeat as never)
    ) {
      throw new Error(
        `request.OptionsSeat[${index}] exceeds postomat limits: weight 20 kg, width 40 cm, length 60 cm, height 30 cm`,
      );
    }
  });

  return request as unknown as CreateWaybillToPostomatRequest;
}

async function handleCreateBatch(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const requestsInput = Array.isArray(args?.requests) ? (args?.requests as unknown[]) : [];
  if (requestsInput.length === 0) {
    throw new Error('requests must contain at least one waybill request');
  }

  const requests = requestsInput.map((req, idx) => ensureObject<CreateWaybillRequest>(req, `requests[${idx}]`));
  const responses = await context.client.waybill.createBatch(requests);

  const summary = {
    total: responses.length,
    successful: responses.filter(r => r.success).length,
    failed: responses.filter(r => !r.success).length,
  };

  return createTextResult(formatAsJson({ summary, results: responses }));
}

async function handleDeleteBatch(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const documentRefsInput = Array.isArray(args?.documentRefs) ? (args?.documentRefs as unknown[]) : [];
  const documentRefs = documentRefsInput.map(value => assertString(value, 'documentRefs[]'));
  if (documentRefs.length === 0) {
    throw new Error('documentRefs must contain at least one DocumentRef');
  }

  const response = await context.client.waybill.deleteBatch(documentRefs);

  return createTextResult(
    formatAsJson({
      success: response.success,
      deleted: response.data?.length ?? 0,
      errors: response.errors,
    }),
    { response },
  );
}

function resolvePayload(args: ToolArguments): Record<string, unknown> {
  const requestPayload = (args && typeof args === 'object' ? args : {}) as Record<string, unknown>;
  const nested = requestPayload['request'];

  if (nested && typeof nested === 'object') {
    return nested as Record<string, unknown>;
  }

  return requestPayload;
}
