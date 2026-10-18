// code and comments in English
import type { Middleware } from '../http/pipeline';
import type { HttpBody, HttpRequest, QueryParams } from '../http/types';
import type { Clock } from '../utils/time';
import { systemClock } from '../utils/time';

export const REDACTED = '***';

const DEFAULT_SECRET_HEADERS = [
  'authorization',
  'proxy-authorization',
  'cookie',
  'set-cookie',
  'token',
  'x-api-key',
  'apikey',
  'api-key',
  'x-auth-token',
  'x-access-token',
];
const DEFAULT_SECRET_KEYS = [
  'apikey',
  'api_key',
  'token',
  'access_token',
  'accesstoken',
  'refresh_token',
  'refreshtoken',
  'password',
  'secret',
  'client_secret',
  'clientsecret',
];

export interface RedactionOptions {
  /** Extra header names to mask (case-insensitive). */
  headers?: string[];
  /** Extra query parameter / JSON body / form field names to mask (case-insensitive). */
  keys?: string[];
}

export interface RedactedRequest {
  method: string;
  url: string;
  headers?: Record<string, string>;
  query?: QueryParams;
  body?: unknown;
}

/** Copy of a request that is safe to log: secrets in headers, URL, query and body are masked. */
export function redactRequest(request: HttpRequest, options: RedactionOptions = {}): RedactedRequest {
  const secretHeaders = new Set([...DEFAULT_SECRET_HEADERS, ...(options.headers ?? []).map(h => h.toLowerCase())]);
  const secretKeys = new Set([...DEFAULT_SECRET_KEYS, ...(options.keys ?? []).map(k => k.toLowerCase())]);

  const headers = request.headers
    ? Object.fromEntries(
        Object.entries(request.headers).map(([k, v]) => [k, secretHeaders.has(k.toLowerCase()) ? REDACTED : v]),
      )
    : undefined;
  const query = request.query
    ? (Object.fromEntries(
        Object.entries(request.query).map(([k, v]) => [k, secretKeys.has(k.toLowerCase()) ? REDACTED : v]),
      ) as QueryParams)
    : undefined;

  return {
    method: request.method,
    url: redactUrl(request.url, secretKeys),
    ...(headers ? { headers } : {}),
    ...(query ? { query } : {}),
    ...(request.body ? { body: redactBody(request.body, secretKeys) } : {}),
  };
}

function redactUrl(url: string, secretKeys: Set<string>): string {
  return url.replace(/([?&])([^=&#]+)=([^&#]*)/g, (match, sep: string, key: string) =>
    secretKeys.has(safeDecode(key).toLowerCase()) ? `${sep}${key}=${REDACTED}` : match,
  );
}

/** Malformed percent-encoding (`%E0%A4%A`) must not make logging throw; match the raw key instead. */
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function redactBody(body: HttpBody, secretKeys: Set<string>): unknown {
  switch (body.kind) {
    case 'json':
      return redactValue(body.value, secretKeys);
    case 'form':
      return redactValue(body.value, secretKeys);
    case 'text':
      return `[text ${body.contentType}, ${body.value.length} chars]`;
    case 'binary':
      return `[binary ${body.contentType}, ${body.value.byteLength} bytes]`;
  }
}

function redactValue(value: unknown, secretKeys: Set<string>): unknown {
  if (Array.isArray(value)) return value.map(item => redactValue(item, secretKeys));
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        secretKeys.has(k.toLowerCase()) ? REDACTED : redactValue(v, secretKeys),
      ]),
    );
  }
  return value;
}

export interface HttpLogEvent {
  carrier?: string;
  request: RedactedRequest;
  status?: number;
  durationMs: number;
  error?: unknown;
}

export type HttpLogger = (event: HttpLogEvent) => void;

/**
 * Logs every attempt that reaches the transport, with secrets masked. A logger that throws is
 * ignored: it must never turn a sent request (a created shipment) into a failure.
 */
export function logging(
  logger: HttpLogger,
  options: RedactionOptions & { carrier?: string; clock?: Clock } = {},
): Middleware {
  const clock = options.clock ?? systemClock;
  return async (request, next) => {
    const startedAt = clock.now();
    const base = () => ({
      carrier: options.carrier,
      request: redactRequest(request, options),
      durationMs: clock.now() - startedAt,
    });
    const emit = (event: HttpLogEvent) => {
      try {
        logger(event);
      } catch {
        // Logging is best effort.
      }
    };
    let response: Awaited<ReturnType<typeof next>>;
    try {
      response = await next(request);
    } catch (error) {
      emit({ ...base(), error });
      throw error;
    }
    emit({ ...base(), status: response.status });
    return response;
  };
}
