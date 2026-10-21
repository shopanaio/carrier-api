// code and comments in English
import type { AuthStrategy } from '../auth/types';
import {
  CarrierError,
  categoryFromHttpStatus,
  isFatalError,
  isProgrammingError,
  isTransportFailure,
  toCarrierError,
  toNetworkError,
} from '../errors';
import type { Middleware } from '../http/pipeline';
import { composeMiddleware } from '../http/pipeline';
import type {
  HttpBody,
  HttpMethod,
  HttpRequest,
  HttpResponse,
  HttpTransport,
  QueryParams,
  ResponseType,
} from '../http/types';
import { expandPath, joinUrl } from '../http/url';
import type { AuthMiddlewareOptions } from '../middleware/auth';
import { auth as authMiddleware } from '../middleware/auth';
import type { HttpLogger, RedactionOptions } from '../middleware/logging';
import { logging } from '../middleware/logging';
import type { RateLimitOptions, RateLimiter } from '../middleware/rateLimit';
import { rateLimit as rateLimitMiddleware, toRateLimiter } from '../middleware/rateLimit';
import type { RetryOptions } from '../middleware/retry';
import { retry as retryMiddleware } from '../middleware/retry';
import { timeout as timeoutMiddleware } from '../middleware/timeout';

export interface CarrierRequest {
  method: HttpMethod;
  /** Path relative to `baseUrl` with optional `{param}` placeholders, or an absolute URL. */
  path: string;
  pathParams?: Record<string, string | number | boolean>;
  query?: QueryParams;
  headers?: Record<string, string>;
  /** Shortcut for `body: { kind: 'json', value }`. */
  json?: unknown;
  body?: HttpBody;
  responseType?: ResponseType;
  idempotent?: boolean;
  signal?: AbortSignal;
  /** Per-attempt timeout. */
  timeoutMs?: number;
  meta?: Record<string, unknown>;
}

export interface HttpClientOptions {
  /** Carrier slug used in errors and logs, e.g. `ukrposhta`. */
  carrier: string;
  baseUrl: string;
  transport: HttpTransport;
  auth?: AuthStrategy;
  authOptions?: AuthMiddlewareOptions;
  /** Default: retry with default options. `false` disables. */
  retry?: RetryOptions | false;
  rateLimit?: RateLimiter | RateLimitOptions;
  /** Overall deadline for one call, retries included. */
  timeoutMs?: number;
  defaultHeaders?: Record<string, string>;
  logger?: HttpLogger;
  redact?: RedactionOptions;
  /**
   * Extra middlewares, run after rate limiting and before auth, so credentials and signatures
   * are applied to the request as these middlewares left it.
   */
  middlewares?: Middleware[];
  /**
   * Turns a successful HTTP response into the payload, unwrapping the carrier's envelope
   * (`{ status, info, result }` at Meest). Throw a CarrierError for errors reported in a 2xx body.
   */
  unwrap?: (response: HttpResponse<unknown>, request: HttpRequest) => unknown;
  /** Maps a non-2xx response to a CarrierError. Falls back to `defaultHttpError`. */
  mapError?: (response: HttpResponse<unknown>, request: HttpRequest) => CarrierError | undefined;
}

/**
 * Carrier-agnostic HTTP client. Pipeline order (outermost first):
 * timeout → retry → rateLimit → custom middlewares → auth → logging → transport.
 * Custom middlewares run before auth so a signature covers the headers and body they set.
 * Only rejections of the transport itself become network errors (`NETWORK_ERROR`, `TIMEOUT`,
 * `ABORTED`), except programming errors inside it (`TypeError: Cannot read properties ...`);
 * anything else thrown in the pipeline becomes a non-retryable `UNEXPECTED_ERROR`.
 * Rate limiting sits inside retry so every retried attempt also waits for a token; the single repeat
 * after a 401 takes a token too. Login/refresh calls made by an auth strategy use their own transport
 * and are not rate-limited here.
 */
export class HttpClient {
  readonly carrier: string;
  readonly baseUrl: string;
  private readonly pipeline: HttpTransport;

  constructor(private readonly options: HttpClientOptions) {
    this.carrier = options.carrier;
    this.baseUrl = options.baseUrl;

    const middlewares: Middleware[] = [];
    if (options.timeoutMs) middlewares.push(timeoutMiddleware(options.timeoutMs));
    if (options.retry !== false) middlewares.push(retryMiddleware(options.retry ?? {}));
    const limiter = options.rateLimit ? toRateLimiter(options.rateLimit) : undefined;
    if (limiter) middlewares.push(rateLimitMiddleware(limiter));
    middlewares.push(...(options.middlewares ?? []));
    if (options.auth) {
      const beforeRepeat =
        options.authOptions?.beforeRepeat ??
        (limiter ? (request: HttpRequest) => limiter.acquire(request.signal) : undefined);
      middlewares.push(
        authMiddleware(options.auth, { ...options.authOptions, ...(beforeRepeat ? { beforeRepeat } : {}) }),
      );
    }
    if (options.logger) middlewares.push(logging(options.logger, { ...options.redact, carrier: options.carrier }));
    const carrier = options.carrier;
    const transport = (<T>(request: HttpRequest) =>
      options.transport<T>(request).catch((error: unknown) => {
        if (isFatalError(error)) throw error;
        // A bug inside the transport must not be retried and reported as a lost connection.
        throw isProgrammingError(error) ? toCarrierError(carrier, error) : toNetworkError(carrier, error);
      })) as HttpTransport;
    this.pipeline = composeMiddleware(transport, middlewares);
  }

  /** Builds the wire request without sending it. */
  build(request: CarrierRequest): HttpRequest {
    const url = joinUrl(this.baseUrl, expandPath(request.path, request.pathParams));
    const body: HttpBody | undefined =
      request.body ?? (request.json !== undefined ? { kind: 'json', value: request.json } : undefined);
    const headers = { ...(this.options.defaultHeaders ?? {}), ...(request.headers ?? {}) };
    return {
      method: request.method,
      url,
      ...(request.query ? { query: request.query } : {}),
      ...(Object.keys(headers).length ? { headers } : {}),
      ...(body ? { body } : {}),
      ...(request.responseType ? { responseType: request.responseType } : {}),
      ...(request.idempotent !== undefined ? { idempotent: request.idempotent } : {}),
      ...(request.signal ? { signal: request.signal } : {}),
      ...(request.timeoutMs ? { timeoutMs: request.timeoutMs } : {}),
      ...(request.meta ? { meta: request.meta } : {}),
    };
  }

  /** Sends through the pipeline and returns the raw response for any status. Network failures become CarrierError. */
  async send<T = unknown>(request: CarrierRequest): Promise<HttpResponse<T>> {
    const wire = this.build(request);
    try {
      return await this.pipeline<T>(wire);
    } catch (error) {
      throw this.toError(error, wire);
    }
  }

  /** Sends, throws CarrierError for non-2xx responses, and returns the unwrapped payload. */
  async request<T = unknown>(request: CarrierRequest): Promise<T> {
    const wire = this.build(request);
    let response: HttpResponse<unknown>;
    try {
      response = await this.pipeline(wire);
    } catch (error) {
      throw this.toError(error, wire);
    }
    if (response.status < 200 || response.status >= 300) {
      throw this.options.mapError?.(response, wire) ?? defaultHttpError(this.carrier, response);
    }
    if (!this.options.unwrap) return response.data as T;
    try {
      return this.options.unwrap(response, wire) as T;
    } catch (error) {
      throw isFatalError(error) ? error : toCarrierError(this.carrier, error);
    }
  }

  private toError(error: unknown, wire: HttpRequest): unknown {
    if (isFatalError(error)) return error;
    // The caller's own abort (while waiting for a token or a backoff) and the overall deadline.
    if (wire.signal?.aborted && error === wire.signal.reason) {
      return toNetworkError(
        this.carrier,
        isAbortLike(error) ? error : Object.assign(new Error(messageOf(error)), { name: 'AbortError', cause: error }),
      );
    }
    if (isAbortLike(error) || isTransportFailure(error)) return toNetworkError(this.carrier, error);
    return toCarrierError(this.carrier, error);
  }
}

export function createHttpClient(options: HttpClientOptions): HttpClient {
  return new HttpClient(options);
}

/** Generic non-2xx → CarrierError mapping: category from status, message from common body fields. */
export function defaultHttpError(carrier: string, response: HttpResponse<unknown>): CarrierError {
  const category = categoryFromHttpStatus(response.status);
  return new CarrierError({
    carrier,
    code:
      (typeof response.data === 'object'
        ? extractString(response.data, ['code', 'errorCode', 'error_code'])
        : undefined) ?? `HTTP_${response.status}`,
    message:
      extractString(response.data, ['message', 'error_description', 'msg', 'error', 'detail']) ??
      `HTTP ${response.status}`,
    category,
    httpStatus: response.status,
    raw: response.data,
  });
}

function isAbortLike(error: unknown): boolean {
  const name = (error as { name?: unknown } | null | undefined)?.name;
  return name === 'AbortError' || name === 'TimeoutError';
}

function messageOf(error: unknown): string {
  const message = (error as { message?: unknown } | null | undefined)?.message;
  return typeof message === 'string' ? message : String(error);
}

function extractString(data: unknown, keys: string[]): string | undefined {
  if (typeof data === 'string') return data.trim() ? data.slice(0, 500) : undefined;
  if (data === null || typeof data !== 'object') return undefined;
  for (const key of keys) {
    const value = (data as Record<string, unknown>)[key];
    if (typeof value === 'string' && value) return value;
    if (typeof value === 'number') return String(value);
  }
  return undefined;
}
