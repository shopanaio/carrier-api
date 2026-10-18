// code and comments in English

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
