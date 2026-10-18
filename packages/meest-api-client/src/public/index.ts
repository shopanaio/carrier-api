// code and comments in English
import { createClient, createFetchTransport, createHttpClient, noAuth } from '@shopana/carrier-core';
import { MEEST_PUBLIC_BASE_URL } from './config';
import type { MeestPublicConfig } from './config';
import { MEEST_PUBLIC_CARRIER } from './errors';
import { BranchesService } from './services/branchesService';
import { GeoService } from './services/geoService';
import type { PublicContext } from './services/base';

export * from './types';
export * from './cache';
export * from './config';
export { MEEST_PUBLIC_CARRIER, isMeestNotFound, unwrapMeestPublic } from './errors';
export { BranchesService } from './services/branchesService';
export { GeoService } from './services/geoService';

/**
 * Client for the Meest public API (publicapi.meest.com): no credentials, GET only.
 * `{ geo, branches }`: registers of localities and branches, single branch, nearest-branch lookups.
 */
export function createMeestPublicClient(config: Partial<MeestPublicConfig> = {}) {
  const http = createHttpClient({
    carrier: MEEST_PUBLIC_CARRIER,
    baseUrl: config.baseUrl ?? MEEST_PUBLIC_BASE_URL,
    transport: config.transport ?? createFetchTransport(),
    auth: noAuth(),
    ...(config.retry !== undefined ? { retry: config.retry } : {}),
    ...(config.rateLimit ? { rateLimit: config.rateLimit } : {}),
    ...(config.timeoutMs ? { timeoutMs: config.timeoutMs } : {}),
    ...(config.logger ? { logger: config.logger } : {}),
  });
  const ctx: PublicContext = { http, config: {} };
  return createClient<PublicContext>(ctx).use(new GeoService()).use(new BranchesService());
}

export type MeestPublicClient = ReturnType<typeof createMeestPublicClient>;
