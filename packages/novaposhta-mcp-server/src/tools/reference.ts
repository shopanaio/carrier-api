import type { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import type { GetTimeIntervalsRequest, NovaPoshtaResponse } from '@shopana/novaposhta-api-client';
import { PAYMENT_METHODS } from '@shopana/novaposhta-api-client';

import type { ToolArguments, ToolContext } from '../types/mcp.js';
import { toErrorResult } from '../utils/error-handler.js';
import { assertOptionalString, assertString } from '../utils/validation.js';
import { createTextResult, formatAsJson } from '../utils/tool-response.js';

const referenceTools: Tool[] = [
  {
    name: 'reference_get_cargo_types',
    description: 'List available cargo types supported by Nova Poshta.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'reference_get_service_types',
    description: 'List delivery service types (warehouse-door etc.).',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'reference_get_payment_methods',
    description: 'List supported payment methods for shipments.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'reference_get_pallet_types',
    description: 'List pallet types with dimensions and weight.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'reference_get_time_intervals',
    description: 'Get available delivery time intervals for recipient city.',
    inputSchema: {
      type: 'object',
      properties: {
        recipientCityRef: { type: 'string', description: 'Recipient city reference.' },
        dateTime: { type: 'string', description: 'Specific date (dd.mm.yyyy).' },
      },
      required: ['recipientCityRef'],
    },
  },
  {
    name: 'reference_get_ownership_forms',
    description: 'List corporate ownership forms required for counterparty creation.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'reference_decode_message',
    description: 'Decode Nova Poshta API message code into human readable text.',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Message code (e.g., 20000200039).' },
      },
      required: ['code'],
    },
  },
  {
    name: 'reference_get_types_of_payers',
    description: 'Get list of payer types (Sender/Recipient/ThirdPerson) for waybill creation.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'reference_get_payment_forms',
    description: 'Get list of payment forms (Cash/NonCash) for waybill creation.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'reference_get_types_of_counterparties',
    description: 'Get list of counterparty types (PrivatePerson/Organization).',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
];

export function getReferenceTools(): Tool[] {
  return referenceTools;
}

export async function handleReferenceTool(
  name: string,
  args: ToolArguments,
  context: ToolContext,
): Promise<CallToolResult> {
  try {
    switch (name) {
      case 'reference_get_cargo_types':
        return await wrapList(() => context.client.reference.getCargoTypes(), 'cargoTypes');
      case 'reference_get_service_types':
        return await wrapList(() => context.client.reference.getServiceTypes(), 'serviceTypes');
      case 'reference_get_payment_methods':
        return createTextResult(formatAsJson({ paymentMethods: PAYMENT_METHODS }));
      case 'reference_get_pallet_types':
        return await wrapList(() => context.client.reference.getPalletsList(), 'pallets');
      case 'reference_get_time_intervals':
        return await handleTimeIntervals(args, context);
      case 'reference_get_ownership_forms':
        return await wrapList(() => context.client.reference.getOwnershipFormsList(), 'ownershipForms');
      case 'reference_decode_message':
        return await handleDecodeMessage(args, context);
      case 'reference_get_types_of_payers':
        return await handleGetTypesOfPayers(args, context);
      case 'reference_get_payment_forms':
        return await handleGetPaymentForms(args, context);
      case 'reference_get_types_of_counterparties':
        return await handleGetTypesOfCounterparties(args, context);
      default:
        throw new Error(`Unknown reference tool: ${name}`);
    }
  } catch (error) {
    return toErrorResult(error, `Reference tool "${name}"`);
  }
}

async function wrapList<T>(
  factory: () => Promise<NovaPoshtaResponse<readonly T[]>>,
  key: string,
): Promise<CallToolResult> {
  const response = await factory();
  if (!response.success) {
    throw new Error(response.errors?.join(', ') || 'Nova Poshta API returned an error');
  }

  return createTextResult(formatAsJson({ [key]: response.data, total: response.data?.length ?? 0 }), { response });
}

async function handleTimeIntervals(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const recipientCityRef = assertString(args?.recipientCityRef, 'recipientCityRef');
  const dateTime = assertOptionalString(args?.dateTime, 'dateTime');

  const request: GetTimeIntervalsRequest = {
    recipientCityRef,
    ...(dateTime ? { dateTime } : {}),
  };

  const response = await context.client.reference.getTimeIntervals(request);
  return createTextResult(formatAsJson({ intervals: response.data }), { response });
}

async function handleDecodeMessage(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const code = assertString(args?.code, 'code');
  const response = await context.client.reference.getMessageCodeText({});
  const match = response.data?.find(item => item.MessageCode === code);

  if (!match) {
    return createTextResult(`Message code ${code} not found`, { response });
  }

  return createTextResult(
    formatAsJson({
      code,
      text: match.MessageText,
      descriptionUA: match.MessageDescriptionUA,
      descriptionRU: match.MessageDescriptionRU,
    }),
    { response },
  );
}

async function handleGetTypesOfPayers(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const response = await context.client.reference.getTypesOfPayers();
  return createTextResult(formatAsJson({ payerTypes: response.data }), { response });
}

async function handleGetPaymentForms(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const response = await context.client.reference.getPaymentForms();
  return createTextResult(formatAsJson({ paymentForms: response.data }), { response });
}

async function handleGetTypesOfCounterparties(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const response = await context.client.reference.getTypesOfCounterparties();
  return createTextResult(formatAsJson({ counterpartyTypes: response.data }), { response });
}
