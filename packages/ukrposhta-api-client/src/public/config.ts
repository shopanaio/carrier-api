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

/**
 * Config of `createUkrposhtaPublicClient`. The two services take different bearers, so each has its own; a service
 * whose bearer is missing sends no `Authorization` header and Ukrposhta answers 401. The other options are shared.
 */
export interface UkrposhtaPublicClientConfig extends Omit<UkrposhtaPublicConfig, 'bearer' | 'baseUrl'> {
  /** Status-tracking bearer. */
  trackingBearer?: Secret;
  /** eCom bearer, used by the address classifier. */
  classifierBearer?: Secret;
  /** Overrides the status-tracking base URL. */
  trackingBaseUrl?: string;
  /** Overrides the address classifier base URL. */
  classifierBaseUrl?: string;
}
