// code and comments in English
import type { HttpTransport, RetryOptions } from '@shopana/carrier-core';

export const DEMOPOST_PUBLIC_BASE_URL = 'https://api.demo-post.example/v1/public';

export interface DemoPostPublicConfig {
  transport: HttpTransport;
  baseUrl?: string;
  retry?: RetryOptions | false;
  timeoutMs?: number;
}
