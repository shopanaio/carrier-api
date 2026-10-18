// code and comments in English
import {
  bearer,
  composeAuth,
  createClient,
  createFetchTransport,
  createHttpClient,
  queryParam,
  when,
} from '@shopana/carrier-core';
import type { AuthStrategy, HttpClient } from '@shopana/carrier-core';
import { ukrposhtaBaseUrls } from '../config';
import { mapUkrposhtaError } from '../errors';
import type { UkrposhtaContractConfig } from './config';
import { AddressesService } from './services/addressesService';
import type { UkrposhtaContractContext } from './services/base';
import { BarcodesService } from './services/barcodesService';
import { ClientsService } from './services/clientsService';
import { CourierService } from './services/courierService';
import { DeliveryNotificationsService } from './services/deliveryNotificationsService';
import { LabelsService } from './services/labelsService';
import { ManagementService } from './services/managementService';
import { PricingService } from './services/pricingService';
import { ReferenceService } from './services/referenceService';
import { ShipmentGroupsService } from './services/shipmentGroupsService';
import { ShipmentsService } from './services/shipmentsService';
import { TransfersService } from './services/transfersService';
import { DocumentBackOperations } from './generated/operations';
import { CountriesService } from './services/countriesService';
import { LettersService } from './services/lettersService';
import { PaymentsService } from './services/paymentsService';

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
export * from './services/deliveryNotificationsService';
export * from './services/lettersService';
export * from './services/countriesService';
export * from './services/paymentsService';
export { GENERATED_OPERATIONS } from './generated/operations';
export type { OperationInfo } from './generated/operations';
export * as ApiTypes from './generated/types';
export * from './types/common';
export * from './types/address';
export * from './types/client';
export * from './types/shipment';
export * from './types/pricing';
export * from './types/group';
export * from './types/reference';
export * from './types/courier';
export * from './types/management';
export * from './types/extra';

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
    transport: config.transport ?? createFetchTransport(),
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
 * Client for the credentialed eCom API and the forms service, with every service mounted:
 * `addresses`, `clients`, `shipments`, `pricing`, `shipmentGroups`, `labels`, `courier`, `management`, `transfers`,
 * `barcodes`, `reference`, `deliveryNotifications`, `documentBack`, `letters`, `countries`, `payments`.
 * Uses the fetch transport of carrier-core unless `transport` is given.
 */
export function createUkrposhtaContractClient(config: UkrposhtaContractConfig) {
  const urls = ukrposhtaBaseUrls(config.environment ?? 'production');
  const ctx: UkrposhtaContractContext = {
    http: createHttp(config, config.baseUrl ?? urls.ecom),
    forms: createHttp(config, config.formsBaseUrl ?? urls.forms),
    config,
  };
  return createClient(ctx)
    .use(new AddressesService())
    .use(new ClientsService())
    .use(new ShipmentsService())
    .use(new PricingService())
    .use(new ShipmentGroupsService())
    .use(new LabelsService())
    .use(new CourierService())
    .use(new ManagementService())
    .use(new TransfersService())
    .use(new BarcodesService())
    .use(new ReferenceService())
    .use(new DeliveryNotificationsService())
    .use(new DocumentBackOperations())
    .use(new LettersService())
    .use(new CountriesService())
    .use(new PaymentsService());
}

export type UkrposhtaContractClient = ReturnType<typeof createUkrposhtaContractClient>;
