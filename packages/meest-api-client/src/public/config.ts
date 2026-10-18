// code and comments in English
import type { HttpLogger, HttpTransport, RateLimitOptions, RateLimiter, RetryOptions } from '@shopana/carrier-core';

export const MEEST_PUBLIC_BASE_URL = 'https://publicapi.meest.com';

export interface MeestPublicConfig {
  baseUrl?: string;
  /** Default: fetch. Custom transport (tests, proxies). */
  transport?: HttpTransport;
  /** Retry policy for GET calls; `false` disables. Default: carrier-core defaults. */
  retry?: RetryOptions | false;
  /** Optional client-side limiter. None by default. */
  rateLimit?: RateLimiter | RateLimitOptions;
  timeoutMs?: number;
  logger?: HttpLogger;
}
