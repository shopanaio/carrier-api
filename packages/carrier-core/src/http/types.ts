// code and comments in English

export type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue | readonly QueryValue[]>;

export type HttpBody =
  | { kind: 'json'; value: unknown }
  | { kind: 'form'; value: Record<string, string> }
  | { kind: 'text'; value: string; contentType: string }
  | { kind: 'binary'; value: Uint8Array; contentType: string };

export type ResponseType = 'json' | 'text' | 'binary';

export interface HttpRequest {
  method: HttpMethod;
  /** Absolute URL. `query` is appended by the transport. */
  url: string;
  query?: QueryParams;
  /** Header names are kept as given; lookups through `getHeader` are case-insensitive. */
  headers?: Record<string, string>;
  body?: HttpBody;
  /** How the transport decodes the body. Defaults to `json`, falling back to text for non-JSON payloads. */
  responseType?: ResponseType;
  signal?: AbortSignal;
  /** Per-attempt timeout enforced by the transport. */
  timeoutMs?: number;
  /**
   * Whether repeating the request is safe. Defaults to true for GET/HEAD/PUT/DELETE/OPTIONS
   * and false for POST/PATCH; set it explicitly when a carrier supports idempotency keys.
   */
  idempotent?: boolean;
  /** Free-form metadata for middlewares (operation id, log tags). Never sent over the wire. */
  meta?: Record<string, unknown>;
}

export interface HttpResponse<T = unknown> {
  status: number;
  /** Lower-cased header names. */
  headers: Record<string, string>;
  data: T;
}

/** Binary payload as returned for `responseType: 'binary'` (PDF labels, ZPL, images). */
export interface BinaryData {
  contentType: string;
  data: Uint8Array;
}

/**
 * Transport contract. Resolves for every HTTP status (4xx/5xx included) and rejects only
 * when no response was received (network failure, timeout, abort).
 */
export type HttpTransport = <T = unknown>(request: HttpRequest) => Promise<HttpResponse<T>>;

const IDEMPOTENT_METHODS: ReadonlySet<HttpMethod> = new Set(['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS']);

export function isIdempotent(request: HttpRequest): boolean {
  return request.idempotent ?? IDEMPOTENT_METHODS.has(request.method);
}

export function getHeader(headers: Record<string, string> | undefined, name: string): string | undefined {
  if (!headers) return undefined;
  const lower = name.toLowerCase();
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === lower) return headers[key];
  }
  return undefined;
}

/** Returns a copy of `headers` with `name` set, replacing any existing header that differs only in case. */
export function setHeader(
  headers: Record<string, string> | undefined,
  name: string,
  value: string,
): Record<string, string> {
  const lower = name.toLowerCase();
  const next: Record<string, string> = {};
  for (const [key, existing] of Object.entries(headers ?? {})) {
    if (key.toLowerCase() !== lower) next[key] = existing;
  }
  next[name] = value;
  return next;
}
