/**
 * HTTP transport types for Meest API client
 *
 * This module defines the transport interface used by the Meest client.
 * For transport implementations, use `@shopana/carrier-transport` package.
 *
 * @example
 * ```typescript
 * import { createClient } from '@shopana/meest-api-client';
 * import { createFetchTransport } from '@shopana/carrier-transport';
 *
 * const transport = createFetchTransport({
 *   baseUrl: 'https://api.meest.com/v3.0/openAPI',
 * });
 *
 * const client = createClient({ transport });
 * ```
 */

import type { ResponseFormat } from '../types/base';

/**
 * HTTP methods supported by the transport
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * HTTP request configuration
 * Compatible with @shopana/carrier-transport HttpRequest interface
 */
export interface HttpRequest {
  /** HTTP method */
  method: HttpMethod;
  /** Request URL (full or relative to baseUrl) */
  url: string;
  /** Request headers */
  headers?: Record<string, string>;
  /** Request body */
  body?: unknown;
  /** Expected response format */
  responseType?: ResponseFormat;
  /** AbortSignal for request cancellation */
  signal?: AbortSignal;
  /** Request timeout in milliseconds */
  timeoutMs?: number;
}

/**
 * HTTP response
 * Compatible with @shopana/carrier-transport HttpResponse interface
 */
export interface HttpResponse<T = unknown> {
  /** HTTP status code */
  status: number;
  /** Response headers */
  headers?: Record<string, string>;
  /** Response data */
  data: T;
}

/**
 * HTTP transport interface
 *
 * This interface is compatible with @shopana/carrier-transport.
 * Use `createFetchTransport` from that package for the implementation.
 *
 * @example
 * ```typescript
 * import { createFetchTransport } from '@shopana/carrier-transport';
 *
 * const transport: HttpTransport = createFetchTransport({
 *   baseUrl: 'https://api.meest.com/v3.0/openAPI',
 *   retry: { maxRetries: 3, retryDelay: 1000 },
 * });
 * ```
 */
export interface HttpTransport {
  request<T = unknown>(request: HttpRequest): Promise<HttpResponse<T>>;
}
