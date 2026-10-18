// code and comments in English
import { CountriesOperations } from '../generated/operations';
import type { PackageType } from '../generated/types';
import type { CallOptions } from '../types/common';
import type { DeliveryAvailability, DeliveryTypeAvailability, TransportType } from '../types/extra';
import { WITH_TOKEN } from './base';

/** Restrictions per country (international documentation, section 9): the snapshot operations plus availability. */
export class CountriesService extends CountriesOperations {
  /** `GET /countries/delivery-availability`: whether a package type goes to a country by a transport. */
  getDeliveryAvailability(
    params: { country: string; product: PackageType; type: TransportType },
    options: CallOptions = {},
  ): Promise<DeliveryAvailability> {
    return this.ctx.http.request<DeliveryAvailability>({
      method: 'GET',
      path: '/countries/delivery-availability',
      query: { country: params.country, product: params.product, type: params.type },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /countries/delivery-types-availability`: package types and transports available to a country. */
  getDeliveryTypesAvailability(country: string, options: CallOptions = {}): Promise<DeliveryTypeAvailability[]> {
    return this.ctx.http.request<DeliveryTypeAvailability[]>({
      method: 'GET',
      path: '/countries/delivery-types-availability',
      query: { country },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }
}
