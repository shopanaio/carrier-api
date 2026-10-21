// code and comments in English
import { createClient, createHttpClient, noAuth } from '@shopana/carrier-core';
import type { ClientContext } from '@shopana/carrier-core';
import { DEMOPOST_PUBLIC_BASE_URL } from './config';
import type { DemoPostPublicConfig } from './config';

export * from './config';

export type DemoPostPublicContext = ClientContext<DemoPostPublicConfig>;

/** Client for the Demo Post API that needs no contract credentials. Add services with `.use(...)`. */
export function createDemoPostPublicClient(config: DemoPostPublicConfig) {
  const http = createHttpClient({
    carrier: 'demo-post',
    baseUrl: config.baseUrl ?? DEMOPOST_PUBLIC_BASE_URL,
    transport: config.transport,
    auth: noAuth(),
    retry: config.retry,
    timeoutMs: config.timeoutMs,
  });
  return createClient<DemoPostPublicContext>({ http, config });
}
