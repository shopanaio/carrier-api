// code and comments in English
import type { DeliveryType } from './common';
import type { ClientRef } from './shipment';

/** Body of `POST /shipments/management/{uuid}/forward`: a new recipient (a client created earlier) and delivery type. */
export interface ForwardRequest {
  recipient: ClientRef;
  deliveryType: DeliveryType;
}

/** Body of `POST /dispatch/return-order`. */
export interface ReturnOrderRequest {
  /** Barcode of the registered shipment. */
  barcode: string;
  /** Id of the sender's address to return the shipment to. */
  returnAddressId: number | string;
}

export interface ReturnOrderAnswer {
  response: { orders: Array<{ extr_guid_order: string; order_id: number }> };
  status: { code: number };
}
