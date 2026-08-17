import type { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import type { GetTimeIntervalsRequest, NovaPoshtaResponse } from '@shopana/novaposhta-api-client';
import { PAYMENT_METHODS } from '@shopana/novaposhta-api-client';

import type { ToolArguments, ToolContext } from '../types/mcp.js';
import { toErrorResult, formatResponseErrors } from '../utils/error-handler.js';
import { assertOptionalString, assertString } from '../utils/validation.js';
import { createTextResult, formatAsJson } from '../utils/tool-response.js';

const referenceTools: Tool[] = [
  {
    name: 'reference_get_cargo_types',
    description:
      'List available cargo types supported by Nova Poshta via Common/getCargoTypes (doc 1.8). Docs advise caching this API-key-protected directory monthly; expect values such as Parcel, Cargo, Documents, TiresWheels, Pallet.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'reference_get_pack_list',
    description:
      'List available packaging types via Common/getPackList (doc 1.10). Returns standard package dimensions and descriptions. Useful for calculating delivery costs and validating package options. Docs recommend caching monthly.',
    inputSchema: {
      type: 'object',
      properties: {
        Length: { type: 'number', description: 'Optional package length filter in cm.' },
        Width: { type: 'number', description: 'Optional package width filter in cm.' },
        Height: { type: 'number', description: 'Optional package height filter in cm.' },
      },
      required: [],
    },
  },
  {
    name: 'reference_get_tires_wheels_list',
    description:
      'List available tires and wheels types via Common/getTiresWheelsList (doc 1.12). Returns types and descriptions for shipping tires and wheels as cargo. Docs recommend caching monthly.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'reference_get_cargo_description_list',
    description:
      'List cargo descriptions with optional search via Common/getCargoDescriptionList (doc 1.15). Returns predefined descriptions for common cargo types. Supports search by keyword. Docs recommend caching monthly.',
    inputSchema: {
      type: 'object',
      properties: {
        FindByString: { type: 'string', description: 'Optional search keyword for cargo description.' },
        Page: { type: 'number', description: 'Page number (default 1).' },
      },
      required: [],
    },
  },
  {
    name: 'reference_get_pickup_time_intervals',
    description:
      'Get available pickup time intervals via Common/getPickupTimeIntervals (doc 1.17). Returns time windows when Nova Poshta can pick up packages from sender. Requires city reference and date. Docs recommend caching hourly.',
    inputSchema: {
      type: 'object',
      properties: {
        SenderCityRef: { type: 'string', description: 'Sender city reference from address_search_cities.' },
        DateTime: { type: 'string', description: 'Pickup date (dd.mm.yyyy).' },
      },
      required: ['SenderCityRef', 'DateTime'],
    },
  },
  {
    name: 'reference_get_backward_cargo_types',
    description:
      'List backward delivery cargo types via Common/getBackwardDeliveryCargoTypes (doc 1.18). Returns types of cargo that can be sent back (documents, money, etc.). Used for return shipments and COD. Docs recommend caching monthly.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'reference_get_redelivery_payers',
    description:
      'List payer types for redelivery via Common/getTypesOfPayersForRedelivery (doc 1.19). Returns who can pay for backward delivery (Sender/Recipient). Used with return shipments. Docs recommend caching monthly.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'reference_get_service_types',
    description:
      'List delivery service types through Common/getServiceType (doc 1.9). Includes WarehouseWarehouse, WarehouseDoors, DoorsWarehouse, DoorsDoors, DoorsPostomat, and WarehousePostomat. Docs recommend refreshing this directory monthly.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'reference_get_payment_methods',
    description:
      'List supported payment methods for shipments (Cash/NonCash) matching the Common/getPaymentForm directory from doc 1.7, which notes that non-cash payments are only available to customers with a Nova Poshta contract.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'reference_get_pallet_types',
    description:
      'List pallet types with dimensions and weight via Common/getPalletsList (doc 1.13). Refresh monthly per docs, especially when offering reverse delivery of pallets.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'reference_get_time_intervals',
    description:
      'Get available delivery time intervals for recipient city using Common/getTimeIntervals (doc 1.16). Requires RecipientCityRef (and optional DateTime) and returns Number/Start/End entries that docs recommend caching monthly.',
    inputSchema: {
      type: 'object',
      properties: {
        RecipientCityRef: { type: 'string', description: 'Recipient city reference.' },
        DateTime: { type: 'string', description: 'Specific date (dd.mm.yyyy).' },
      },
      required: ['RecipientCityRef'],
    },
  },
  {
    name: 'reference_get_ownership_forms',
    description:
      'List corporate ownership forms required for counterparty creation via Common/getOwnershipFormsList (doc 1.11). Docs provide both short and full names for refs such as ТОВ, ПрАТ, ФГ and recommend a monthly refresh.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'reference_decode_message',
    description:
      'Decode Nova Poshta API message code into human readable text. Doc 1.2 explains how every response contains success/data/errors/warnings/info blocks with numeric codes; this helper calls getMessageCodeText to map those codes to UA/RU descriptions.',
    inputSchema: {
      type: 'object',
      properties: {
        MessageCode: { type: 'string', description: 'Message code (e.g., 20000200039).' },
      },
      required: ['MessageCode'],
    },
  },
  {
    name: 'reference_get_types_of_payers',
    description:
      'Get list of payer types (Sender/Recipient/ThirdPerson) for waybill creation via Common/getTypesOfPayers (doc 1.7). Docs stress the ThirdPerson payer is accessible only after signing a service contract and that the directory should be cached monthly.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'reference_get_payment_forms',
    description:
      'Get list of payment forms (Cash/NonCash) for waybill creation with Common/getPaymentForm (doc 1.7). Nova Poshta notes non-cash payments are available only to contracted clients, so keep a cached copy to validate user choices.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'reference_get_types_of_counterparties',
    description:
      'Get list of counterparty types (PrivatePerson/Organization) via Common/getTypesOfCounterparties (doc 1.14). Requires API key and, per docs, should be refreshed monthly to stay aligned with sender/recipient onboarding rules.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
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
      case 'reference_get_pack_list':
        return await handleGetPackList(args, context);
      case 'reference_get_tires_wheels_list':
        return await wrapList(() => context.client.reference.getTiresWheelsList(), 'tiresWheels');
      case 'reference_get_cargo_description_list':
        return await handleGetCargoDescriptionList(args, context);
      case 'reference_get_pickup_time_intervals':
        return await handleGetPickupTimeIntervals(args, context);
      case 'reference_get_backward_cargo_types':
        return await wrapList(
          () => context.client.reference.getBackwardDeliveryCargoTypes(),
          'backwardDeliveryCargoTypes',
        );
      case 'reference_get_redelivery_payers':
        return await wrapList(
          () => context.client.reference.getTypesOfPayersForRedelivery(),
          'payerTypesForRedelivery',
        );
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
    throw new Error(formatResponseErrors(response.errors, 'Nova Poshta API returned an error'));
  }

  return createTextResult(formatAsJson({ [key]: response.data, total: response.data?.length ?? 0 }), { response });
}

async function handleTimeIntervals(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const recipientCityRef = assertString(args?.RecipientCityRef, 'RecipientCityRef');
  const dateTime = assertOptionalString(args?.DateTime, 'DateTime');

  const request: GetTimeIntervalsRequest = {
    RecipientCityRef: recipientCityRef,
    ...(dateTime ? { DateTime: dateTime } : {}),
  };

  const response = await context.client.reference.getTimeIntervals(request);
  return createTextResult(formatAsJson({ intervals: response.data }), { response });
}

async function handleDecodeMessage(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const code = assertString(args?.MessageCode, 'MessageCode');
  const response = await context.client.reference.getMessageCodeText({});
  const match = response.data?.find(item => item.MessageCode === code);

  if (!match) {
    return createTextResult(`Message code ${code} not found`);
  }

  // Return only the matched code, not the entire response (which contains 230K+ tokens)
  return createTextResult(
    formatAsJson({
      code,
      text: match.MessageText,
      descriptionUA: match.MessageDescriptionUA,
      descriptionRU: match.MessageDescriptionRU,
    }),
  );
}

async function handleGetTypesOfPayers(_args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const response = await context.client.reference.getTypesOfPayers();
  return createTextResult(formatAsJson({ payerTypes: response.data }), { response });
}

async function handleGetPaymentForms(_args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const response = await context.client.reference.getPaymentForms();
  return createTextResult(formatAsJson({ paymentForms: response.data }), { response });
}

async function handleGetTypesOfCounterparties(_args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const response = await context.client.reference.getTypesOfCounterparties();
  return createTextResult(formatAsJson({ counterpartyTypes: response.data }), { response });
}

async function handleGetPackList(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const length = args?.Length !== undefined ? Number(args.Length) : undefined;
  const width = args?.Width !== undefined ? Number(args.Width) : undefined;
  const height = args?.Height !== undefined ? Number(args.Height) : undefined;

  const response = await context.client.reference.getPackList({
    ...(length !== undefined ? { Length: length } : {}),
    ...(width !== undefined ? { Width: width } : {}),
    ...(height !== undefined ? { Height: height } : {}),
  });

  return createTextResult(formatAsJson({ packs: response.data, total: response.data?.length ?? 0 }), { response });
}

async function handleGetCargoDescriptionList(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const findByString = assertOptionalString(args?.FindByString, 'FindByString');
  const page = args?.Page !== undefined ? Number(args.Page) : undefined;

  const response = await context.client.reference.getCargoDescriptionList({
    ...(findByString ? { FindByString: findByString } : {}),
    ...(page !== undefined ? { Page: page } : {}),
  });

  return createTextResult(formatAsJson({ cargoDescriptions: response.data, total: response.data?.length ?? 0 }), {
    response,
  });
}

async function handleGetPickupTimeIntervals(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const cityRef = assertString(args?.SenderCityRef, 'SenderCityRef');
  const dateTime = assertString(args?.DateTime, 'DateTime');

  const response = await context.client.reference.getPickupTimeIntervals({
    SenderCityRef: cityRef,
    DateTime: dateTime,
  });

  return createTextResult(formatAsJson({ intervals: response.data, total: response.data?.length ?? 0 }), { response });
}
