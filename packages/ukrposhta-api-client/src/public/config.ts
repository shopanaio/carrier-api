// code and comments in English
import type { HttpLogger, HttpTransport, RetryOptions, Secret } from '@shopana/carrier-core';
import type { UkrposhtaEnvironment } from '../config';

export interface UkrposhtaPublicConfig {
  /** Defaults to the fetch transport of carrier-core. */
  transport?: HttpTransport;
  environment?: UkrposhtaEnvironment;
  /** Overrides the service's base URL. */
  baseUrl?: string;
  /** Service bearer: the status-tracking bearer for tracking, the eCom bearer for the address classifier. */
  bearer: Secret;
  retry?: RetryOptions | false;
  timeoutMs?: number;
  /** Receives one event per attempt; the bearer is masked. */
  logger?: HttpLogger;
}
