// code and comments in English
export type UkrposhtaEnvironment = 'production' | 'sandbox';

/** Hosts of the Ukrposhta API. The sandbox host is dev.ukrposhta.ua (separate bearer and counterparty token). */
export const UKRPOSHTA_HOSTS: Record<UkrposhtaEnvironment, string> = {
  production: 'https://www.ukrposhta.ua',
  sandbox: 'https://dev.ukrposhta.ua',
};

export const UKRPOSHTA_API_VERSION = '0.0.1';

/** Base URLs per service. `statusTracking` and `addressClassifier` have no documented sandbox: override with `baseUrl`. */
export function ukrposhtaBaseUrls(environment: UkrposhtaEnvironment) {
  const host = UKRPOSHTA_HOSTS[environment];
  return {
    ecom: `${host}/ecom/${UKRPOSHTA_API_VERSION}`,
    forms: `${host}/forms/ecom/${UKRPOSHTA_API_VERSION}`,
    statusTracking: `${host}/status-tracking/${UKRPOSHTA_API_VERSION}`,
    // The classifier documentation requires the www host.
    addressClassifier: `${host}/address-classifier-ws`,
  } as const;
}
