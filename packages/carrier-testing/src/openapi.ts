// code and comments in English
import type { HttpMethod } from '@shopana/carrier-core';
import type { ApiContract, BodyKind, JsonSchema, OperationContract } from './contract';
import { defineContract } from './contract';

/** Minimal OpenAPI 3.0/3.1 (or Swagger 2.0) document shape needed to build a contract. */
export interface OpenApiDocument {
  openapi?: string;
  /** `2.0` for Swagger documents; they are converted to the OpenAPI 3 layout first. */
  swagger?: string;
  host?: string;
  basePath?: string;
  schemes?: string[];
  consumes?: string[];
  produces?: string[];
  /** Swagger 2.0 shared schemas (`#/definitions/<Name>`). */
  definitions?: Record<string, JsonSchema>;
  /** Swagger 2.0 shared parameters (`#/parameters/<Name>`). */
  parameters?: Record<string, OpenApiParameter>;
  info?: { title?: string; version?: string };
  servers?: Array<{ url: string }>;
  paths: Record<string, Record<string, unknown>>;
  components?: {
    schemas?: Record<string, JsonSchema>;
    parameters?: Record<string, OpenApiParameter>;
    requestBodies?: Record<string, OpenApiRequestBody>;
    responses?: Record<string, OpenApiResponse>;
  };
}

interface OpenApiParameter {
  $ref?: string;
  name: string;
  /** `body` and `formData` exist only in Swagger 2.0. */
  in: 'path' | 'query' | 'header' | 'cookie' | 'body' | 'formData';
  required?: boolean;
  schema?: JsonSchema;
  /** Swagger 2.0 keeps the type on the parameter itself. */
  type?: string;
}

interface OpenApiMediaType {
  schema?: JsonSchema;
}

interface OpenApiRequestBody {
  $ref?: string;
  required?: boolean;
  content?: Record<string, OpenApiMediaType>;
}

interface OpenApiResponse {
  $ref?: string;
  content?: Record<string, OpenApiMediaType>;
  /** Swagger 2.0 response schema. */
  schema?: JsonSchema;
}

const METHODS: HttpMethod[] = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

export interface FromOpenApiOptions {
  name?: string;
  baseUrl?: string;
  /** Extra per-operation flags keyed by operation id. */
  meta?: Record<string, Record<string, unknown>>;
}

/**
 * Builds a simulator contract from an OpenAPI document (a Swagger snapshot or a hand-written YAML
 * parsed to JSON). Operations without `operationId` get `"<METHOD> <path>"` as id.
 */
export function contractFromOpenApi(source: OpenApiDocument, options: FromOpenApiOptions = {}): ApiContract {
  const doc = normalizeSchemas(
    source.swagger?.startsWith('2.') ? swagger2ToOpenApi3(source) : source,
  ) as OpenApiDocument;
  const operations: OperationContract[] = [];

  for (const [path, item] of Object.entries(doc.paths ?? {})) {
    const shared = (item.parameters as OpenApiParameter[] | undefined) ?? [];
    for (const method of METHODS) {
      const op = item[method.toLowerCase()] as
        | {
            operationId?: string;
            parameters?: OpenApiParameter[];
            requestBody?: OpenApiRequestBody;
            responses?: Record<string, OpenApiResponse>;
          }
        | undefined;
      if (!op) continue;
      const id = op.operationId ?? `${method} ${path}`;
      const parameters = mergeParameters(
        shared.map(p => deref(doc, p)),
        (op.parameters ?? []).map(p => deref(doc, p)),
      );

      const operation: OperationContract = { id, method, path, params: buildParams(parameters) };
      if (op.requestBody) operation.requestBody = buildRequestBody(deref(doc, op.requestBody));
      if (op.responses) operation.responses = buildResponses(doc, op.responses);
      const meta = options.meta?.[id];
      if (meta) operation.meta = meta;
      operations.push(operation);
    }
  }

  return defineContract({
    name: options.name ?? doc.info?.title ?? 'openapi',
    baseUrl: options.baseUrl ?? doc.servers?.[0]?.url,
    operations,
    components: { schemas: doc.components?.schemas ?? {} },
  });
}

const SWAGGER2_SCHEMA_KEYS = [
  'type',
  'format',
  'items',
  'enum',
  'default',
  'minimum',
  'maximum',
  'exclusiveMinimum',
  'exclusiveMaximum',
  'minLength',
  'maxLength',
  'pattern',
  'minItems',
  'maxItems',
  'uniqueItems',
  'multipleOf',
  'x-nullable',
];

/**
 * Converts a Swagger 2.0 document (e.g. a springfox `/v2/api-docs` snapshot) to the OpenAPI 3 layout:
 * `in: body`/`formData` parameters become `requestBody`, response `schema` moves under `content`,
 * `#/definitions` becomes `#/components/schemas`, and `host` + `basePath` become the server URL.
 */
export function swagger2ToOpenApi3(doc: OpenApiDocument): OpenApiDocument {
  const rewritten = rewriteDefinitionRefs(doc) as OpenApiDocument;
  const consumes = rewritten.consumes?.[0] ?? 'application/json';
  const produces = rewritten.produces?.[0] ?? 'application/json';
  const paths: OpenApiDocument['paths'] = {};

  for (const [path, rawItem] of Object.entries(rewritten.paths ?? {})) {
    const item: Record<string, unknown> = {};
    const sharedParams = ((rawItem.parameters as OpenApiParameter[] | undefined) ?? []).map(p => deref(rewritten, p));
    for (const [key, value] of Object.entries(rawItem)) {
      if (key === 'parameters') continue;
      if (!METHODS.includes(key.toUpperCase() as HttpMethod)) {
        item[key] = value;
        continue;
      }
      const op = value as {
        parameters?: OpenApiParameter[];
        consumes?: string[];
        produces?: string[];
        responses?: Record<string, OpenApiResponse>;
      } & Record<string, unknown>;
      const params = mergeParameters(
        sharedParams,
        (op.parameters ?? []).map(p => deref(rewritten, p)),
      );
      const opConsumes = op.consumes?.[0] ?? consumes;
      const opProduces = op.produces?.[0] ?? produces;

      const body = params.find(p => p.in === 'body');
      const formData = params.filter(p => p.in === 'formData');
      const converted: Record<string, unknown> = {
        ...op,
        parameters: params.filter(p => p.in !== 'body' && p.in !== 'formData').map(toOas3Parameter),
      };
      delete converted.consumes;
      delete converted.produces;
      if (body) {
        converted.requestBody = {
          required: body.required ?? false,
          content: { [opConsumes]: { ...(body.schema !== undefined ? { schema: body.schema } : {}) } },
        };
      } else if (formData.length) {
        const properties = Object.fromEntries(formData.map(p => [p.name, pickSchema(p)]));
        const required = formData.filter(p => p.required).map(p => p.name);
        const formType = /multipart/i.test(opConsumes) ? opConsumes : 'application/x-www-form-urlencoded';
        converted.requestBody = {
          required: required.length > 0,
          content: { [formType]: { schema: { type: 'object', properties, ...(required.length ? { required } : {}) } } },
        };
      }
      if (op.responses) {
        converted.responses = Object.fromEntries(
          Object.entries(op.responses).map(([status, raw]) => {
            const response = deref(rewritten, raw);
            return [
              status,
              response.schema !== undefined ? { content: { [opProduces]: { schema: response.schema } } } : {},
            ];
          }),
        );
      }
      item[key] = converted;
    }
    paths[path] = item;
  }

  const scheme = rewritten.schemes?.[0] ?? 'https';
  return {
    openapi: '3.0.0',
    ...(rewritten.info ? { info: rewritten.info } : {}),
    ...(rewritten.host ? { servers: [{ url: `${scheme}://${rewritten.host}${rewritten.basePath ?? ''}` }] } : {}),
    paths,
    components: { schemas: rewritten.definitions ?? {} },
  };
}

// Keys whose values are instance data, not schemas: never rewrite inside them.
const DATA_KEYS = new Set(['example', 'examples', 'enum', 'default', 'const', 'x-example']);
// Keys whose values map arbitrary names to schemas (a property may be called `default` or `enum`)
// or to response objects (`responses.default`).
const SCHEMA_MAP_KEYS = new Set(['properties', 'patternProperties', 'definitions', '$defs', 'schemas', 'responses']);

/**
 * Brings legacy schema keywords to the form Ajv (draft-07) understands:
 * draft-04 boolean `exclusiveMinimum`/`exclusiveMaximum` become numeric bounds, Swagger 2.0
 * `x-nullable` becomes `nullable`, and OpenAPI 3.0 `nullable: true` becomes an explicit `null`
 * alternative (Ajv rejects `nullable` without `type`, e.g. next to `$ref` or `allOf`, and does not
 * add `null` to an `enum`). Example, enum and default values are left untouched.
 */
export function normalizeSchemas(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(normalizeSchemas);
  if (node === null || typeof node !== 'object') return node;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node)) {
    if (DATA_KEYS.has(key)) result[key] = value;
    else if (SCHEMA_MAP_KEYS.has(key) && isPlainObject(value)) result[key] = normalizeSchemaMap(value);
    else result[key] = normalizeSchemas(value);
  }
  normalizeBound(result, 'exclusiveMinimum', 'minimum');
  normalizeBound(result, 'exclusiveMaximum', 'maximum');
  if (typeof result['x-nullable'] === 'boolean') {
    if (result.nullable === undefined) result.nullable = result['x-nullable'];
    delete result['x-nullable'];
  }
  return normalizeNullable(result);
}

function normalizeSchemaMap(map: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(map).map(([name, schema]) => [name, normalizeSchemas(schema)]));
}

function normalizeNullable(schema: Record<string, unknown>): Record<string, unknown> {
  if (typeof schema.nullable !== 'boolean') return schema;
  const { nullable, ...rest } = schema;
  if (!nullable) return rest;
  // With a `type`, Ajv's own `nullable` support works; only `enum` needs `null` listed.
  if (rest.type !== undefined) {
    const values: unknown = rest.enum;
    if (Array.isArray(values) && !values.includes(null)) return { ...schema, enum: [...(values as unknown[]), null] };
    return schema;
  }
  return { anyOf: [rest, { type: 'null' }] };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalizeBound(
  schema: Record<string, unknown>,
  exclusive: 'exclusiveMinimum' | 'exclusiveMaximum',
  inclusive: 'minimum' | 'maximum',
): void {
  if (typeof schema[exclusive] !== 'boolean') return;
  if (schema[exclusive] === true && typeof schema[inclusive] === 'number') {
    schema[exclusive] = schema[inclusive];
    delete schema[inclusive];
  } else {
    delete schema[exclusive];
  }
}

function toOas3Parameter(parameter: OpenApiParameter): OpenApiParameter {
  if (parameter.schema !== undefined) return parameter;
  const { name, in: location, required } = parameter;
  return { name, in: location, ...(required !== undefined ? { required } : {}), schema: pickSchema(parameter) };
}

function pickSchema(parameter: OpenApiParameter): JsonSchema {
  if (parameter.schema !== undefined) return parameter.schema;
  const source = parameter as unknown as Record<string, unknown>;
  const schema: Record<string, unknown> = {};
  for (const key of SWAGGER2_SCHEMA_KEYS) if (source[key] !== undefined) schema[key] = source[key];
  // Swagger 2.0 `type: file` has no JSON Schema equivalent.
  if (schema.type === 'file') delete schema.type;
  return schema;
}

function rewriteDefinitionRefs(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(rewriteDefinitionRefs);
  if (node === null || typeof node !== 'object') return node;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node)) {
    result[key] =
      key === '$ref' && typeof value === 'string' && value.startsWith('#/definitions/')
        ? `#/components/schemas/${value.slice('#/definitions/'.length)}`
        : rewriteDefinitionRefs(value);
  }
  return result;
}

function deref<T extends { $ref?: string }>(doc: OpenApiDocument, value: T): T {
  let current: T = value;
  const seen = new Set<string>();
  while (current?.$ref) {
    if (seen.has(current.$ref)) throw new TypeError(`Circular $ref ${current.$ref}`);
    seen.add(current.$ref);
    current = resolvePointer(doc, current.$ref) as T;
  }
  return current;
}

function resolvePointer(doc: unknown, ref: string): unknown {
  if (!ref.startsWith('#/')) throw new TypeError(`Only local $ref is supported: ${ref}`);
  let node: unknown = doc;
  for (const raw of ref.slice(2).split('/')) {
    const key = raw.replace(/~1/g, '/').replace(/~0/g, '~');
    node = (node as Record<string, unknown> | undefined)?.[key];
    if (node === undefined) throw new TypeError(`Unresolvable $ref ${ref}`);
  }
  return node;
}

function mergeParameters(shared: OpenApiParameter[], own: OpenApiParameter[]): OpenApiParameter[] {
  const byKey = new Map<string, OpenApiParameter>();
  for (const p of [...shared, ...own]) byKey.set(`${p.in}:${p.name}`, p);
  return [...byKey.values()];
}

function buildParams(parameters: OpenApiParameter[]): OperationContract['params'] {
  const group = (location: OpenApiParameter['in'], lower = false): JsonSchema | undefined => {
    const list = parameters.filter(p => p.in === location);
    if (list.length === 0) return undefined;
    const properties: Record<string, JsonSchema> = {};
    const required: string[] = [];
    for (const p of list) {
      const name = lower ? p.name.toLowerCase() : p.name;
      properties[name] = p.schema ?? {};
      if (p.required || location === 'path') required.push(name);
    }
    return { type: 'object', properties, ...(required.length ? { required } : {}) };
  };
  const params: NonNullable<OperationContract['params']> = {};
  const path = group('path');
  const query = group('query');
  const headers = group('header', true);
  if (path !== undefined) params.path = path;
  if (query !== undefined) params.query = query;
  if (headers !== undefined) params.headers = headers;
  return params;
}

function buildRequestBody(body: OpenApiRequestBody): OperationContract['requestBody'] {
  const [contentType, media] = pickContent(body.content);
  return {
    kind: bodyKind(contentType),
    ...(media?.schema !== undefined ? { schema: media.schema } : {}),
    required: body.required ?? false,
  };
}

function buildResponses(
  doc: OpenApiDocument,
  responses: Record<string, OpenApiResponse>,
): OperationContract['responses'] {
  const result: NonNullable<OperationContract['responses']> = {};
  for (const [status, raw] of Object.entries(responses)) {
    const response = deref(doc, raw);
    const [contentType, media] = pickContent(response.content);
    result[status] = {
      ...(contentType ? { contentType } : {}),
      ...(media?.schema !== undefined ? { schema: media.schema } : {}),
    };
  }
  return result;
}

function pickContent(
  content: Record<string, OpenApiMediaType> | undefined,
): [string | undefined, OpenApiMediaType | undefined] {
  if (!content) return [undefined, undefined];
  const types = Object.keys(content);
  const preferred = types.find(t => /json/i.test(t)) ?? types[0];
  return preferred ? [preferred, content[preferred]] : [undefined, undefined];
}

function bodyKind(contentType: string | undefined): BodyKind {
  if (!contentType || /json/i.test(contentType)) return 'json';
  if (/x-www-form-urlencoded/i.test(contentType)) return 'form';
  if (/^text\/|xml/i.test(contentType)) return 'text';
  return 'binary';
}
