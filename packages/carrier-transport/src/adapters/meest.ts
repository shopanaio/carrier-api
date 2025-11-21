/**
 * Adapter for Meest API client
 * The Meest client already uses HttpTransport interface, so this is mainly for convenience
 * cspell:ignore Meest
 */

import type { HttpTransport, HttpRequest } from '../types';

/**
 * Meest uses the universal HttpTransport directly, but this helper
 * can add Meest-specific configurations if needed
 */
export function createMeestTransport(transport: HttpTransport): HttpTransport {
  // For now, Meest client directly uses HttpTransport
  // This adapter exists for future Meest-specific enhancements
  // (e.g., automatic token refresh, custom error handling, etc.)
  return {
    async request<T = unknown>(request: HttpRequest) {
      // Add any Meest-specific logic here if needed
      return transport.request<T>(request);
    },
  };
}

/**
 * Helper to create Meest transport with default configuration
 * Usage:
 * ```ts
 * const transport = createMeestTransportWithConfig(
 *   createFetchTransport(),
 *   { baseUrl: 'https://api.meest.com/v3.0/openAPI' }
 * );
 * ```
 */
export function createMeestTransportWithConfig(
  transport: HttpTransport,
  config: {
    baseUrl?: string;
    defaultHeaders?: Record<string, string>;
  }
): HttpTransport {
  return {
    async request<T = unknown>(request: HttpRequest) {
      const headers = {
        ...config.defaultHeaders,
        ...request.headers,
      };

      let url = request.url;
      if (config.baseUrl && !url.startsWith('http')) {
        // Resolve relative URL against baseUrl
        const base = config.baseUrl.endsWith('/')
          ? config.baseUrl.slice(0, -1)
          : config.baseUrl;
        const path = url.startsWith('/') ? url.slice(1) : url;
        url = `${base}/${path}`;
      }

      return transport.request<T>({
        ...request,
        url,
        headers,
      });
    },
  };
}
