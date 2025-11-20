import type { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';

import type { ToolArguments, ToolContext } from '../types/mcp.js';
import { toErrorResult } from '../utils/error-handler.js';
import { assertOptionalString, assertString } from '../utils/validation.js';
import { createTextResult, formatAsJson } from '../utils/tool-response.js';

const contactPersonTools: Tool[] = [
  {
    name: 'contact_person_save',
    description: 'Create new contact person for a counterparty. Returns contact person ref for waybill creation.',
    inputSchema: {
      type: 'object',
      properties: {
        counterpartyRef: { type: 'string', description: 'Counterparty reference from getCounterparties.' },
        firstName: { type: 'string', description: 'First name (required).' },
        middleName: { type: 'string', description: 'Middle name (optional).' },
        lastName: { type: 'string', description: 'Last name (required).' },
        phone: { type: 'string', description: 'Phone number 380XXXXXXXXX (required).' },
        email: { type: 'string', description: 'Email address (optional).' }
      },
      required: ['counterpartyRef', 'firstName', 'lastName', 'phone']
    }
  },
  {
    name: 'contact_person_update',
    description: 'Update existing contact person details.',
    inputSchema: {
      type: 'object',
      properties: {
        ref: { type: 'string', description: 'Contact person reference to update.' },
        counterpartyRef: { type: 'string', description: 'Counterparty reference.' },
        firstName: { type: 'string', description: 'Updated first name.' },
        middleName: { type: 'string', description: 'Updated middle name.' },
        lastName: { type: 'string', description: 'Updated last name.' },
        phone: { type: 'string', description: 'Updated phone.' },
        email: { type: 'string', description: 'Updated email.' }
      },
      required: ['ref', 'counterpartyRef']
    }
  },
  {
    name: 'contact_person_delete',
    description: 'Delete contact person by reference.',
    inputSchema: {
      type: 'object',
      properties: {
        ref: { type: 'string', description: 'Contact person reference to delete.' },
        counterpartyRef: { type: 'string', description: 'Counterparty reference.' }
      },
      required: ['ref', 'counterpartyRef']
    }
  },
];

export function getContactPersonTools(): Tool[] {
  return contactPersonTools;
}

export async function handleContactPersonTool(
  name: string,
  args: ToolArguments,
  context: ToolContext,
): Promise<CallToolResult> {
  try {
    switch (name) {
      case 'contact_person_save':
        return await handleSaveContactPerson(args, context);
      case 'contact_person_update':
        return await handleUpdateContactPerson(args, context);
      case 'contact_person_delete':
        return await handleDeleteContactPerson(args, context);
      default:
        throw new Error(`Unknown contact person tool: ${name}`);
    }
  } catch (error) {
    return toErrorResult(error, `Contact person tool "${name}"`);
  }
}

async function handleSaveContactPerson(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const counterpartyRef = assertString(args?.counterpartyRef, 'counterpartyRef');
  const firstName = assertString(args?.firstName, 'firstName');
  const lastName = assertString(args?.lastName, 'lastName');
  const phone = assertString(args?.phone, 'phone');
  const middleName = assertOptionalString(args?.middleName, 'middleName');
  const email = assertOptionalString(args?.email, 'email');

  const response = await context.client.contactPerson.save({
    counterpartyRef,
    firstName,
    lastName,
    phone,
    middleName,
    email,
  });

  if (!response.success) {
    throw new Error(response.errors?.join(', ') || 'Failed to save contact person');
  }

  return createTextResult(
    formatAsJson({
      success: response.success,
      ref: response.data?.[0]?.Ref,
      description: response.data?.[0]?.Description,
    })
  );
}

async function handleUpdateContactPerson(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const ref = assertString(args?.ref, 'ref');
  const counterpartyRef = assertString(args?.counterpartyRef, 'counterpartyRef');

  const response = await context.client.contactPerson.update({
    ref,
    counterpartyRef,
    firstName: assertOptionalString(args?.firstName, 'firstName'),
    middleName: assertOptionalString(args?.middleName, 'middleName'),
    lastName: assertOptionalString(args?.lastName, 'lastName'),
    phone: assertOptionalString(args?.phone, 'phone'),
    email: assertOptionalString(args?.email, 'email'),
  });

  if (!response.success) {
    throw new Error(response.errors?.join(', ') || 'Failed to update contact person');
  }

  return createTextResult(
    formatAsJson({
      success: response.success,
      ref: response.data?.[0]?.Ref,
      description: response.data?.[0]?.Description,
    })
  );
}

async function handleDeleteContactPerson(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const ref = assertString(args?.ref, 'ref');
  const counterpartyRef = assertString(args?.counterpartyRef, 'counterpartyRef');

  const response = await context.client.contactPerson.delete({
    ref,
    counterpartyRef,
  });

  if (!response.success) {
    throw new Error(response.errors?.join(', ') || 'Failed to delete contact person');
  }

  return createTextResult(
    formatAsJson({
      success: response.success,
      message: 'Contact person deleted successfully',
    })
  );
}
