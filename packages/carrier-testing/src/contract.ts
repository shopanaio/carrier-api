// code and comments in English
import type { HttpMethod } from '@shopana/carrier-core';

/** JSON Schema (draft-07 / OpenAPI 3.0 subset, as accepted by Ajv). */
export type JsonSchema = Record<string, unknown> | boolean;

export type BodyKind = 'json' | 'form' | 'text' | 'binary';

export interface OperationContract {
  /** Stable id used to register handlers and inject faults (OpenAPI `operationId`). */
  id: string;
  method: HttpMethod;
  /** Path template relative to the API base URL, e.g. `/shipments/{uuid}`. */
  path: string;
  /** Object schemas for path, query and header parameters. Values arrive as strings and are coerced. */
  params?: {
    path?: JsonSchema;
    query?: JsonSchema;
    /** Property names must be lower-case. */
    headers?: JsonSchema;
  };
  requestBody?: {
    kind: BodyKind;
    schema?: JsonSchema;
    required?: boolean;
  };
  /** Response schemas by status (`200`, `4XX`, `default`). */
  responses?: Record<string, { schema?: JsonSchema; contentType?: string }>;
  /** Free-form flags for carrier simulators (e.g. `{ counterpartyToken: true }`). */
  meta?: Record<string, unknown>;
}

export interface ApiContract {
  name: string;
  /** Default base URL for the simulator (OpenAPI `servers[0].url`). */
  baseUrl?: string;
  operations: OperationContract[];
  /** Shared definitions referenced as `#/components/schemas/<Name>` (OpenAPI layout). */
  components?: { schemas?: Record<string, JsonSchema> };
}

/** Validates a hand-written contract (unique ids, unique method+path) and returns it. */
export function defineContract(contract: ApiContract): ApiContract {
  const ids = new Set<string>();
  const routes = new Set<string>();
  for (const operation of contract.operations) {
    if (ids.has(operation.id))
      throw new TypeError(`Duplicate operation id "${operation.id}" in contract ${contract.name}`);
    ids.add(operation.id);
    const route = `${operation.method} ${normalizeTemplate(operation.path)}`;
    if (routes.has(route))
      throw new TypeError(`Duplicate route ${operation.method} ${operation.path} in contract ${contract.name}`);
    routes.add(route);
  }
  return contract;
}

function normalizeTemplate(path: string): string {
  return path.replace(/\{[^}]+\}/g, '{}');
}
