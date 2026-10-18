// code and comments in English
import { bearer, createClient, createFetchTransport, createHttpClient } from '@shopana/carrier-core';
import type { UkrposhtaPublicConfig } from './config';
import { ukrposhtaBaseUrls } from '../config';
import { mapUkrposhtaError } from '../errors';
import { ClassifierService } from './services/classifierService';
import type { UkrposhtaClassifierContext } from './services/classifierService';
import { TrackingService } from './services/trackingService';
import type { UkrposhtaTrackingContext } from './services/trackingService';

export * from './config';
export * from './services/trackingService';
export * from './services/classifierService';
export * from './types/tracking';
export * from './types/trackingEvents';
export * from './types/classifier';

function createPublicHttp(config: UkrposhtaPublicConfig, baseUrl: string) {
  return createHttpClient({
    carrier: 'ukrposhta',
    baseUrl: config.baseUrl ?? baseUrl,
    transport: config.transport ?? createFetchTransport(),
    auth: bearer(config.bearer),
    retry: config.retry,
    timeoutMs: config.timeoutMs,
    logger: config.logger,
    mapError: mapUkrposhtaError,
  });
}

/** Status-tracking client. Needs only the tracking bearer, no counterparty token. */
export function createUkrposhtaTrackingClient(config: UkrposhtaPublicConfig) {
  const baseUrl = ukrposhtaBaseUrls(config.environment ?? 'production').statusTracking;
  const ctx: UkrposhtaTrackingContext = { http: createPublicHttp(config, baseUrl), config };
  return createClient(ctx).use(new TrackingService());
}

/** Address classifier client. Needs only the eCom bearer, no counterparty token. */
export function createUkrposhtaClassifierClient(config: UkrposhtaPublicConfig) {
  const baseUrl = ukrposhtaBaseUrls(config.environment ?? 'production').addressClassifier;
  const ctx: UkrposhtaClassifierContext = { http: createPublicHttp(config, baseUrl), config };
  return createClient(ctx).use(new ClassifierService());
}
