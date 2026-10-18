// code and comments in English
import { createClient as createCoreClient, createHttpClient } from '@shopana/carrier-core';
import type {
  Client as CoreClient,
  ClientContext as CoreClientContext,
  HttpRequest,
  HttpResponse,
  HttpTransport as CoreHttpTransport,
  RetryOptions,
} from '@shopana/carrier-core';
import type { NovaPoshtaRequest, NovaPoshtaResponse, System } from '../types/base';
import type { HttpTransport } from '../http/transport';

export interface NovaPoshtaClientConfig {
  /** Default API key; a request may still carry its own `apiKey`. */
  apiKey?: string;
  system?: System;
}

/** Carrier-core context: the HTTP client (base URL, retry, rate limit, logging) plus Nova Poshta settings. */
export type CoreContext = CoreClientContext<NovaPoshtaClientConfig>;

/**
 * Function-style HTTP POST JSON transport of the 0.x client.
 * @deprecated Use a carrier-core `HttpTransport` with `createNovaPoshtaContext()`.
 */
export type HttpPostJsonTransport = <TReq, TRes>(args: {
  url: string;
  body: TReq;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}) => Promise<{ status: number; data: TRes }>;

/**
 * Rate-limit retry options of the 0.x client.
 * @deprecated Use `retry` of `createNovaPoshtaContext()`.
 */
export interface RateLimitRetryOptions {
  /** Number of retries after the initial request. Defaults to 2. */
  maxRetries?: number;
  /** Delay before the first retry. Defaults to 1000 ms. */
  delayMs?: number;
}

/**
 * Context of the 0.x client.
 * @deprecated Use `createNovaPoshtaContext()`; kept so `createClient({ transport, baseUrl, apiKey })` keeps working.
 */
export interface LegacyClientContext {
  transport: HttpPostJsonTransport;
  baseUrl: string;
  apiKey?: string;
  system?: System;
  /** Retry API-level rate-limit responses (error code 20000401501). */
  rateLimitRetry?: false | RateLimitRetryOptions;
}

export type ClientContext = CoreContext | LegacyClientContext;

/** Error code Nova Poshta returns in a 200 body when it throttles a call. */
export const RATE_LIMIT_ERROR_CODE = '20000401501';

function isLegacyContext(ctx: ClientContext): ctx is LegacyClientContext {
  return !('http' in ctx);
}

function assertNonNegativeInteger(value: number, name: string): void {
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
    throw new TypeError(`${name} must be a finite non-negative integer`);
  }
}

function isRateLimitedBody(data: unknown): boolean {
  const codes = (data as Partial<NovaPoshtaResponse> | null | undefined)?.errorCodes;
  return Array.isArray(codes) && codes.includes(RATE_LIMIT_ERROR_CODE);
}

// Adapts a 0.x function-style transport to the carrier-core transport contract
function adaptLegacyTransport(transport: HttpPostJsonTransport): CoreHttpTransport {
  return (async (request: HttpRequest): Promise<HttpResponse<unknown>> => {
    const response = await transport({
      url: request.url,
      body: request.body?.kind === 'json' ? request.body.value : undefined,
      ...(request.signal ? { signal: request.signal } : {}),
      ...(request.headers ? { headers: request.headers } : {}),
    });
    return { status: response.status, headers: {}, data: response.data };
  }) as CoreHttpTransport;
}

const resolved = new WeakMap<LegacyClientContext, CoreContext>();

/** Normalizes any supported context to a carrier-core one; a 0.x context is converted once and cached. */
export function resolveContext(ctx: ClientContext): CoreContext {
  if (!isLegacyContext(ctx)) return ctx;
  const cached = resolved.get(ctx);
  if (cached) return cached;

  let retry: RetryOptions | false = false;
  if (ctx.rateLimitRetry !== false) {
    const maxRetries = ctx.rateLimitRetry?.maxRetries ?? 2;
    const delayMs = ctx.rateLimitRetry?.delayMs ?? 1000;
    assertNonNegativeInteger(maxRetries, 'rateLimitRetry.maxRetries');
    assertNonNegativeInteger(delayMs, 'rateLimitRetry.delayMs');
    // 0.x retried only API-level rate limiting, never HTTP statuses or network errors.
    retry = {
      maxRetries,
      baseDelayMs: delayMs,
      jitter: 'none',
      retryOnStatus: [],
      shouldRetryResponse: response => isRateLimitedBody(response.data),
    };
  }

  const core: CoreContext = {
    http: createHttpClient({
      carrier: 'novaposhta',
      baseUrl: ctx.baseUrl,
      transport: adaptLegacyTransport(ctx.transport),
      retry,
      redact: { keys: ['apiKey'] },
    }),
    config: { apiKey: ctx.apiKey, system: ctx.system },
  };
  resolved.set(ctx, core);
  return core;
}

/** API key configured on a context of either kind. */
export function getContextApiKey(ctx: ClientContext): string | undefined {
  return isLegacyContext(ctx) ? ctx.apiKey : ctx.config.apiKey;
}

// Adapter from the carrier-core HTTP client to the interface-style transport used by services
export function toHttpTransport(ctx: ClientContext): HttpTransport {
  const core = resolveContext(ctx);
  const legacy = isLegacyContext(ctx);

  return {
    async request<T = unknown>(request: NovaPoshtaRequest): Promise<NovaPoshtaResponse<T>> {
      const { apiKey, system, ...rest } = request as NovaPoshtaRequest & { apiKey?: string; system?: System };
      const finalSystem = system || core.config.system;
      const body: NovaPoshtaRequest = {
        ...rest,
        ...(apiKey ? { apiKey } : {}),
        ...(finalSystem ? { system: finalSystem } : {}),
      };
      const call = {
        method: 'POST' as const,
        path: '',
        json: body,
        meta: { modelName: body.modelName, calledMethod: body.calledMethod },
      };

      // 0.x returned the body of any HTTP status instead of throwing, so keep that for its contexts.
      if (legacy) return (await core.http.send<NovaPoshtaResponse<T>>(call)).data;
      return core.http.request<NovaPoshtaResponse<T>>(call);
    },
  };
}

// Types to hoist only public methods
type Fn = (...args: any[]) => any;
type PublicMethodNames<T> = { [K in keyof T]: T[K] extends Fn ? K : never }[keyof T];
type ReservedKeys = 'constructor' | 'attach';
export type ServiceAPI<T> = Omit<Pick<T, PublicMethodNames<T>>, ReservedKeys>;

export type Client<API> = CoreClient<API, ClientContext>;

export function createClient<API extends object = object>(ctx: ClientContext): Client<API> {
  return createCoreClient<ClientContext, API>(ctx);
}
