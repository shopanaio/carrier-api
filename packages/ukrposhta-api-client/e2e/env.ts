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
 *   UKRPOSHTA_KNOWN_BARCODE             optional: a barcode known to the tracking service
 */
export const env = {
  bearer: process.env.UKRPOSHTA_SANDBOX_BEARER,
  token: process.env.UKRPOSHTA_SANDBOX_TOKEN,
  trackingBearer: process.env.UKRPOSHTA_SANDBOX_TRACKING_BEARER,
  trackingBaseUrl: process.env.UKRPOSHTA_TRACKING_BASE_URL,
  classifierBaseUrl: process.env.UKRPOSHTA_CLASSIFIER_BASE_URL,
  knownBarcode: process.env.UKRPOSHTA_KNOWN_BARCODE,
};

export const transport = createFetchTransport();

export const describeIf = (condition: unknown) => (condition ? describe : describe.skip);
