// code and comments in English
import type { HttpLogger, HttpTransport, RateLimitOptions, RateLimiter, RetryOptions } from '@shopana/carrier-core';
import type { ReferenceCache } from './cache';

export const MEEST_PUBLIC_BASE_URL = 'https://publicapi.meest.com';

export interface MeestPublicConfig {
  baseUrl?: string;
  transport: HttpTransport;
  /** Retry policy for GET calls; `false` disables. Default: carrier-core defaults. */
  retry?: RetryOptions | false;
  rateLimit?: RateLimiter | RateLimitOptions;
  timeoutMs?: number;
  logger?: HttpLogger;
  /** Store for registers and lookups; without it every call goes to the network. */
  cache?: ReferenceCache;
  /** Cache lifetime in seconds. Default 86400 (the registers change at most daily). */
  cacheTtlSec?: number;
}

/** What services see through `ctx.config`. */
export interface MeestPublicContextConfig {
  cache?: ReferenceCache;
  cacheTtlSec: number;
}

export const DEFAULT_CACHE_TTL_SEC = 86_400;
