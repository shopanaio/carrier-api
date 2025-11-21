/**
 * Fetch-based HTTP transport implementation
 * Works in browsers, Node.js 18+, and edge runtimes
 */

import type {
  HttpTransport,
  HttpRequest,
  HttpResponse,
  TransportOptions,
  FetchLike,
} from './types';
import {
  buildUrl,
  mergeHeaders,
  resolveUrl,
  createTimeoutController,
  prepareBody,
} from './utils';

export interface FetchTransportOptions extends TransportOptions {
  /** Custom fetch implementation (useful for Node.js < 18, testing, or special environments) */
  fetchImpl?: FetchLike;
}

/**
 * Create a fetch-based HTTP transport
 * Works universally in browsers, Node.js, and edge runtimes
 */
export function createFetchTransport(options: FetchTransportOptions = {}): HttpTransport {
  const {
    fetchImpl,
    baseUrl,
    defaultHeaders = {},
    defaultTimeout,
    retry,
    interceptors,
  } = options;

  // Use provided fetch or global fetch
  const fetchFn: FetchLike =
    fetchImpl ??
    (typeof fetch !== 'undefined'
      ? fetch
      : () => {
          throw new Error(
            'Global fetch is not available. ' +
              'Provide fetchImpl explicitly or use Node.js 18+ / modern browser.'
          );
        });

  const transport: HttpTransport = {
    async request<T = unknown>(request: HttpRequest): Promise<HttpResponse<T>> {
      let req = { ...request };

      // Apply request interceptor
      if (interceptors?.request) {
        req = await interceptors.request(req);
      }

      const method = req.method ?? 'POST';
      const responseType = req.responseType ?? 'json';
      const timeoutMs = req.timeoutMs ?? defaultTimeout;

      // Build URL with query parameters
      let url = buildUrl(req.url, req.query);

      // Resolve against base URL if relative
      url = resolveUrl(url, baseUrl);

      // Merge headers
      const headers = mergeHeaders(
        {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        defaultHeaders,
        req.headers
      );

      // Prepare body
      const body = prepareBody(req.body, headers['Content-Type']);

      // Setup abort controller with timeout
      const { controller, cleanup } = createTimeoutController(timeoutMs, req.signal);

      try {
        // Execute fetch
        const response = await fetchFn(url, {
          method,
          headers,
          body,
          signal: controller.signal,
        });

        // Parse response
        let data: any;
        if (responseType === 'json') {
          const text = await response.text();
          data = text ? JSON.parse(text) : null;
        } else if (responseType === 'text') {
          data = await response.text();
        } else if (responseType === 'arraybuffer') {
          data = await response.arrayBuffer();
        } else if (responseType === 'blob') {
          data = await response.blob();
        } else if (responseType === 'stream') {
          data = response.body;
        } else {
          // Default to json
          const text = await response.text();
          data = text ? JSON.parse(text) : null;
        }

        const httpResponse: HttpResponse<T> = {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data,
        };

        // Apply response interceptor
        if (interceptors?.response) {
          return await interceptors.response(httpResponse);
        }

        return httpResponse;
      } catch (error) {
        // Apply error interceptor
        if (interceptors?.error) {
          const handledError = await interceptors.error(error);
          if (handledError !== error) {
            throw handledError;
          }
        }

        throw error;
      } finally {
        cleanup();
      }
    },
  };

  // Wrap with retry logic if configured
  if (retry && retry.maxRetries > 0) {
    return wrapWithRetry(transport, retry);
  }

  return transport;
}

/**
 * Wrap transport with retry logic
 */
function wrapWithRetry(
  transport: HttpTransport,
  retry: NonNullable<TransportOptions['retry']>
): HttpTransport {
  return {
    async request<T = unknown>(request: HttpRequest): Promise<HttpResponse<T>> {
      // cspell:disable-next-line
      const { maxRetries, retryDelay, retryableStatusCodes = [408, 429, 500, 502, 503, 504] } = retry;

      let lastError: unknown;
      let attempt = 0;

      while (attempt <= maxRetries) {
        try {
          const response = await transport.request<T>(request);

          // Check if status code is retryable (can be retried)
          // cspell:disable-next-line
          if (attempt < maxRetries && retryableStatusCodes.includes(response.status)) {
            attempt++;
            await sleep(retryDelay * attempt);
            continue;
          }

          return response;
        } catch (error) {
          lastError = error;

          // Don't retry on abort
          if (isAbortError(error)) {
            throw error;
          }

          if (attempt < maxRetries) {
            attempt++;
            await sleep(retryDelay * attempt);
            continue;
          }

          throw error;
        }
      }

      throw lastError;
    },
  };
}

/**
 * Sleep helper for retries
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if error is an abort error
 */
function isAbortError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'AbortError' || error.message.includes('abort'))
  );
}
