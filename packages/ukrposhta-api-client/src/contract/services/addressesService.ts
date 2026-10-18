// code and comments in English
import type { Address, AddressInput, RouteAvailability } from '../types/address';
import type { CallOptions } from '../types/common';
import { AddressesOperations } from '../generated/operations';
import { WITHOUT_TOKEN } from './base';

/** Addresses (`/addresses`). Addresses are created first and referenced by id from clients and shipments. */
export class AddressesService extends AddressesOperations {
  readonly namespace = 'addresses' as const;

  /** `POST /addresses`. The postcode is checked against the post office registry. */
  create(address: AddressInput, options: CallOptions = {}): Promise<Address> {
    return this.ctx.http.request<Address>({
      method: 'POST',
      path: '/addresses',
      json: address,
      meta: WITHOUT_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /addresses/{id}`. */
  get(id: number | string, options: CallOptions = {}): Promise<Address> {
    return this.ctx.http.request<Address>({
      method: 'GET',
      path: '/addresses/{id}',
      pathParams: { id },
      meta: WITHOUT_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /addresses/availability-checking/from/{a}/to/{b}`: whether a delivery route between two postcodes exists. */
  checkRoute(fromPostcode: string, toPostcode: string, options: CallOptions = {}): Promise<RouteAvailability> {
    return this.ctx.http.request<RouteAvailability>({
      method: 'GET',
      path: '/addresses/availability-checking/from/{from}/to/{to}',
      pathParams: { from: fromPostcode, to: toPostcode },
      meta: WITHOUT_TOKEN,
      signal: options.signal,
    });
  }

  /** `PUT /addresses/description/{id}`: the description is the only field that can change. */
  updateDescription(id: number | string, description: string, options: CallOptions = {}): Promise<Address> {
    return this.ctx.http.request<Address>({
      method: 'PUT',
      path: '/addresses/description/{id}',
      pathParams: { id },
      json: { description },
      meta: WITHOUT_TOKEN,
      signal: options.signal,
    });
  }
}
