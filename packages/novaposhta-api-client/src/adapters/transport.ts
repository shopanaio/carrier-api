/**
 * Adapter to use universal HttpTransport with Nova Poshta client
 * This allows using @shopana/carrier-transport or any compatible transport
 */

import type { HttpPostJsonTransport } from '../core/client';

/**
 * Universal transport interface (compatible with @shopana/carrier-transport)
 */
export interface UniversalHttpTransport {
  request<T = unknown>(request: {
    method?: string;
    url: string;
    headers?: Record<string, string>;
    body?: unknown;
    responseType?: string;
    signal?: AbortSignal;
    timeoutMs?: number;
    query?: Record<string, string | number | boolean | null | undefined>;
  }): Promise<{
    status: number;
    statusText?: string;
    headers?: Record<string, string>;
    data: T;
  }>;
}

/**
 * Create Nova Poshta transport from universal HttpTransport
 * This adapter converts the universal transport interface to Nova Poshta's format
 *
 * @example
 * ```ts
 * import { createClient } from '@shopana/novaposhta-api-client';
 * import { fromUniversalTransport } from '@shopana/novaposhta-api-client/adapters';
 * import { createFetchTransport } from '@shopana/carrier-transport';
 *
 * const universalTransport = createFetchTransport({
 *   baseUrl: 'https://api.novaposhta.ua/v2.0/json/',
 * });
 *
 * const client = createClient({
 *   transport: fromUniversalTransport(universalTransport),
 *   baseUrl: 'https://api.novaposhta.ua/v2.0/json/',
 *   apiKey: process.env.NP_API_KEY,
 * });
 * ```
 */
export function fromUniversalTransport(transport: UniversalHttpTransport): HttpPostJsonTransport {
  return async <TReq, TRes>(args: {
    url: string;
    body: TReq;
    signal?: AbortSignal;
    headers?: Record<string, string>;
  }): Promise<{ status: number; data: TRes }> => {
    const response = await transport.request<TRes>({
      method: 'POST',
      url: args.url,
      body: args.body,
      signal: args.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...args.headers,
      },
      responseType: 'json',
    });

    return {
      status: response.status,
      data: response.data,
    };
  };
}

/**
 * Convert Nova Poshta transport to universal format
 * This allows using Nova Poshta transport with other systems
 *
 * @example
 * ```ts
 * const npTransport = async ({ url, body }) => {
 *   const res = await fetch(url, {
 *     method: 'POST',
 *     body: JSON.stringify(body),
 *   });
 *   return { status: res.status, data: await res.json() };
 * };
 *
 * const universalTransport = toUniversalTransport(npTransport);
 * ```
 */
export function toUniversalTransport(transport: HttpPostJsonTransport): UniversalHttpTransport {
  return {
    async request<T = unknown>(request): Promise<{
      status: number;
      statusText?: string;
      headers?: Record<string, string>;
      data: T;
    }> {
      // Nova Poshta only supports POST
      if (request.method && request.method !== 'POST') {
        throw new Error(`Nova Poshta transport only supports POST, got ${request.method}`);
      }

      const response = await transport<unknown, T>({
        url: request.url,
        body: request.body,
        signal: request.signal,
        headers: request.headers,
      });

      return {
        status: response.status,
        statusText: 'OK',
        headers: {},
        data: response.data,
      };
    },
  };
}
