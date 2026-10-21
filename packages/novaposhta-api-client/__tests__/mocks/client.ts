import type { HttpTransport } from '@shopana/carrier-core';
import { createClient as createCoreClient } from '../../src/core/client';
import { createNovaPoshtaContext } from '../../src/config';
import type { System } from '../../src/types/base';

/** Test client over a scripted transport; retries are off so each call hits the transport once. */
export function createClient(options: { transport: HttpTransport; baseUrl: string; apiKey?: string; system?: System }) {
  return createCoreClient(createNovaPoshtaContext({ ...options, retry: false }));
}
