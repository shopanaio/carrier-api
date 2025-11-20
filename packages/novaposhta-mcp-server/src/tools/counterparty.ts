import type { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';

import type { ToolArguments, ToolContext } from '../types/mcp.js';
import { toErrorResult } from '../utils/error-handler.js';
import { assertOptionalNumber, assertOptionalString, assertString } from '../utils/validation.js';
import { createTextResult, formatAsJson } from '../utils/tool-response.js';

const counterpartyTools: Tool[] = [
  {
    name: 'counterparty_get_counterparties',
    description: 'Get counterparties list filtered by property (Sender/Recipient/ThirdPerson). Returns counterparty refs needed for waybill creation.',
    inputSchema: {
      type: 'object',
      properties: {
        counterpartyProperty: {
          type: 'string',
          description: 'Counterparty role: Sender, Recipient, or ThirdPerson.',
          enum: ['Sender', 'Recipient', 'ThirdPerson']
        },
        page: { type: 'number', description: 'Page number (default 1).' },
        findByString: { type: 'string', description: 'Search by name, phone, or EDRPOU.' },
        cityRef: { type: 'string', description: 'Filter by city reference.' }
      },
      required: ['counterpartyProperty']
    }
  },
  {
    name: 'counterparty_get_addresses',
    description: 'Get addresses for a specific counterparty. Returns address refs needed for waybill creation.',
    inputSchema: {
      type: 'object',
      properties: {
        ref: { type: 'string', description: 'Counterparty reference from getCounterparties.' },
        counterpartyProperty: {
          type: 'string',
          description: 'Counterparty role: Sender or Recipient.',
          enum: ['Sender', 'Recipient']
        },
        page: { type: 'number', description: 'Page number (default 1).' }
      },
      required: ['ref']
    }
  },
  {
    name: 'counterparty_get_contact_persons',
    description: 'Get contact persons for a counterparty. Returns contact person refs needed for waybill creation.',
    inputSchema: {
      type: 'object',
      properties: {
        ref: { type: 'string', description: 'Counterparty reference.' },
        page: { type: 'number', description: 'Page number (default 1).' }
      },
      required: ['ref']
    }
  },
  {
    name: 'counterparty_save',
    description: 'Create new counterparty (private person or organization). For private person: firstName and lastName required. For organization: ownershipForm and edrpou required.',
    inputSchema: {
      type: 'object',
      properties: {
        counterpartyType: {
          type: 'string',
          description: 'Type: PrivatePerson or Organization',
          enum: ['PrivatePerson', 'Organization']
        },
        counterpartyProperty: {
          type: 'string',
          description: 'Role: Sender or Recipient',
          enum: ['Sender', 'Recipient']
        },
        firstName: { type: 'string', description: 'First name (required for PrivatePerson, optional for Organization).' },
        middleName: { type: 'string', description: 'Middle name (optional).' },
        lastName: { type: 'string', description: 'Last name (required for PrivatePerson, optional for Organization).' },
        phone: { type: 'string', description: 'Phone number in format 380XXXXXXXXX (required).' },
        email: { type: 'string', description: 'Email address (optional).' },
        ownershipForm: { type: 'string', description: 'Ownership form reference (required for Organization).' },
        edrpou: { type: 'string', description: 'EDRPOU code (required for Organization).' }
      },
      required: ['counterpartyType', 'counterpartyProperty', 'phone']
    }
  },
  {
    name: 'counterparty_update',
    description: 'Update existing counterparty details.',
    inputSchema: {
      type: 'object',
      properties: {
        ref: { type: 'string', description: 'Counterparty reference to update.' },
        counterpartyProperty: {
          type: 'string',
          description: 'Counterparty role: Sender or Recipient',
          enum: ['Sender', 'Recipient']
        },
        firstName: { type: 'string', description: 'Updated first name.' },
        middleName: { type: 'string', description: 'Updated middle name.' },
        lastName: { type: 'string', description: 'Updated last name.' },
        phone: { type: 'string', description: 'Updated phone.' },
        email: { type: 'string', description: 'Updated email.' }
      },
      required: ['ref', 'counterpartyProperty']
    }
  },
  {
    name: 'counterparty_delete',
    description: 'Delete counterparty by reference. IMPORTANT: Only recipient counterparties can be deleted.',
    inputSchema: {
      type: 'object',
      properties: {
        ref: { type: 'string', description: 'Counterparty reference to delete.' }
      },
      required: ['ref']
    }
  },
  {
    name: 'counterparty_get_options',
    description: 'Get counterparty options and permissions.',
    inputSchema: {
      type: 'object',
      properties: {
        ref: { type: 'string', description: 'Counterparty reference.' }
      },
      required: ['ref']
    }
  },
];

export function getCounterpartyTools(): Tool[] {
  return counterpartyTools;
}

export async function handleCounterpartyTool(
  name: string,
  args: ToolArguments,
  context: ToolContext,
): Promise<CallToolResult> {
  try {
    switch (name) {
      case 'counterparty_get_counterparties':
        return await handleGetCounterparties(args, context);
      case 'counterparty_get_addresses':
        return await handleGetCounterpartyAddresses(args, context);
      case 'counterparty_get_contact_persons':
        return await handleGetContactPersons(args, context);
      case 'counterparty_save':
        return await handleSaveCounterparty(args, context);
      case 'counterparty_update':
        return await handleUpdateCounterparty(args, context);
      case 'counterparty_delete':
        return await handleDeleteCounterparty(args, context);
      case 'counterparty_get_options':
        return await handleGetCounterpartyOptions(args, context);
      default:
        throw new Error(`Unknown counterparty tool: ${name}`);
    }
  } catch (error) {
    return toErrorResult(error, `Counterparty tool "${name}"`);
  }
}

async function handleGetCounterparties(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const counterpartyProperty = assertString(args?.counterpartyProperty, 'counterpartyProperty') as 'Sender' | 'Recipient' | 'ThirdPerson';
  const page = assertOptionalNumber(args?.page, 'page');
  const findByString = assertOptionalString(args?.findByString, 'findByString');
  const cityRef = assertOptionalString(args?.cityRef, 'cityRef');

  const response = await context.client.counterparty.getCounterparties({
    counterpartyProperty,
    page,
    findByString,
    cityRef,
  });

  if (!response.success) {
    throw new Error(response.errors?.join(', ') || 'Failed to get counterparties');
  }

  const counterparties = response.data?.map(cp => ({
    ref: cp.Ref,
    description: cp.Description,
    city: cp.City,
    counterpartyType: cp.CounterpartyType,
    ownershipForm: cp.OwnershipForm,
    ownershipFormDescription: cp.OwnershipFormDescription,
    edrpou: cp.EDRPOU,
  })) ?? [];

  return createTextResult(
    formatAsJson({
      total: counterparties.length,
      counterparties
    })
  );
}

async function handleGetCounterpartyAddresses(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const ref = assertString(args?.ref, 'ref');
  const counterpartyProperty = assertOptionalString(args?.counterpartyProperty, 'counterpartyProperty') as 'Sender' | 'Recipient' | undefined;
  const page = assertOptionalNumber(args?.page, 'page');

  const response = await context.client.counterparty.getCounterpartyAddresses({
    ref,
    counterpartyProperty,
    page,
  });

  if (!response.success) {
    throw new Error(response.errors?.join(', ') || 'Failed to get counterparty addresses');
  }

  const addresses = response.data?.map(address => ({
    ref: address.Ref,
    description: address.Description,
    streetsType: address.StreetsType,
    streetsTypeDescription: address.StreetsTypeDescription,
  })) ?? [];

  return createTextResult(
    formatAsJson({
      total: addresses.length,
      addresses
    })
  );
}

async function handleGetContactPersons(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const ref = assertString(args?.ref, 'ref');
  const page = assertOptionalNumber(args?.page, 'page');

  const response = await context.client.counterparty.getCounterpartyContactPersons({
    ref,
    page,
  });

  if (!response.success) {
    throw new Error(response.errors?.join(', ') || 'Failed to get contact persons');
  }

  const contactPersons = response.data?.map(person => ({
    ref: person.Ref,
    description: person.Description,
    phones: person.Phones,
    email: person.Email,
    lastName: person.LastName,
    firstName: person.FirstName,
    middleName: person.MiddleName,
  })) ?? [];

  return createTextResult(
    formatAsJson({
      total: contactPersons.length,
      contactPersons
    })
  );
}

async function handleSaveCounterparty(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const counterpartyType = assertString(args?.counterpartyType, 'counterpartyType');
  const counterpartyProperty = assertString(args?.counterpartyProperty, 'counterpartyProperty') as 'Sender' | 'Recipient';
  const phone = assertString(args?.phone, 'phone');

  // Validate based on counterparty type
  if (counterpartyType === 'PrivatePerson') {
    const firstName = assertString(args?.firstName, 'firstName');
    const lastName = assertString(args?.lastName, 'lastName');

    const response = await context.client.counterparty.save({
      counterpartyType,
      counterpartyProperty,
      firstName,
      lastName,
      middleName: assertOptionalString(args?.middleName, 'middleName'),
      phone,
      email: assertOptionalString(args?.email, 'email'),
    });

    if (!response.success) {
      throw new Error(response.errors?.join(', ') || 'Failed to save counterparty');
    }

    return createTextResult(
      formatAsJson({
        success: response.success,
        ref: response.data?.[0]?.Ref,
        description: response.data?.[0]?.Description,
      })
    );
  } else if (counterpartyType === 'Organization') {
    const ownershipForm = assertString(args?.ownershipForm, 'ownershipForm');
    const edrpou = assertString(args?.edrpou, 'edrpou');

    const response = await context.client.counterparty.save({
      counterpartyType,
      counterpartyProperty,
      ownershipForm,
      edrpou,
      firstName: assertOptionalString(args?.firstName, 'firstName'),
      lastName: assertOptionalString(args?.lastName, 'lastName'),
      middleName: assertOptionalString(args?.middleName, 'middleName'),
      phone,
      email: assertOptionalString(args?.email, 'email'),
    });

    if (!response.success) {
      throw new Error(response.errors?.join(', ') || 'Failed to save counterparty');
    }

    return createTextResult(
      formatAsJson({
        success: response.success,
        ref: response.data?.[0]?.Ref,
        description: response.data?.[0]?.Description,
      })
    );
  } else {
    throw new Error(`Invalid counterpartyType: ${counterpartyType}. Must be PrivatePerson or Organization.`);
  }
}

async function handleUpdateCounterparty(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const ref = assertString(args?.ref, 'ref');
  const counterpartyProperty = assertString(args?.counterpartyProperty, 'counterpartyProperty') as 'Sender' | 'Recipient';

  const response = await context.client.counterparty.update({
    ref,
    counterpartyProperty,
    firstName: assertOptionalString(args?.firstName, 'firstName'),
    middleName: assertOptionalString(args?.middleName, 'middleName'),
    lastName: assertOptionalString(args?.lastName, 'lastName'),
    phone: assertOptionalString(args?.phone, 'phone'),
    email: assertOptionalString(args?.email, 'email'),
  });

  if (!response.success) {
    throw new Error(response.errors?.join(', ') || 'Failed to update counterparty');
  }

  return createTextResult(
    formatAsJson({
      success: response.success,
      ref: response.data?.[0]?.Ref,
      description: response.data?.[0]?.Description,
    })
  );
}

async function handleDeleteCounterparty(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const ref = assertString(args?.ref, 'ref');

  const response = await context.client.counterparty.delete({
    ref,
  });

  if (!response.success) {
    throw new Error(response.errors?.join(', ') || 'Failed to delete counterparty');
  }

  return createTextResult(
    formatAsJson({
      success: response.success,
      message: 'Counterparty deleted successfully',
    })
  );
}

async function handleGetCounterpartyOptions(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const ref = assertString(args?.ref, 'ref');

  const response = await context.client.counterparty.getCounterpartyOptions({
    ref,
  });

  if (!response.success) {
    throw new Error(response.errors?.join(', ') || 'Failed to get counterparty options');
  }

  return createTextResult(
    formatAsJson({
      success: response.success,
      data: response.data?.[0],
    })
  );
}
