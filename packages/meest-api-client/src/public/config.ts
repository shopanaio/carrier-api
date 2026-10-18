// code and comments in English
import type { HttpLogger, HttpTransport, RateLimitOptions, RateLimiter, RetryOptions } from '@shopana/carrier-core';

export const MEEST_PUBLIC_BASE_URL = 'https://publicapi.meest.com';

export interface MeestPublicConfig {
  baseUrl?: string;
  /** Default: fetch. Wrap it with `withReferenceCache` to keep the large registers between calls. */
  transport: HttpTransport;
  /** Retry policy for GET calls; `false` disables. Default: carrier-core defaults. */
  retry?: RetryOptions | false;
  rateLimit?: RateLimiter | RateLimitOptions;
  timeoutMs?: number;
  logger?: HttpLogger;
}
