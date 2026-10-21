// code and comments in English
import { apiKey, createClient, createHttpClient } from '@shopana/carrier-core';
import type { ClientContext } from '@shopana/carrier-core';
import { DEMOPOST_BASE_URLS } from './config';
import type { DemoPostContractConfig } from './config';
import { mapDemoPostError } from './errors';

export * from './config';
export * from './errors';
export * from './services/trackingService';

export type DemoPostContractContext = ClientContext<DemoPostContractConfig>;

/** Client for the credentialed Demo Post API. Add services with `.use(...)`. */
export function createDemoPostContractClient(config: DemoPostContractConfig) {
  const http = createHttpClient({
    carrier: 'demo-post',
    baseUrl: config.baseUrl ?? DEMOPOST_BASE_URLS[config.environment ?? 'production'],
    transport: config.transport,
    auth: apiKey({ in: 'header', name: 'Authorization', prefix: 'Bearer ', value: config.apiKey }),
    retry: config.retry,
    timeoutMs: config.timeoutMs,
    mapError: mapDemoPostError,
  });
  return createClient<DemoPostContractContext>({ http, config });
}
