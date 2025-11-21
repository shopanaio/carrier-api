/**
 * Adapter for Nova Poshta API client
 * Converts universal HttpTransport to Nova Poshta's HttpPostJsonTransport
 */

import type { HttpTransport } from '../types';

/**
 * Nova Poshta transport type (POST JSON only)
 */
export type NovaPoshtaTransport = <TReq, TRes>(args: {
  url: string;
  body: TReq;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}) => Promise<{ status: number; data: TRes }>;

/**
 * Create Nova Poshta transport from universal HttpTransport
 * This adapter allows Nova Poshta client to use any universal transport
 */
export function createNovaPoshtaTransport(transport: HttpTransport): NovaPoshtaTransport {
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
 * Helper to create a complete Nova Poshta transport with baseUrl
 * Usage:
 * ```ts
 * const transport = createNovaPoshtaTransportWithBase(
 *   createFetchTransport(),
 *   'https://api.novaposhta.ua/v2.0/json/'
 * );
 * ```
 */
export function createNovaPoshtaTransportWithBase(
  transport: HttpTransport,
  baseUrl: string
): NovaPoshtaTransport {
  return async <TReq, TRes>(args: {
    url: string;
    body: TReq;
    signal?: AbortSignal;
    headers?: Record<string, string>;
  }): Promise<{ status: number; data: TRes }> => {
    // Nova Poshta always uses the same URL, so we ignore args.url and use baseUrl
    const response = await transport.request<TRes>({
      method: 'POST',
      url: baseUrl,
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
