// code and comments in English
import { bearer, composeAuth, createClient, createHttpClient, queryParam, when } from '@shopana/carrier-core';
import type { AuthStrategy, HttpClient } from '@shopana/carrier-core';
import { ukrposhtaBaseUrls } from '../config';
import { mapUkrposhtaError } from '../errors';
import type { UkrposhtaContractConfig } from './config';
import type { UkrposhtaContractContext } from './services/base';

export * from './config';
export type { UkrposhtaContractContext } from './services/base';
export * from './services/addressesService';
export * from './services/clientsService';
export * from './services/shipmentsService';
export * from './services/pricingService';
export * from './services/shipmentGroupsService';
export * from './services/labelsService';
export * from './services/courierService';
export * from './services/managementService';
export * from './services/transfersService';
export * from './services/barcodesService';
export * from './services/referenceService';
export * from './types/common';
export * from './types/address';
export * from './types/client';
export * from './types/shipment';
export * from './types/pricing';
export * from './types/group';
export * from './types/reference';
export * from './types/courier';
export * from './types/management';

/**
 * Bearer in the header; the counterparty token in the query of the operations that take it
 * (marked with `meta.counterpartyToken` in the services).
 */
function createAuth(config: UkrposhtaContractConfig): AuthStrategy {
  return composeAuth(
    bearer(config.bearer),
    when(request => request.meta?.counterpartyToken === true, queryParam('token', config.counterpartyToken)),
  );
}

function createHttp(config: UkrposhtaContractConfig, baseUrl: string): HttpClient {
  return createHttpClient({
    carrier: 'ukrposhta',
    baseUrl,
    transport: config.transport,
    auth: createAuth(config),
    retry: config.retry,
    timeoutMs: config.timeoutMs,
    mapError: mapUkrposhtaError,
    // Both the bearer and the counterparty token are credentials.
    logger: config.logger,
    // `senderToken` is the counterparty token again, inside the body of the return order.
    redact: { keys: ['token', 'senderToken'] },
  });
}

/**
 * Client for the credentialed eCom API and the forms service. Add the services you need with `.use(...)`:
 * `createUkrposhtaContractClient(config).use(new ShipmentsService()).use(new LabelsService())`.
 */
export function createUkrposhtaContractClient(config: UkrposhtaContractConfig) {
  const urls = ukrposhtaBaseUrls(config.environment ?? 'production');
  const ctx: UkrposhtaContractContext = {
    http: createHttp(config, config.baseUrl ?? urls.ecom),
    forms: createHttp(config, config.formsBaseUrl ?? urls.forms),
    config,
  };
  return createClient(ctx);
}
