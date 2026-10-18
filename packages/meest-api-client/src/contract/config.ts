// code and comments in English
import type {
  Clock,
  HttpLogger,
  HttpTransport,
  RateLimitOptions,
  RateLimiter,
  RetryOptions,
  Secret,
  Sleep,
  TokenStore,
} from '@shopana/carrier-core';

export const MEEST_CONTRACT_BASE_URL = 'https://api.meest.com/v3.0/openAPI';

export interface MeestContractConfig {
  /** Account login issued with the contract. */
  username: Secret;
  password: Secret;
  /** Default `https://api.meest.com/v3.0/openAPI`. The collection documents no sandbox; ask Meest and pass its URL here. */
  baseUrl?: string;
  /** Default: fetch. Custom transport (tests, proxies). */
  transport?: HttpTransport;
  /** Share tokens between processes (Redis, KV). Entries are keyed by base URL and a hash of the login. Default: in-memory per client. */
  tokenStore?: TokenStore;
  /** Renew the token this many seconds before it expires. */
  refreshSkewSec?: number;
  /** Upper bound for one login or refresh call. Default 30 s. */
  loginTimeoutMs?: number;
  /** Retry policy; `false` disables. Non-idempotent calls (parcel creation) are never repeated after a 5xx. */
  retry?: RetryOptions | false;
  /** Optional client-side limiter. None by default; Meest documents 100 requests per minute per user. */
  rateLimit?: RateLimiter | RateLimitOptions;
  /** Per-call deadline, also applied to login and refresh. */
  timeoutMs?: number;
  logger?: HttpLogger;
  /** Virtual time for tests. */
  clock?: Clock;
  sleep?: Sleep;
}
