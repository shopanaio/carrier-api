// code and comments in English
import { createFetchTransport, createHttpClient } from '@shopana/carrier-core';
import type { HttpLogger, HttpTransport, RateLimitOptions, RateLimiter, RetryOptions } from '@shopana/carrier-core';
import { RATE_LIMIT_ERROR_CODE } from './core/client';
import type { ClientContext } from './core/client';
import type { NovaPoshtaResponse, System } from './types/base';
import { AddressService } from './services/addressService';
import { ContactPersonService } from './services/contactPersonService';
import { CounterpartyService } from './services/counterpartyService';
import { ReferenceService } from './services/referenceService';
import { TrackingService } from './services/trackingService';
import { WaybillService } from './services/waybillService';
import { createClient } from './core/client';

export const NOVA_POSHTA_BASE_URL = 'https://api.novaposhta.ua/v2.0/json/';

export interface NovaPoshtaConfig {
  apiKey?: string;
  system?: System;
  /** Default `https://api.novaposhta.ua/v2.0/json/`. */
  baseUrl?: string;
  /** Default: the fetch transport of carrier-core. */
  transport?: HttpTransport;
  /**
   * Retry policy; `false` disables. Defaults to two retries with a 1 s base delay.
   * API-level rate limiting (error code 20000401501 in a 200 body) is always retried while retries remain.
   */
  retry?: RetryOptions | false;
  rateLimit?: RateLimiter | RateLimitOptions;
  /** Per-call deadline, retries included. */
  timeoutMs?: number;
  logger?: HttpLogger;
}

function isRateLimited(data: unknown): boolean {
  const codes = (data as Partial<NovaPoshtaResponse> | null | undefined)?.errorCodes;
  return Array.isArray(codes) && codes.includes(RATE_LIMIT_ERROR_CODE);
}

/** Builds the carrier-core context used by every service. */
export function createNovaPoshtaContext(config: NovaPoshtaConfig = {}): ClientContext {
  const retry =
    config.retry === false
      ? false
      : { maxRetries: 2, baseDelayMs: 1000, ...config.retry, shouldRetryResponse: (response: { data: unknown }) => isRateLimited(response.data) };
  return {
    http: createHttpClient({
      carrier: 'novaposhta',
      baseUrl: config.baseUrl ?? NOVA_POSHTA_BASE_URL,
      transport: config.transport ?? createFetchTransport(),
      retry,
      rateLimit: config.rateLimit,
      timeoutMs: config.timeoutMs,
      logger: config.logger,
      redact: { keys: ['apiKey'] },
    }),
    config: { apiKey: config.apiKey, system: config.system },
  };
}

/** Client with every service mounted: `address`, `reference`, `tracking`, `waybill`, `counterparty`, `contactPerson`. */
export function createNovaPoshtaClient(config: NovaPoshtaConfig = {}) {
  return createClient(createNovaPoshtaContext(config))
    .use(new AddressService())
    .use(new ReferenceService())
    .use(new TrackingService())
    .use(new WaybillService())
    .use(new CounterpartyService())
    .use(new ContactPersonService());
}

export type NovaPoshtaClient = ReturnType<typeof createNovaPoshtaClient>;
