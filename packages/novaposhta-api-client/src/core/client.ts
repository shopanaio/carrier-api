// code and comments in English
import type { NovaPoshtaRequest, NovaPoshtaResponse } from '../types/base';
import type { HttpTransport } from '../http/transport';

// Narrow HTTP POST JSON transport used by services internally
export type HttpPostJsonTransport = <TReq, TRes>(args: {
  url: string;
  body: TReq;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}) => Promise<{ status: number; data: TRes }>;

export interface ClientContext {
  transport: HttpPostJsonTransport;
  baseUrl: string;
  apiKey?: string;
  system?: 'DevCentre';
  /** Retry API-level rate-limit responses (error code 20000401501). */
  rateLimitRetry?: false | RateLimitRetryOptions;
}

export interface RateLimitRetryOptions {
  /** Number of retries after the initial request. Defaults to 2. */
  maxRetries?: number;
  /** Delay before the first retry. Defaults to 1000 ms. */
  delayMs?: number;
}

// Adapter from function-style transport to interface-style transport for services
export function toHttpTransport(ctx: ClientContext): HttpTransport {
  const retry = normalizeRateLimitRetry(ctx.rateLimitRetry);

  return {
    async request<T = unknown>(request: NovaPoshtaRequest): Promise<NovaPoshtaResponse<T>> {
      const { apiKey, system, ...rest } = request as NovaPoshtaRequest & { apiKey?: string; system?: 'DevCentre' };
      const finalRequest: NovaPoshtaRequest = {
        ...(rest as NovaPoshtaRequest),
        ...(apiKey ? { apiKey } : {}),
        ...(system || ctx.system ? { system: (system || ctx.system) as 'DevCentre' } : {}),
      };

      for (let attempt = 0; ; attempt += 1) {
        const response = await ctx.transport<NovaPoshtaRequest, NovaPoshtaResponse<T>>({
          url: ctx.baseUrl,
          body: finalRequest,
        });

        if (!isRateLimited(response.data) || !retry || attempt >= retry.maxRetries) {
          return response.data;
        }

        await wait(retry.delayMs * (attempt + 1));
      }
    },
  };
}

function normalizeRateLimitRetry(
  options: ClientContext['rateLimitRetry'],
): Required<RateLimitRetryOptions> | null {
  if (options === false) {
    return null;
  }

  const maxRetries = options?.maxRetries ?? 2;
  const delayMs = options?.delayMs ?? 1000;
  assertNonNegativeInteger(maxRetries, 'rateLimitRetry.maxRetries');
  assertNonNegativeInteger(delayMs, 'rateLimitRetry.delayMs');

  return { maxRetries, delayMs };
}

function assertNonNegativeInteger(value: number, name: string): void {
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
    throw new TypeError(`${name} must be a finite non-negative integer`);
  }
}

function isRateLimited(response: NovaPoshtaResponse<unknown>): boolean {
  return response.errorCodes?.includes('20000401501') ?? false;
}

function wait(delayMs: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, delayMs));
}

// Types to hoist only public methods
type Fn = (...args: any[]) => any;
type PublicMethodNames<T> = { [K in keyof T]: T[K] extends Fn ? K : never }[keyof T];
type ReservedKeys = 'constructor' | 'attach';
export type ServiceAPI<T> = Omit<Pick<T, PublicMethodNames<T>>, ReservedKeys>;

export type PluggableService = { attach?: (ctx: ClientContext) => void };
export type PluggableNamedService<NS extends string = string> = PluggableService & { readonly namespace: NS };

export type Client<API> = API & {
  use<S extends PluggableNamedService<string>>(service: S): Client<API & { [K in S['namespace']]: S }>;
};

export function createClient<API extends {} = {}>(ctx: ClientContext): Client<API> {
  const self: any = {} as Client<API>;

  self.use = function use<S extends PluggableNamedService<string>>(
    service: S,
  ): Client<API & { [K in S['namespace']]: S }> {
    // Inject context into service if supported
    if (typeof service.attach === 'function') {
      service.attach(ctx);
    }

    const ns: string | undefined = (service as any).namespace;
    if (!ns || typeof ns !== 'string') {
      throw new Error('Service must define a string "namespace" property');
    }

    // Attach the service instance under its namespace (no hoisting)
    if (ns in self) {
      throw new Error(`Namespace already installed on client: ${ns}`);
    }
    (self as any)[ns] = service;

    return self as Client<API & { [K in S['namespace']]: S }>;
  };

  return self as Client<API>;
}
