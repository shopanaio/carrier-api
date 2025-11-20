import type { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';

import type { ToolArguments, ToolContext } from '../types/mcp.js';
import { toErrorResult } from '../utils/error-handler.js';
import { assertOptionalNumber, assertOptionalString, assertString } from '../utils/validation.js';
import { createTextResult, formatAsJson } from '../utils/tool-response.js';

const addressTools: Tool[] = [
  {
    name: 'address_search_cities',
    description: 'Find Nova Poshta cities by name or postal index. IMPORTANT: Always use limit parameter (recommended: 10) to avoid large responses.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Partial city name or postal code.' },
        page: { type: 'number', description: 'Page number (default 1).' },
        limit: { type: 'number', description: 'Items per page (max 50). Recommended: 10 to avoid large responses.' },
      },
      required: ['query'],
    },
  },
  {
    name: 'address_search_settlements',
    description: 'Search for settlements (city, town, village) with pagination. IMPORTANT: Always use limit parameter (recommended: 10) to avoid large responses.',
    inputSchema: {
      type: 'object',
      properties: {
        cityName: { type: 'string', description: 'Settlement name or postal code.' },
        page: { type: 'number', description: 'Page number (default 1).' },
        limit: { type: 'number', description: 'Items per page (1-500). Recommended: 10 to avoid large responses.' },
      },
      required: ['cityName'],
    },
  },
  {
    name: 'address_search_streets',
    description: 'Search for streets inside a settlement. IMPORTANT: Always use limit parameter (recommended: 10) to avoid large responses.',
    inputSchema: {
      type: 'object',
      properties: {
        settlementRef: { type: 'string', description: 'Settlement reference ID.' },
        streetName: { type: 'string', description: 'Street name or fragment.' },
        limit: { type: 'number', description: 'Max items to return. Recommended: 10 to avoid large responses.' },
      },
      required: ['settlementRef', 'streetName'],
    },
  },
  {
    name: 'address_get_warehouses',
    description:
      'List Nova Poshta warehouses (branches, postomats, pickup points) filtered by city, settlement, type, number, or search string. IMPORTANT: Always use limit parameter (recommended: 10-20) to avoid large responses.',
    inputSchema: {
      type: 'object',
      properties: {
        ref: { type: 'string', description: 'Specific warehouse reference (returns single warehouse).' },
        cityName: { type: 'string', description: 'City name filter.' },
        cityRef: { type: 'string', description: 'City reference from getCities.' },
        settlementRef: { type: 'string', description: 'Settlement reference from searchSettlements.' },
        warehouseId: { type: 'string', description: 'Warehouse number (e.g., "1" for Branch #1).' },
        findByString: { type: 'string', description: 'Search string for warehouse name, address, or street.' },
        typeOfWarehouseRef: { type: 'string', description: 'Filter by warehouse type (Branch, Postomat, Pickup Point).' },
        bicycleParking: { type: 'string', description: 'Filter by bicycle parking availability (1/0).' },
        postFinance: { type: 'string', description: 'Filter by NovaPay cash desk availability (1/0).' },
        posTerminal: { type: 'string', description: 'Filter by POS terminal availability (1/0).' },
        page: { type: 'number', description: 'Page number (default 1).' },
        limit: { type: 'number', description: 'Items per page (default 50). Recommended: 10-20 to avoid large responses.' },
        language: { type: 'string', description: 'Language code (UA, RU, EN).' },
      },
      required: [],
    },
  },
  {
    name: 'address_save',
    description: 'Create new address for a counterparty. Returns address ref needed for door-to-door delivery.',
    inputSchema: {
      type: 'object',
      properties: {
        counterpartyRef: { type: 'string', description: 'Counterparty reference.' },
        streetRef: { type: 'string', description: 'Street reference from address_search_streets.' },
        buildingNumber: { type: 'string', description: 'Building number (required).' },
        flat: { type: 'string', description: 'Apartment number (optional).' },
        note: { type: 'string', description: 'Additional note (optional).' }
      },
      required: ['counterpartyRef', 'streetRef', 'buildingNumber']
    }
  },
  {
    name: 'address_update',
    description: 'Update existing counterparty address.',
    inputSchema: {
      type: 'object',
      properties: {
        ref: { type: 'string', description: 'Address reference to update.' },
        counterpartyRef: { type: 'string', description: 'Counterparty reference.' },
        streetRef: { type: 'string', description: 'Updated street reference.' },
        buildingNumber: { type: 'string', description: 'Updated building number.' },
        flat: { type: 'string', description: 'Updated apartment number.' },
        note: { type: 'string', description: 'Updated note.' }
      },
      required: ['ref', 'counterpartyRef']
    }
  },
  {
    name: 'address_delete',
    description: 'Delete counterparty address by reference.',
    inputSchema: {
      type: 'object',
      properties: {
        ref: { type: 'string', description: 'Address reference to delete.' }
      },
      required: ['ref']
    }
  },
];

export function getAddressTools(): Tool[] {
  return addressTools;
}

export async function handleAddressTool(
  name: string,
  args: ToolArguments,
  context: ToolContext,
): Promise<CallToolResult> {
  try {
    switch (name) {
      case 'address_search_cities':
        return await handleSearchCities(args, context);
      case 'address_search_settlements':
        return await handleSearchSettlements(args, context);
      case 'address_search_streets':
        return await handleSearchStreets(args, context);
      case 'address_get_warehouses':
        return await handleGetWarehouses(args, context);
      case 'address_save':
        return await handleSaveAddress(args, context);
      case 'address_update':
        return await handleUpdateAddress(args, context);
      case 'address_delete':
        return await handleDeleteAddress(args, context);
      default:
        throw new Error(`Unknown address tool: ${name}`);
    }
  } catch (error) {
    return toErrorResult(error, `Address tool "${name}"`);
  }
}

async function handleSearchCities(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const query = assertString(args?.query, 'query');
  const page = assertOptionalNumber(args?.page, 'page') ?? 1;
  const limit = assertOptionalNumber(args?.limit, 'limit') ?? 10;

  const response = await context.client.address.getCities({
    findByString: query,
    page,
    limit,
  });

  const cities = response.data?.map(city => {
    const warehouses = (city as unknown as { Warehouses?: number }).Warehouses ?? 0;
    return {
      description: city.Description,
      ref: city.Ref,
      area: city.Area,
      warehouses: Number(warehouses),
    };
  }) ?? [];

  return createTextResult(formatAsJson({ total: cities.length, cities }));
}

async function handleSearchSettlements(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const cityName = assertString(args?.cityName, 'cityName');
  const page = assertOptionalNumber(args?.page, 'page') ?? 1;
  const limit = assertOptionalNumber(args?.limit, 'limit') ?? 10;

  const response = await context.client.address.searchSettlements({
    cityName,
    page,
    limit,
  });

  const addresses = response.data?.[0]?.Addresses ?? [];
  const settlements = addresses.map(address => ({
    name: address.MainDescription,
    area: address.Area,
    region: address.Region,
    warehouses: address.Warehouses,
    settlementRef: address.Ref,
    deliveryCity: address.DeliveryCity,
  }));

  return createTextResult(formatAsJson({ total: settlements.length, settlements }));
}

async function handleSearchStreets(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const settlementRef = assertString(args?.settlementRef, 'settlementRef');
  const streetName = assertString(args?.streetName, 'streetName');
  const limit = assertOptionalNumber(args?.limit, 'limit') ?? 10;

  const response = await context.client.address.searchSettlementStreets({
    settlementRef,
    streetName,
    limit,
  });

  const addresses = response.data?.[0]?.Addresses ?? [];
  const streets = addresses.map(street => ({
    name: street.SettlementStreetDescription,
    ref: street.SettlementStreetRef,
    present: street.Present,
    location: street.Location,
    streetsType: street.StreetsType,
    streetsTypeDescription: street.StreetsTypeDescription,
  }));

  return createTextResult(formatAsJson({ total: streets.length, streets }));
}

async function handleGetWarehouses(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const ref = assertOptionalString(args?.ref, 'ref');
  const cityName = assertOptionalString(args?.cityName, 'cityName');
  const cityRef = assertOptionalString(args?.cityRef, 'cityRef');
  const settlementRef = assertOptionalString(args?.settlementRef, 'settlementRef');
  const warehouseId = assertOptionalString(args?.warehouseId, 'warehouseId');
  const findByString = assertOptionalString(args?.findByString, 'findByString');
  const typeOfWarehouseRef = assertOptionalString(args?.typeOfWarehouseRef, 'typeOfWarehouseRef');
  const bicycleParking = assertOptionalString(args?.bicycleParking, 'bicycleParking');
  const postFinance = assertOptionalString(args?.postFinance, 'postFinance');
  const posTerminal = assertOptionalString(args?.posTerminal, 'posTerminal');
  const language = assertOptionalString(args?.language, 'language');
  const page = assertOptionalNumber(args?.page, 'page') ?? 1;
  const limit = assertOptionalNumber(args?.limit, 'limit') ?? 10;

  // Allow search by ref without cityRef/settlementRef
  if (!ref && !cityRef && !settlementRef) {
    throw new Error('ref, cityRef, or settlementRef is required to list warehouses');
  }

  const response = await context.client.address.getWarehouses({
    ref,
    cityName,
    cityRef,
    settlementRef,
    warehouseId,
    findByString,
    typeOfWarehouseRef,
    bicycleParking,
    postFinance,
    posTerminal,
    language,
    page,
    limit,
  });

  if (!response.success) {
    const message = response.errors?.join(', ') || 'Nova Poshta API returned an error';
    throw new Error(message);
  }

  const data = response.data ?? [];

  return createTextResult(formatAsJson({ total: data.length, warehouses: data }));
}

async function handleSaveAddress(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const counterpartyRef = assertString(args?.counterpartyRef, 'counterpartyRef');
  const streetRef = assertString(args?.streetRef, 'streetRef');
  const buildingNumber = assertString(args?.buildingNumber, 'buildingNumber');
  const flat = assertOptionalString(args?.flat, 'flat');
  const note = assertOptionalString(args?.note, 'note');

  const response = await context.client.address.save({
    counterpartyRef,
    streetRef,
    buildingNumber,
    flat,
    note,
  });

  if (!response.success) {
    throw new Error(response.errors?.join(', ') || 'Failed to save address');
  }

  return createTextResult(
    formatAsJson({
      success: response.success,
      ref: response.data?.[0]?.Ref,
      description: response.data?.[0]?.Description,
    })
  );
}

async function handleUpdateAddress(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const ref = assertString(args?.ref, 'ref');
  const counterpartyRef = assertString(args?.counterpartyRef, 'counterpartyRef');

  const streetRef = assertString(args?.streetRef, 'streetRef');
  const buildingNumber = assertString(args?.buildingNumber, 'buildingNumber');
  const flat = assertOptionalString(args?.flat, 'flat');
  const note = assertOptionalString(args?.note, 'note');

  const response = await context.client.address.update({
    ref,
    counterpartyRef,
    streetRef,
    buildingNumber,
    flat,
    note,
  });

  if (!response.success) {
    throw new Error(response.errors?.join(', ') || 'Failed to update address');
  }

  return createTextResult(
    formatAsJson({
      success: response.success,
      ref: response.data?.[0]?.Ref,
      description: response.data?.[0]?.Description,
    })
  );
}

async function handleDeleteAddress(args: ToolArguments, context: ToolContext): Promise<CallToolResult> {
  const ref = assertString(args?.ref, 'ref');

  const response = await context.client.address.delete({
    ref,
  });

  if (!response.success) {
    throw new Error(response.errors?.join(', ') || 'Failed to delete address');
  }

  return createTextResult(
    formatAsJson({
      success: response.success,
      message: 'Address deleted successfully',
    })
  );
}
