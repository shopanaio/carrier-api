import type { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';

import type { ToolArguments, ToolContext } from '../types/mcp.js';

import { getAddressTools, handleAddressTool } from './address.js';
import { getReferenceTools, handleReferenceTool } from './reference.js';
import { getTrackingTools, handleTrackingTool } from './tracking.js';
import { getWaybillTools, handleWaybillTool } from './waybill.js';
import { getCounterpartyTools, handleCounterpartyTool } from './counterparty.js';
import { getContactPersonTools, handleContactPersonTool } from './contactPerson.js';

export function listAllTools(): Tool[] {
  return [
    ...getTrackingTools(),
    ...getAddressTools(),
    ...getWaybillTools(),
    ...getReferenceTools(),
    ...getCounterpartyTools(),
    ...getContactPersonTools(),
  ];
}

export async function dispatchTool(name: string, args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  if (name.startsWith('track_') || name.startsWith('get_document')) {
    return handleTrackingTool(name, args, context);
  }
  if (name.startsWith('address_')) {
    return handleAddressTool(name, args, context);
  }
  if (name.startsWith('waybill_')) {
    return handleWaybillTool(name, args, context);
  }
  if (name.startsWith('reference_')) {
    return handleReferenceTool(name, args, context);
  }
  if (name.startsWith('counterparty_')) {
    return handleCounterpartyTool(name, args, context);
  }
  if (name.startsWith('contact_person_')) {
    return handleContactPersonTool(name, args, context);
  }

  throw new Error(`Unknown tool ${name}`);
}
