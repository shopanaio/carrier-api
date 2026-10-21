// code and comments in English
import { bearer, createClient, createFetchTransport, createHttpClient, noAuth } from '@shopana/carrier-core';
import type { UkrposhtaPublicClientConfig, UkrposhtaPublicConfig } from './config';
import type { Secret } from '@shopana/carrier-core';
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
export * from './types/classifier';

type SharedConfig = Omit<UkrposhtaPublicConfig, 'bearer' | 'baseUrl'>;

function createPublicHttp(config: SharedConfig, baseUrl: string, token: Secret | undefined) {
  return createHttpClient({
    carrier: 'ukrposhta',
    baseUrl,
    transport: config.transport ?? createFetchTransport(),
    auth: token === undefined ? noAuth() : bearer(token),
    retry: config.retry,
    timeoutMs: config.timeoutMs,
    logger: config.logger,
    mapError: mapUkrposhtaError,
  });
}

function trackingService(config: SharedConfig, baseUrl: string | undefined, token: Secret | undefined) {
  const url = baseUrl ?? ukrposhtaBaseUrls(config.environment ?? 'production').statusTracking;
  const ctx: UkrposhtaTrackingContext = {
    http: createPublicHttp(config, url, token),
    config: config as UkrposhtaPublicConfig,
  };
  return createClient(ctx).use(new TrackingService());
}

function classifierService(config: SharedConfig, baseUrl: string | undefined, token: Secret | undefined) {
  const url = baseUrl ?? ukrposhtaBaseUrls(config.environment ?? 'production').addressClassifier;
  const ctx: UkrposhtaClassifierContext = {
    http: createPublicHttp(config, url, token),
    config: config as UkrposhtaPublicConfig,
  };
  return createClient(ctx).use(new ClassifierService());
}

/** Status-tracking client. Needs only the tracking bearer, no counterparty token. */
export function createUkrposhtaTrackingClient(config: UkrposhtaPublicConfig) {
  return trackingService(config, config.baseUrl, config.bearer);
}

/** Address classifier client. Needs only the eCom bearer, no counterparty token. */
export function createUkrposhtaClassifierClient(config: UkrposhtaPublicConfig) {
  return classifierService(config, config.baseUrl, config.bearer);
}

/**
 * One client for both public services: `{ tracking, classifier }`. The services take different bearers
 * (`trackingBearer`, `classifierBearer`); a service without one sends no `Authorization` header. The other options are
 * shared. `createUkrposhtaTrackingClient` and `createUkrposhtaClassifierClient` build one service each.
 */
export function createUkrposhtaPublicClient(config: UkrposhtaPublicClientConfig = {}) {
  const { trackingBearer, classifierBearer, trackingBaseUrl, classifierBaseUrl, ...shared } = config;
  return {
    tracking: trackingService(shared, trackingBaseUrl, trackingBearer).tracking,
    classifier: classifierService(shared, classifierBaseUrl, classifierBearer).classifier,
  };
}

export type UkrposhtaPublicClient = ReturnType<typeof createUkrposhtaPublicClient>;
