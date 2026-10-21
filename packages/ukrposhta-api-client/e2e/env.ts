import { createFetchTransport } from '@shopana/carrier-core';

/**
 * Sandbox credentials from the environment. A suite whose variables are missing is skipped, so running
 * the e2e command without credentials does nothing harmful.
 *
 *   UKRPOSHTA_SANDBOX_BEARER            eCom bearer (also used by the address classifier)
 *   UKRPOSHTA_SANDBOX_TOKEN             counterparty token
 *   UKRPOSHTA_SANDBOX_TRACKING_BEARER   status-tracking bearer
 *   UKRPOSHTA_TRACKING_BASE_URL         optional: tracking host when it differs from the default
 *   UKRPOSHTA_CLASSIFIER_BASE_URL       optional: classifier host when it differs from the default
 *   UKRPOSHTA_ECOM_BASE_URL             optional: eCom base URL when it differs from the sandbox
 *   UKRPOSHTA_FORMS_BASE_URL            optional: forms base URL when it differs from the sandbox
 *   UKRPOSHTA_KNOWN_BARCODE             optional: a barcode known to the tracking service
 *   UKRPOSHTA_SIMULATOR_URL             optional: Ukrposhta root of a carrier simulator, for example
 *                                       `http://localhost:4000/ukrposhta`; sets every base URL above
 *                                       that is not given explicitly. The keys are the environment's keys.
 */
const simulator = process.env.UKRPOSHTA_SIMULATOR_URL?.replace(/\/+$/, '');
const fromSimulator = (path: string) => (simulator ? `${simulator}${path}` : undefined);

export const env = {
  bearer: process.env.UKRPOSHTA_SANDBOX_BEARER,
  token: process.env.UKRPOSHTA_SANDBOX_TOKEN,
  trackingBearer: process.env.UKRPOSHTA_SANDBOX_TRACKING_BEARER,
  ecomBaseUrl: process.env.UKRPOSHTA_ECOM_BASE_URL ?? fromSimulator('/ecom/0.0.1'),
  formsBaseUrl: process.env.UKRPOSHTA_FORMS_BASE_URL ?? fromSimulator('/forms/ecom/0.0.1'),
  trackingBaseUrl: process.env.UKRPOSHTA_TRACKING_BASE_URL ?? fromSimulator('/status-tracking/0.0.1'),
  classifierBaseUrl: process.env.UKRPOSHTA_CLASSIFIER_BASE_URL ?? fromSimulator('/address-classifier-ws'),
  knownBarcode: process.env.UKRPOSHTA_KNOWN_BARCODE,
};

export const transport = createFetchTransport();

export const describeIf = (condition: unknown) => (condition ? describe : describe.skip);
