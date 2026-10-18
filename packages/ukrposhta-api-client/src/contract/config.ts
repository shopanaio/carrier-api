// code and comments in English
import type { HttpLogger, HttpTransport, RetryOptions, Secret } from '@shopana/carrier-core';
import type { UkrposhtaEnvironment } from '../config';

export interface UkrposhtaContractConfig {
  transport: HttpTransport;
  environment?: UkrposhtaEnvironment;
  /** eCom bearer (`PRODUCTION_BEARER_eCom` / `SANDBOX_BEARER_eCom`). */
  bearer: Secret;
  /** Counterparty token (`PROD_COUNTERPARTY_TOKEN` / `SAND_COUNTERPARTY_TOKEN`), sent as `?token=`. */
  counterpartyToken: Secret;
  /** Overrides the eCom base URL. */
  baseUrl?: string;
  /** Overrides the forms base URL (stickers and printed forms). */
  formsBaseUrl?: string;
  retry?: RetryOptions | false;
  timeoutMs?: number;
  /** Receives one event per attempt; the bearer and the counterparty token are masked. */
  logger?: HttpLogger;
}
