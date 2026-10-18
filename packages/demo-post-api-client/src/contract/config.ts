// code and comments in English
import type { HttpTransport, RetryOptions, Secret } from '@shopana/carrier-core';

export type DemoPostEnvironment = 'production' | 'sandbox';

export const DEMOPOST_BASE_URLS: Record<DemoPostEnvironment, string> = {
  production: 'https://api.demo-post.example/v1',
  sandbox: 'https://sandbox.api.demo-post.example/v1',
};

export interface DemoPostContractConfig {
  transport: HttpTransport;
  environment?: DemoPostEnvironment;
  /** Overrides the environment's base URL. */
  baseUrl?: string;
  apiKey: Secret;
  retry?: RetryOptions | false;
  timeoutMs?: number;
}
