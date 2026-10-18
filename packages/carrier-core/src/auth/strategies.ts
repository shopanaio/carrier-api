// code and comments in English
import type { HttpRequest } from '../http/types';
import { setHeader } from '../http/types';
import { base64Encode } from '../utils/base64';
import type { AuthStrategy, Secret } from './types';
import { resolveSecret } from './types';

/** No credentials (public reference APIs such as publicapi.meest.com). */
export function noAuth(): AuthStrategy {
  return { apply: request => request };
}

export interface ApiKeyOptions {
  /** Where the key goes. Default `header`. */
  in?: 'header' | 'query' | 'body';
  /** Header, query parameter or top-level JSON body field name. */
  name: string;
  value: Secret;
  /** Prepended to the value, e.g. `Bearer `. */
  prefix?: string;
}

/** A static key in a header, query parameter or JSON body field. */
export function apiKey(options: ApiKeyOptions): AuthStrategy {
  const location = options.in ?? 'header';
  const prefix = options.prefix ?? '';
  return {
    async apply(request) {
      const value = prefix + (await resolveSecret(options.value));
      if (location === 'header') return { ...request, headers: setHeader(request.headers, options.name, value) };
      if (location === 'query') return { ...request, query: { ...(request.query ?? {}), [options.name]: value } };
      return mergeIntoBody(request, { [options.name]: value });
    },
  };
}

/** `Authorization: Bearer <token>` with a static or lazily resolved token. */
export function bearer(token: Secret): AuthStrategy {
  return apiKey({ in: 'header', name: 'Authorization', prefix: 'Bearer ', value: token });
}

/** A query parameter credential, e.g. Ukrposhta's counterparty `?token=`. */
export function queryParam(name: string, value: Secret): AuthStrategy {
  return apiKey({ in: 'query', name, value });
}

export interface BasicAuthOptions {
  username: Secret;
  password: Secret;
}

export function basic(options: BasicAuthOptions): AuthStrategy {
  return {
    async apply(request) {
      const credentials = `${await resolveSecret(options.username)}:${await resolveSecret(options.password)}`;
      return { ...request, headers: setHeader(request.headers, 'Authorization', `Basic ${base64Encode(credentials)}`) };
    },
  };
}

/**
 * Credentials sent as fields of every request body (Speedy, Aramex `ClientInfo`, Nova Poshta `apiKey`).
 * With `path`, fields are nested under that key: `{ [path]: fields, ...body }`.
 */
export function bodyCredentials(fields: Record<string, Secret>, options: { path?: string } = {}): AuthStrategy {
  return {
    async apply(request) {
      const resolved: Record<string, string> = {};
      for (const [key, secret] of Object.entries(fields)) resolved[key] = await resolveSecret(secret);
      return mergeIntoBody(request, options.path ? { [options.path]: resolved } : resolved);
    },
  };
}

/** Applies several strategies in order (Ukrposhta eCom: bearer header + counterparty token query). */
export function composeAuth(...strategies: AuthStrategy[]): AuthStrategy {
  return {
    async apply(request) {
      let next = request;
      for (const strategy of strategies) next = await strategy.apply(next);
      return next;
    },
    async onUnauthorized(response, request) {
      let refreshed = false;
      for (const strategy of strategies) {
        if (strategy.onUnauthorized && (await strategy.onUnauthorized(response, request))) refreshed = true;
      }
      return refreshed;
    },
  };
}

/**
 * Applies `strategy` only to requests matching `predicate`, e.g. only to operations whose
 * contract includes the counterparty token: `when(r => r.meta?.counterpartyToken === true, queryParam(...))`.
 */
export function when(predicate: (request: HttpRequest) => boolean, strategy: AuthStrategy): AuthStrategy {
  return {
    apply: request => (predicate(request) ? strategy.apply(request) : request),
    onUnauthorized: (response, request) =>
      predicate(request) && strategy.onUnauthorized ? strategy.onUnauthorized(response, request) : false,
  };
}

/** Adds credential fields to the body; a body field with the same name is an error, never silently kept. */
function mergeIntoBody(request: HttpRequest, fields: Record<string, unknown>): HttpRequest {
  const body = request.body;
  if (!body) return { ...request, body: { kind: 'json', value: fields } };
  if ((body.kind === 'json' && isPlainObject(body.value)) || body.kind === 'form') {
    const clash = Object.keys(fields).find(key => Object.prototype.hasOwnProperty.call(body.value, key));
    if (clash !== undefined) throw new TypeError(`Body credentials would overwrite the body field "${clash}"`);
  }
  if (body.kind === 'json' && isPlainObject(body.value)) {
    return { ...request, body: { kind: 'json', value: { ...fields, ...body.value } } };
  }
  if (body.kind === 'form') {
    const flat: Record<string, string> = {};
    for (const [key, value] of Object.entries(fields))
      flat[key] = typeof value === 'string' ? value : JSON.stringify(value);
    return { ...request, body: { kind: 'form', value: { ...flat, ...body.value } } };
  }
  throw new TypeError(`Cannot add body credentials to a ${body.kind} body`);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
