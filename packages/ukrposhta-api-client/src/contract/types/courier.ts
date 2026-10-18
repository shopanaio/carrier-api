// code and comments in English
import type { UkrposhtaDateTime } from './common';

/** The courier arrives within this window. */
export type CourierInterval = 'INTERVAL_09_12' | 'INTERVAL_12_15' | 'INTERVAL_15_18';

export type CourierOrderType = 'SINGLE' | 'MASS';

export type CourierOrderStatus =
  | 'CREATED'
  | 'ORDERED'
  | 'TO_PERFORM'
  | 'TRANSFERRED_TO_COURIER'
  | 'DONE'
  | 'POSTPONED'
  | 'DENIED'
  | 'NOT_DELIVERED';

/** Body of `POST /courier-service/orders`. At least one barcode list is required. */
export interface CourierOrderInput {
  /** Uuid of the sender client. */
  clientUuid: string;
  type: CourierOrderType;
  /** Id of the sender's address the courier comes to. */
  addressId: number;
  /** Id of one of the sender's phones (`ClientPhone.phoneId`). */
  phoneId: number;
  /** `YYYY-MM-DD`. */
  dropDate: string;
  interval: CourierInterval;
  shipmentBarcodes?: string[];
  letterBarcodes?: string[];
  email?: string;
}

export interface CourierOrder extends CourierOrderInput {
  uuid: string;
  orderNumber: number;
  lastStatus: CourierOrderStatus;
  lastStatusDate: UkrposhtaDateTime;
  /** Known after the status reaches `TRANSFERRED_TO_COURIER`. */
  courierLastName?: string | null;
  courierFirstName?: string | null;
  courierMiddleName?: string | null;
  courierPhoneNumber?: string | null;
  carNumber?: string | null;
  carType?: string | null;
}

export interface CourierOrderStatusEntry {
  uuid: string;
  orderUuid: string;
  statusDate: UkrposhtaDateTime;
  orderStatus: CourierOrderStatus;
}
