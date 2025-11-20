import type { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';

import type { ToolArguments, ToolContext } from '../types/mcp.js';
import { toErrorResult } from '../utils/error-handler.js';
import {
  assertOptionalString,
  assertString,
  isPhoneNumber,
  isTrackingNumber,
  sanitizePhone,
  isDateFormat,
} from '../utils/validation.js';
import { createTextResult, formatAsJson } from '../utils/tool-response.js';

const trackingTools: Tool[] = [
  {
    name: 'track_document',
    description:
      'Track a single Nova Poshta document by number and optional phone to receive live status, location, and ETA.',
    inputSchema: {
      type: 'object',
      properties: {
        documentNumber: {
          type: 'string',
          description: 'Nova Poshta tracking number (14 digits).',
        },
        phone: {
          type: 'string',
          description: 'Optional recipient phone in international format (380XXXXXXXXX).',
        },
      },
      required: ['documentNumber'],
    },
  },
  {
    name: 'track_multiple_documents',
    description: 'Track multiple Nova Poshta documents at once and receive aggregated statistics.',
    inputSchema: {
      type: 'object',
      properties: {
        documentNumbers: {
          type: 'array',
          description: 'List of tracking numbers to check.',
          items: {
            type: 'string',
          },
        },
      },
      required: ['documentNumbers'],
    },
  },
  {
    name: 'get_document_movement',
    description: 'Get movement history for up to 10 documents including statuses and timestamps.',
    inputSchema: {
      type: 'object',
      properties: {
        documentNumbers: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
        showDeliveryDetails: {
          type: 'boolean',
          description: 'Include extended delivery checkpoints.',
        },
      },
      required: ['documentNumbers'],
    },
  },
  {
    name: 'get_document_list',
    description: 'List documents created in the given date range.',
    inputSchema: {
      type: 'object',
      properties: {
        dateTimeFrom: {
          type: 'string',
          description: 'Start date (format dd.mm.yyyy).',
        },
        dateTimeTo: {
          type: 'string',
          description: 'End date (format dd.mm.yyyy).',
        },
        page: {
          type: 'number',
          description: 'Page number (default 1).',
        },
        fullList: {
          type: 'boolean',
          description: 'Request full list ignoring pagination (may be slow).',
        },
      },
      required: ['dateTimeFrom', 'dateTimeTo'],
    },
  },
];

export function getTrackingTools(): Tool[] {
  return trackingTools;
}

export async function handleTrackingTool(
  name: string,
  args: ToolArguments,
  context: ToolContext,
): Promise<CallToolResult> {
  try {
    switch (name) {
      case 'track_document':
        return await handleTrackDocument(args, context);
      case 'track_multiple_documents':
        return await handleTrackMultiple(args, context);
      case 'get_document_movement':
        return await handleDocumentMovement(args, context);
      case 'get_document_list':
        return await handleDocumentList(args, context);
      default:
        throw new Error(`Unknown tracking tool: ${name}`);
    }
  } catch (error) {
    return toErrorResult(error, `Tracking tool "${name}"`);
  }
}

async function handleTrackDocument(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const documentNumber = assertString(args?.documentNumber, 'documentNumber').trim();
  if (!isTrackingNumber(documentNumber)) {
    throw new Error('documentNumber must be a 14-digit Nova Poshta tracking number');
  }

  let phone = assertOptionalString(args?.phone, 'phone');
  if (phone) {
    phone = sanitizePhone(phone);
    if (!isPhoneNumber(phone)) {
      throw new Error('phone must match format 380XXXXXXXXX or +380XXXXXXXXX');
    }
  }

  const result = await context.client.tracking.trackDocument(documentNumber, phone);
  if (!result) {
    return createTextResult(`Document ${documentNumber} not found`, { documentNumber });
  }

  const highlighted = {
    number: result.Number,
    status: result.Status,
    statusCode: result.StatusCode,
    city: result.CityRecipient,
    warehouse: result.WarehouseRecipient,
    scheduledDeliveryDate: result.ScheduledDeliveryDate,
    actualDeliveryDate: result.ActualDeliveryDate,
    recipientDateTime: result.RecipientDateTime,
    weight: result.DocumentWeight,
    cost: result.DocumentCost,
  };

  return createTextResult(formatAsJson(highlighted), { document: result });
}

async function handleTrackMultiple(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const rawNumbers = Array.isArray(args?.documentNumbers) ? (args?.documentNumbers as unknown[]) : [];
  const numbers = rawNumbers.map(value => assertString(value, 'documentNumbers[]'));
  if (numbers.length === 0) {
    throw new Error('documentNumbers must contain at least one tracking number');
  }

  numbers.forEach(num => {
    if (!isTrackingNumber(num)) {
      throw new Error(`Invalid tracking number: ${num}`);
    }
  });

  const response = await context.client.tracking.trackDocuments({
    documents: numbers.map(documentNumber => ({ documentNumber })),
  });

  return createTextResult(
    formatAsJson({
      success: response.success,
      errors: response.errors,
      tracked: response.data?.length ?? 0,
    }),
    { response },
  );
}

async function handleDocumentMovement(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const rawNumbers = Array.isArray(args?.documentNumbers) ? (args?.documentNumbers as unknown[]) : [];
  const numbers = rawNumbers.map(value => assertString(value, 'documentNumbers[]'));
  if (numbers.length === 0) {
    throw new Error('documentNumbers must contain at least one tracking number');
  }

  const showDeliveryDetails = Boolean(args?.showDeliveryDetails);
  const response = await context.client.tracking.getDocumentMovement({
    documents: numbers.map(documentNumber => ({ documentNumber })),
    showDeliveryDetails,
  });

  return createTextResult(
    formatAsJson({
      success: response.success,
      entries: response.data?.length ?? 0,
    }),
    { response },
  );
}

async function handleDocumentList(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const dateTimeFrom = assertString(args?.dateTimeFrom, 'dateTimeFrom').trim();
  const dateTimeTo = assertString(args?.dateTimeTo, 'dateTimeTo').trim();

  if (!isDateFormat(dateTimeFrom)) {
    throw new Error('dateTimeFrom must be in format dd.mm.yyyy');
  }
  if (!isDateFormat(dateTimeTo)) {
    throw new Error('dateTimeTo must be in format dd.mm.yyyy');
  }

  const page = args?.page !== undefined ? Number(args.page) : undefined;
  const getFullList = args?.fullList ? '1' : '0';

  const response = await context.client.tracking.getDocumentList({
    dateTimeFrom,
    dateTimeTo,
    page,
    getFullList,
  });

  return createTextResult(
    formatAsJson({
      success: response.success,
      documents: response.data?.length ?? 0,
    }),
    { response },
  );
}
