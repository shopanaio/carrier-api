// code and comments in English
import Ajv from 'ajv';
import type { ErrorObject, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import type { ApiContract, JsonSchema } from './contract';
import { normalizeSchemas } from './openapi';

export interface ValidationIssue {
  /** Where the problem is: `body`, `query`, `path`, `headers`, `response`. */
  location: string;
  /** JSON pointer inside that location, e.g. `/sender/phone`. */
  pointer: string;
  /** Offending field name when known (missing or extra property, or last pointer segment). */
  field?: string;
  message: string;
}

/** Compiles and caches validators for one contract. `$ref: '#/components/...'` resolves against the contract. */
export class ContractValidator {
  private readonly strictAjv: Ajv;
  private readonly coercingAjv: Ajv;
  private readonly cache = new Map<string, ValidateFunction>();
  private readonly baseId: string;

  constructor(contract: ApiContract) {
    const options = { allErrors: true, strict: false, validateFormats: true } as const;
    this.strictAjv = addFormats(new Ajv(options));
    this.coercingAjv = addFormats(new Ajv({ ...options, coerceTypes: 'array' }));
    this.baseId = `contract://${encodeURIComponent(contract.name)}`;
    // Hand-written contracts get the same keyword normalisation as imported ones (`nullable`, draft-04 bounds).
    const root = { $id: this.baseId, components: normalizeSchemas(contract.components ?? {}) };
    this.strictAjv.addSchema(root);
    this.coercingAjv.addSchema(root);
  }

  /** Validates `data` in place. Parameters are coerced from strings (`'1'` → 1) when `coerce` is true. */
  validate(key: string, schema: JsonSchema, data: unknown, location: string, coerce = false): ValidationIssue[] {
    const cacheKey = `${coerce ? 'c' : 's'}:${key}`;
    let fn = this.cache.get(cacheKey);
    if (!fn) {
      fn = (coerce ? this.coercingAjv : this.strictAjv).compile(this.rebase(schema) as object | boolean as never);
      this.cache.set(cacheKey, fn);
    }
    if (fn(data)) return [];
    return (fn.errors ?? []).map(error => toIssue(error, location));
  }

  private rebase(schema: JsonSchema): JsonSchema {
    return rewriteRefs(normalizeSchemas(schema), this.baseId) as JsonSchema;
  }
}

function rewriteRefs(node: unknown, baseId: string): unknown {
  if (Array.isArray(node)) return node.map(item => rewriteRefs(item, baseId));
  if (node === null || typeof node !== 'object') return node;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node)) {
    result[key] =
      key === '$ref' && typeof value === 'string' && value.startsWith('#/')
        ? `${baseId}${value}`
        : rewriteRefs(value, baseId);
  }
  return result;
}

function toIssue(error: ErrorObject, location: string): ValidationIssue {
  const params = error.params as Record<string, unknown>;
  const missing = typeof params.missingProperty === 'string' ? params.missingProperty : undefined;
  const extra = typeof params.additionalProperty === 'string' ? params.additionalProperty : undefined;
  const pointer = error.instancePath || '/';
  const last = error.instancePath.split('/').filter(Boolean).pop();
  const field = missing ?? extra ?? last;
  return {
    location,
    pointer,
    ...(field !== undefined ? { field } : {}),
    message: `${location}${pointer === '/' ? '' : pointer} ${error.message ?? 'is invalid'}`,
  };
}
