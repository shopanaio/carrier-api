// code and comments in English
import { createClient as createCoreClient } from '@shopana/carrier-core';
import type { Client as CoreClient, ClientContext as CoreClientContext } from '@shopana/carrier-core';
import type { NovaPoshtaRequest, NovaPoshtaResponse, System } from '../types/base';
import type { HttpTransport } from '../http/transport';

export interface NovaPoshtaClientConfig {
  /** Default API key; a request may still carry its own `apiKey`. */
  apiKey?: string;
  system?: System;
}

/** Carrier-core context: the HTTP client (base URL, retry, rate limit, logging) plus Nova Poshta settings. */
export type ClientContext = CoreClientContext<NovaPoshtaClientConfig>;

/** Error code Nova Poshta returns in a 200 body when it throttles a call. */
export const RATE_LIMIT_ERROR_CODE = '20000401501';

// Adapter from the carrier-core HTTP client to the interface-style transport used by services
export function toHttpTransport(ctx: ClientContext): HttpTransport {
  return {
    async request<T = unknown>(request: NovaPoshtaRequest): Promise<NovaPoshtaResponse<T>> {
      const { apiKey, system, ...rest } = request as NovaPoshtaRequest & { apiKey?: string; system?: System };
      const finalSystem = system || ctx.config.system;
      const body: NovaPoshtaRequest = {
        ...rest,
        ...(apiKey ? { apiKey } : {}),
        ...(finalSystem ? { system: finalSystem } : {}),
      };

      return ctx.http.request<NovaPoshtaResponse<T>>({
        method: 'POST',
        path: '',
        json: body,
        meta: { modelName: body.modelName, calledMethod: body.calledMethod },
      });
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
