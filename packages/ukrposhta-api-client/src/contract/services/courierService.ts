// code and comments in English
import type { CallOptions } from '../types/common';
import type { CourierOrder, CourierOrderInput, CourierOrderStatusEntry } from '../types/courier';
import { CourierOperations } from '../generated/operations';
import { WITH_TOKEN } from './base';

/**
 * Courier collection (`/courier-service`): a courier picks the shipments up at the sender's address.
 * The operator calls the sender to confirm; hand the shipments and their documents to the courier.
 * A DOCUMENT shipment with a list of enclosed items cannot be ordered for pickup.
 */
export class CourierService extends CourierOperations {
  readonly namespace = 'courier' as const;

  /** `POST /courier-service/orders`. */
  createOrder(order: CourierOrderInput, options: CallOptions = {}): Promise<CourierOrder> {
    return this.ctx.http.request<CourierOrder>({
      method: 'POST',
      path: '/courier-service/orders',
      json: order,
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /courier-service/orders/{orderUuid}`. */
  getOrder(orderUuid: string, options: CallOptions = {}): Promise<CourierOrder> {
    return this.ctx.http.request<CourierOrder>({
      method: 'GET',
      path: '/courier-service/orders/{orderUuid}',
      pathParams: { orderUuid },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /clients/{clientUuid}/courier-delivery-orders`. */
  listOrders(clientUuid: string, options: CallOptions = {}): Promise<CourierOrder[]> {
    return this.ctx.http.request<CourierOrder[]>({
      method: 'GET',
      path: '/clients/{clientUuid}/courier-delivery-orders',
      pathParams: { clientUuid },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /courier-service/orders/{orderUuid}/statuses`: the status history of an order. */
  getStatuses(orderUuid: string, options: CallOptions = {}): Promise<CourierOrderStatusEntry[]> {
    return this.ctx.http.request<CourierOrderStatusEntry[]>({
      method: 'GET',
      path: '/courier-service/orders/{orderUuid}/statuses',
      pathParams: { orderUuid },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }
}
