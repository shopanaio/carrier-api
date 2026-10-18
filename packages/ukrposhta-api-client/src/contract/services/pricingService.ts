// code and comments in English
import type { CallOptions } from '../types/common';
import type { DeliveryPrice, DeliveryPriceRequest, Tariff } from '../types/pricing';
import type { UkrposhtaContractContext } from './base';
import { WITHOUT_TOKEN } from './base';

/** Tariffs and price calculation (`/dictionaries/tariffs`, `/domestic/delivery-price`). Neither takes the counterparty token. */
export class PricingService {
  readonly namespace = 'pricing' as const;
  private ctx!: UkrposhtaContractContext;

  attach(ctx: UkrposhtaContractContext) {
    this.ctx = ctx;
  }

  /** `GET /dictionaries/tariffs`. */
  listTariffs(options: CallOptions = {}): Promise<Tariff[]> {
    return this.ctx.http.request<Tariff[]>({
      method: 'GET',
      path: '/dictionaries/tariffs',
      meta: WITHOUT_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /dictionaries/tariffs/{uuid}`. */
  getTariff(uuid: string, options: CallOptions = {}): Promise<Tariff> {
    return this.ctx.http.request<Tariff>({
      method: 'GET',
      path: '/dictionaries/tariffs/{uuid}',
      pathParams: { uuid },
      meta: WITHOUT_TOKEN,
      signal: options.signal,
    });
  }

  /**
   * `POST /domestic/delivery-price`: price of a shipment within Ukraine. Discounts of the contract are not applied
   * automatically here; pass them in `discounts` (the price of a created shipment includes them).
   */
  calculate(request: DeliveryPriceRequest, options: CallOptions = {}): Promise<DeliveryPrice> {
    return this.ctx.http.request<DeliveryPrice>({
      method: 'POST',
      path: '/domestic/delivery-price',
      json: request,
      // A calculation changes nothing, so a repeat after a 5xx is safe.
      idempotent: true,
      meta: WITHOUT_TOKEN,
      signal: options.signal,
    });
  }
}
