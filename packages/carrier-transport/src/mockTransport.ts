/**
 * Mock transport for testing
 * Useful for unit tests and development
 */

import type { HttpTransport, HttpRequest, HttpResponse } from './types';

/**
 * Mock response configuration
 */
export interface MockResponse<T = any> {
  status?: number;
  statusText?: string;
  data: T;
  headers?: Record<string, string>;
  delay?: number; // Simulate network delay in ms
}

/**
 * Mock transport options
 */
export interface MockTransportOptions {
  /** Default response for unmatched requests */
  defaultResponse?: MockResponse;
  /** Should throw on unmatched requests? */
  throwOnUnmatched?: boolean;
}

/**
 * Create a mock HTTP transport for testing
 *
 * @example
 * ```ts
 * const mock = createMockTransport();
 *
 * mock.onRequest({ method: 'POST', url: '/api' }).reply({
 *   status: 200,
 *   data: { success: true }
 * });
 *
 * const response = await mock.request({ method: 'POST', url: '/api' });
 * ```
 */
export function createMockTransport(options: MockTransportOptions = {}): MockTransport {
  const matchers: RequestMatcher[] = [];
  const requestLog: HttpRequest[] = [];

  const transport: HttpTransport = {
    async request<T = unknown>(request: HttpRequest): Promise<HttpResponse<T>> {
      // Log request
      requestLog.push({ ...request });

      // Find matching mock response
      for (const matcher of matchers) {
        if (matcher.matches(request)) {
          const response = matcher.response;

          // Simulate delay if configured
          if (response.delay) {
            await sleep(response.delay);
          }

          return {
            status: response.status ?? 200,
            statusText: response.statusText ?? 'OK',
            headers: response.headers ?? {},
            data: response.data as T,
          };
        }
      }

      // Use default response if configured
      if (options.defaultResponse) {
        const response = options.defaultResponse;
        return {
          status: response.status ?? 200,
          statusText: response.statusText ?? 'OK',
          headers: response.headers ?? {},
          data: response.data as T,
        };
      }

      // Throw if no match and throwOnUnmatched is true
      if (options.throwOnUnmatched) {
        throw new Error(
          `No mock response configured for: ${request.method ?? 'POST'} ${request.url}`
        );
      }

      // Return empty response
      return {
        status: 404,
        statusText: 'Not Found',
        headers: {},
        data: null as T,
      };
    },
  };

  return {
    ...transport,
    onRequest: (pattern: RequestPattern) => {
      const matcher = new RequestMatcher(pattern);
      matchers.push(matcher);
      return {
        reply: (response: MockResponse) => {
          matcher.response = response;
          return matcher;
        },
      };
    },
    reset: () => {
      matchers.length = 0;
      requestLog.length = 0;
    },
    getRequestLog: () => [...requestLog],
  };
}

/**
 * Request pattern for matching
 */
export interface RequestPattern {
  method?: HttpMethod | HttpMethod[];
  url?: string | RegExp;
  body?: any;
  headers?: Record<string, string>;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/**
 * Request matcher
 */
class RequestMatcher {
  public response: MockResponse = { status: 200, data: null };

  constructor(private pattern: RequestPattern) {}

  matches(request: HttpRequest): boolean {
    const { method, url, body, headers } = this.pattern;

    // Match method
    if (method) {
      const methods = Array.isArray(method) ? method : [method];
      const requestMethod = request.method ?? 'POST';
      if (!methods.includes(requestMethod as any)) {
        return false;
      }
    }

    // Match URL
    if (url) {
      if (typeof url === 'string') {
        if (request.url !== url) {
          return false;
        }
      } else if (url instanceof RegExp) {
        if (!url.test(request.url)) {
          return false;
        }
      }
    }

    // Match body
    if (body !== undefined) {
      if (JSON.stringify(request.body) !== JSON.stringify(body)) {
        return false;
      }
    }

    // Match headers
    if (headers) {
      for (const [key, value] of Object.entries(headers)) {
        if (request.headers?.[key] !== value) {
          return false;
        }
      }
    }

    return true;
  }
}

/**
 * Extended mock transport interface with testing utilities
 */
export interface MockTransport extends HttpTransport {
  /**
   * Configure a mock response for matching requests
   */
  onRequest: (pattern: RequestPattern) => {
    reply: (response: MockResponse) => RequestMatcher;
  };

  /**
   * Reset all mock responses and request log
   */
  reset: () => void;

  /**
   * Get log of all requests made to this transport
   */
  getRequestLog: () => HttpRequest[];
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
