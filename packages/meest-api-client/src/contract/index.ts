// code and comments in English
import { createClient, createFetchTransport, createHttpClient, tokenAuth } from '@shopana/carrier-core';
import type { HttpTransport, RateLimitOptions, RateLimiter } from '@shopana/carrier-core';
import { MEEST_CONTRACT_BASE_URL, MEEST_DEFAULT_RATE_LIMIT } from './config';
import type { MeestContractConfig } from './config';
import { MEEST_CARRIER, mapError, unwrap } from './errors';
import { AuthService, toTokens } from './services/authService';
import type { ContractContext, MeestAuthApi } from './services/base';
import { MiscService } from './services/miscService';
import { ParcelsService } from './services/parcelsService';
import { PricingService } from './services/pricingService';
import { PrintService } from './services/printService';
import { RegistersService } from './services/registersService';
import { SearchService } from './services/searchService';
import { TrackingService } from './services/trackingService';
import type { AuthResult } from './types/generated';

export * from './config';
export * from './dates';
export { MEEST_CARRIER, toMeestError } from './errors';
export * from './services/base';
export { AuthService } from './services/authService';
export { MiscService } from './services/miscService';
export { ParcelsService } from './services/parcelsService';
export type { ParcelReturnMode, ParcelSearchBy } from './services/parcelsService';
export { PricingService } from './services/pricingService';
export { PrintService } from './services/printService';
export type { PrintFormat, Sticker100A4Options, Sticker100Options } from './services/printService';
export { RegistersService } from './services/registersService';
export type { TimeSlotType, TimeSlotsQuery } from './services/registersService';
export { SearchService } from './services/searchService';
export { TrackingService } from './services/trackingService';
export type { MeestInfo, MeestResponse } from './types/envelope';
export * from './types/generated';

/**
 * Client for the Meest contract API (openAPI v3.0). Logs in with `username`/`password`, keeps the token
 * for the lifetime Meest reports (`expiresIn`), refreshes it ahead of expiry and once more after a 401,
 * and throttles to the documented 100 requests per minute.
 *
 * Tokens are cached per account (base URL plus a hash of the username), so a shared `tokenStore` never hands
 * one account's token to another.
 */
export function createMeestContractClient(config: MeestContractConfig) {
  const baseUrl = config.baseUrl ?? MEEST_CONTRACT_BASE_URL;
  const transport: HttpTransport = config.transport ?? createFetchTransport();

  // Token endpoints go through a client without auth, retry or throttling; they keep the timeout and logger.
  const authHttp = createHttpClient({
    carrier: MEEST_CARRIER,
    baseUrl,
    transport,
    retry: false,
    ...(config.timeoutMs ? { timeoutMs: config.timeoutMs } : {}),
    ...(config.logger ? { logger: config.logger } : {}),
    unwrap,
    mapError,
  });
  const authApi: MeestAuthApi = {
    login: async signal =>
      toTokens(
        await authHttp.request<AuthResult>({
          method: 'POST',
          path: '/auth',
          json: { username: await resolve(config.username), password: await resolve(config.password) },
          ...(signal ? { signal } : {}),
        }),
      ),
    refresh: async (refreshToken, signal) =>
      toTokens(
        await authHttp.request<AuthResult>({
          method: 'POST',
          path: '/refreshToken',
          json: { refreshToken },
          ...(signal ? { signal } : {}),
        }),
      ),
  };

  const auth = tokenAuth({
    header: 'token',
    carrier: MEEST_CARRIER,
    key: async () => `meest:${baseUrl}:${await accountHash(await resolve(config.username))}`,
    ...(config.tokenStore ? { store: config.tokenStore } : {}),
    ...(config.refreshSkewSec !== undefined ? { refreshSkewMs: config.refreshSkewSec * 1000 } : {}),
    ...(config.loginTimeoutMs !== undefined ? { loginTimeoutMs: config.loginTimeoutMs } : {}),
    ...(config.clock ? { clock: config.clock } : {}),
    login: async ({ signal }) => {
      const t = await authApi.login(signal);
      return { accessToken: t.token, refreshToken: t.refreshToken, expiresInSec: t.expiresIn };
    },
    refresh: async (refreshToken, { signal }) => {
      const t = await authApi.refresh(refreshToken, signal);
      return { accessToken: t.token, refreshToken: t.refreshToken, expiresInSec: t.expiresIn };
    },
  });

  const http = createHttpClient({
    carrier: MEEST_CARRIER,
    baseUrl,
    transport,
    auth,
    ...(config.retry !== undefined
      ? { retry: config.retry }
      : config.clock || config.sleep
        ? { retry: { clock: config.clock, sleep: config.sleep } }
        : {}),
    ...(config.rateLimit === false
      ? {}
      : { rateLimit: withTime(config.rateLimit ?? MEEST_DEFAULT_RATE_LIMIT, config) }),
    ...(config.timeoutMs ? { timeoutMs: config.timeoutMs } : {}),
    ...(config.logger ? { logger: config.logger } : {}),
    unwrap,
    mapError,
  });

  const ctx: ContractContext = { http, config: { auth: authApi } };
  return createClient<ContractContext>(ctx)
    .use(new AuthService())
    .use(new SearchService())
    .use(new ParcelsService())
    .use(new PricingService())
    .use(new PrintService())
    .use(new TrackingService())
    .use(new RegistersService())
    .use(new MiscService());
}

export type MeestContractClient = ReturnType<typeof createMeestContractClient>;

async function resolve(secret: MeestContractConfig['username']): Promise<string> {
  return typeof secret === 'function' ? secret() : secret;
}

/** Plain limiter options pick up the virtual clock and sleep; a ready-made limiter is used as is. */
function withTime(limit: RateLimiter | RateLimitOptions, config: MeestContractConfig): RateLimiter | RateLimitOptions {
  if ('acquire' in limit || (!config.clock && !config.sleep)) return limit;
  return {
    ...limit,
    ...(config.clock ? { clock: config.clock } : {}),
    ...(config.sleep ? { sleep: config.sleep } : {}),
  };
}

/** Short SHA-256 digest of the login: tells accounts apart in a shared token store without storing the login itself. */
async function accountHash(username: string): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(username));
  return Array.from(new Uint8Array(digest).slice(0, 8), b => b.toString(16).padStart(2, '0')).join('');
}
