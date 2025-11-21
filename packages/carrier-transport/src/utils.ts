/**
 * Utility functions for HTTP transport
 */

import type { HttpRequest } from './types';

/**
 * Build URL with query parameters
 */
export function buildUrl(url: string, query?: Record<string, string | number | boolean | null | undefined>): string {
  if (!query || Object.keys(query).length === 0) {
    return url;
  }

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== null && value !== undefined) {
      searchParams.append(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  if (!queryString) {
    return url;
  }

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${queryString}`;
}

/**
 * Merge headers objects
 */
export function mergeHeaders(
  ...headersList: (Record<string, string> | undefined)[]
): Record<string, string> {
  const merged: Record<string, string> = {};

  for (const headers of headersList) {
    if (headers) {
      for (const [key, value] of Object.entries(headers)) {
        merged[key] = value;
      }
    }
  }

  return merged;
}

/**
 * Resolve URL against base URL if relative
 */
export function resolveUrl(url: string, baseUrl?: string): string {
  if (!baseUrl) {
    return url;
  }

  // If URL is absolute, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Remove trailing slash from baseUrl
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  // Remove leading slash from url
  const path = url.startsWith('/') ? url.slice(1) : url;

  return `${base}/${path}`;
}

/**
 * Determine if content type is JSON
 */
export function isJsonContentType(contentType?: string): boolean {
  return contentType?.includes('application/json') ?? false;
}

/**
 * Create abort controller with timeout
 */
export function createTimeoutController(
  timeoutMs?: number,
  signal?: AbortSignal
): { controller: AbortController; cleanup: () => void } {
  const controller = new AbortController();
  let timeoutId: NodeJS.Timeout | number | undefined;

  // Link provided signal to our controller
  if (signal) {
    const onAbort = () => controller.abort();
    signal.addEventListener('abort', onAbort);

    const cleanup = () => {
      signal.removeEventListener('abort', onAbort);
      if (timeoutId) {
        clearTimeout(timeoutId as number);
      }
    };

    if (timeoutMs) {
      timeoutId = setTimeout(() => {
        controller.abort();
        cleanup();
      }, timeoutMs);
    }

    return { controller, cleanup };
  }

  // Only timeout
  if (timeoutMs) {
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    return {
      controller,
      cleanup: () => {
        if (timeoutId) {
          clearTimeout(timeoutId as number);
        }
      },
    };
  }

  return { controller, cleanup: () => {} };
}

/**
 * Prepare request body for sending
 */
export function prepareBody(
  body: unknown,
  contentType?: string
): BodyInit | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }

  // If body is already a valid BodyInit type, return as-is
  if (
    typeof body === 'string' ||
    body instanceof ArrayBuffer ||
    body instanceof Uint8Array ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob
  ) {
    return body as BodyInit;
  }

  // If content type is JSON, stringify the body
  if (isJsonContentType(contentType)) {
    return JSON.stringify(body);
  }

  // For other types, try to stringify
  return JSON.stringify(body);
}
