import type { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import type {
  CreateWaybillRequest,
  DeleteWaybillRequest,
  DeliveryDateRequest,
  PriceCalculationRequest,
  UpdateWaybillRequest,
} from '@shopana/novaposhta-api-client';

import type { ToolArguments, ToolContext } from '../types/mcp.js';
import { toErrorResult } from '../utils/error-handler.js';
import { assertOptionalString, assertString } from '../utils/validation.js';
import { createTextResult, formatAsJson } from '../utils/tool-response.js';

const waybillTools: Tool[] = [
  {
    name: 'waybill_calculate_cost',
    description: 'Calculate delivery cost and optional delivery date estimation for a shipment.',
    inputSchema: {
      type: 'object',
      properties: {
        request: {
          type: 'object',
          description: 'Raw Nova Poshta price calculation payload (citySender, cityRecipient, serviceType, cost, weight, cargoType, seatsAmount).',
        },
        citySender: { type: 'string', description: 'Sender city reference.' },
        cityRecipient: { type: 'string', description: 'Recipient city reference.' },
        serviceType: { type: 'string', description: 'Service type (WarehouseWarehouse, WarehouseDoors, etc.).' },
        cargoType: { type: 'string', description: 'Cargo type (Parcel, Documents, TiresWheels, etc.).' },
        cost: { type: 'number', description: 'Declared value in UAH.' },
        weight: { type: 'number', description: 'Weight in kg.' },
        seatsAmount: { type: 'number', description: 'Number of seats.' },
      },
      required: [],
    },
  },
  {
    name: 'waybill_create',
    description: 'Create a Nova Poshta waybill (Internet document). Provide full request payload.',
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
    name: 'waybill_update',
    description: 'Update an existing waybill. Provide raw update payload.',
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
    description: 'Delete one or multiple waybills by their DocumentRef.',
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
    description: 'Get estimated delivery date for a city pair and service type.',
    inputSchema: {
      type: 'object',
      properties: {
        request: {
          type: 'object',
          description: 'Raw Nova Poshta delivery date payload.',
        },
        citySender: { type: 'string', description: 'Sender city reference.' },
        cityRecipient: { type: 'string', description: 'Recipient city reference.' },
        serviceType: { type: 'string', description: 'Service type.' },
        dateTime: { type: 'string', description: 'Optional shipment date (dd.mm.yyyy).' },
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
      case 'waybill_create':
        return await handleCreateWaybill(args, context);
      case 'waybill_update':
        return await handleUpdateWaybill(args, context);
      case 'waybill_delete':
        return await handleDeleteWaybill(args, context);
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
      citySender: request.citySender,
      cityRecipient: request.cityRecipient,
      serviceType: request.serviceType,
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

  const request: DeleteWaybillRequest = { documentRefs };
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
  if (args?.request && typeof args.request === 'object') {
    return args.request as PriceCalculationRequest;
  }

  const citySender = assertString(args?.citySender, 'citySender');
  const cityRecipient = assertString(args?.cityRecipient, 'cityRecipient');
  const serviceType = assertString(args?.serviceType, 'serviceType');
  const cargoType = assertString(args?.cargoType, 'cargoType');
  const cost = Number(args?.cost);
  const weight = Number(args?.weight);
  const seatsAmount = Number(args?.seatsAmount ?? 1);

  if ([cost, weight, seatsAmount].some(value => Number.isNaN(value))) {
    throw new Error('cost, weight, and seatsAmount must be valid numbers');
  }

  return {
    citySender,
    cityRecipient,
    serviceType: serviceType as PriceCalculationRequest['serviceType'],
    cargoType: cargoType as PriceCalculationRequest['cargoType'],
    cost,
    weight,
    seatsAmount,
  };
}

function buildDeliveryDateRequest(args: ToolArguments): DeliveryDateRequest {
  if (args?.request && typeof args.request === 'object') {
    return args.request as DeliveryDateRequest;
  }

  const citySender = assertString(args?.citySender, 'citySender');
  const cityRecipient = assertString(args?.cityRecipient, 'cityRecipient');
  const serviceType = assertString(args?.serviceType, 'serviceType');
  const dateTime = assertOptionalString(args?.dateTime, 'dateTime');

  const request: DeliveryDateRequest = {
    citySender,
    cityRecipient,
    serviceType: serviceType as DeliveryDateRequest['serviceType'],
    ...(dateTime ? { dateTime: dateTime as DeliveryDateRequest['dateTime'] } : {}),
  };

  return request;
}

function ensureObject<T>(value: unknown, field: string): T {
  if (!value || typeof value !== 'object') {
    throw new Error(`${field} must be an object with valid Nova Poshta payload`);
  }
  return value as T;
}
