// code and comments in English
import type { HttpResponse, HttpTransport } from '@shopana/carrier-core';

/**
 * Pluggable store for large reference data (the locality register is about 6 MB, branches about 2.3 MB).
 * Implement it over Redis, KV or a file so serverless callers do not download the registers on every cold start.
 */
export interface ReferenceCache {
  get<T>(key: string): T | undefined | Promise<T | undefined>;
  set<T>(key: string, value: T, ttlSec: number): void | Promise<void>;
}

/** Process-local cache with a TTL; handy for tests and long-lived servers. */
export function createMemoryReferenceCache(now: () => number = Date.now): ReferenceCache {
  const entries = new Map<string, { value: unknown; expiresAt: number }>();
  return {
    get<T>(key: string): T | undefined {
      const entry = entries.get(key);
      if (!entry) return undefined;
      if (entry.expiresAt <= now()) {
        entries.delete(key);
        return undefined;
      }
      return entry.value as T;
    },
    set(key, value, ttlSec) {
      entries.set(key, { value, expiresAt: now() + ttlSec * 1000 });
    },
  };
}

export interface ReferenceCacheOptions {
  cache: ReferenceCache;
  /** Cache lifetime in seconds. Default 86400 (the registers change at most daily). */
  ttlSec?: number;
}

/**
 * Optional layer, separate from the client: wraps a transport so successful GET answers are served from the
 * cache until they expire. The client itself never caches.
 */
export function withReferenceCache(transport: HttpTransport, options: ReferenceCacheOptions): HttpTransport {
  const ttlSec = options.ttlSec ?? 86_400;
  return async <T>(request: Parameters<HttpTransport>[0]) => {
    if (request.method !== 'GET') return transport<T>(request);
    const key = `meest:public:${request.url}:${JSON.stringify(request.query ?? {})}`;
    const hit = await options.cache.get<HttpResponse<T>>(key);
    if (hit !== undefined) return hit;
    const response = await transport<T>(request);
    if (response.status === 200) await options.cache.set(key, response, ttlSec);
    return response;
  };
}
