// code and comments in English
import type { PackageType } from '../generated/types';
import type { LifecycleStatus, ShipmentType, UkrposhtaDateTime } from './common';

export interface ShipmentGroupInput {
  name: string;
  /** Uuid of the sender client. */
  clientUuid?: string;
  /** EXPRESS by default; a group holds shipments of one type. International groups use `INTERNATIONAL`. */
  type?: ShipmentType;
  /** International groups: the package type of the shipments the group takes (`PARCEL` takes only parcels). */
  packageType?: PackageType;
}

export interface ShipmentGroup {
  uuid: string;
  name: string;
  type: ShipmentType;
  packageType?: PackageType | null;
  clientUuid: string;
  counterpartyUuid: string;
  counterpartyRegcode: string;
  created: UkrposhtaDateTime;
  /** Seventeen digits printed on form 103a. */
  barcode_g_id: string;
  byCourier: boolean;
  /** Closed at registration of the shipments in a post office: no more changes. */
  closed: boolean;
}

/** Per-item result of the mass add endpoints (HTTP 207 when some failed). */
export interface GroupAddResult {
  targetUuid?: string;
  targetBarcode?: string;
  httpStatus: number;
  message: string;
}

export interface GroupShipmentsCount {
  message: string;
  quantity: number;
}

export interface GroupShipmentsQuery {
  /** One status or several. */
  status?: LifecycleStatus | LifecycleStatus[];
  /** Page size and page number (from 1). The sort and filter modifiers work only together with both. */
  size?: number;
  page?: number;
  /** Fields to sort by, e.g. `['deliveryPrice', 'weight']`. */
  sort?: string[];
  order?: 'asc' | 'desc';
  /** `NONREGISTERED` keeps only shipments not yet registered at a post office. */
  statusesGroup?: 'ALL' | 'NONREGISTERED';
}
