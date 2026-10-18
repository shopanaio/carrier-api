// code and comments in English
import type { Money } from './money';
import type { Dimensions, Weight } from './units';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Address {
  /** ISO 3166-1 alpha-2, e.g. `UA`. */
  country: string;
  postalCode?: string;
  region?: string;
  district?: string;
  city?: string;
  /** Street lines as written by the customer. */
  lines?: string[];
  street?: string;
  building?: string;
  apartment?: string;
  geo?: GeoPoint;
  /**
   * Carrier-side identifiers that already resolve this address (Ukrposhta address id,
   * Meest city/branch UUID, Nova Poshta city/warehouse ref). Keyed by carrier slug.
   */
  carrierRefs?: Record<string, Record<string, string>>;
}

export interface Contact {
  name?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  company?: string;
  /** E.164 where possible, e.g. `+380501234567`. */
  phone?: string;
  email?: string;
}

/** Where the parcel is handed over or delivered: a door or a carrier location (branch, locker). */
export type DeliveryPoint =
  | { type: 'door'; address: Address }
  | { type: 'location'; locationId: string; address?: Address };

export interface Party {
  contact: Contact;
  point: DeliveryPoint;
  /** Stable id on the consumer side; adapters may use it to reuse carrier-side clients. */
  externalId?: string;
  taxId?: string;
}

export interface Parcel {
  weight: Weight;
  dimensions?: Dimensions;
  declaredValue?: Money;
  description?: string;
  reference?: string;
}

export interface CashOnDelivery {
  amount: Money;
  /** Who pays the COD transfer fee. */
  payer?: 'sender' | 'recipient';
}

export interface ShipmentOptions {
  cashOnDelivery?: CashOnDelivery;
  /** Who pays for delivery. Default: carrier default (usually sender). */
  payer?: 'sender' | 'recipient' | 'third_party';
  /** Carrier service/product code (`EXPRESS`, `STANDARD`, Meest `payType`, ...). */
  service?: string;
  /** ISO date `YYYY-MM-DD`. */
  shippingDate?: string;
  /** Carrier-specific extras passed through untouched. */
  extra?: Record<string, unknown>;
}

export interface CreateShipmentInput {
  sender: Party;
  recipient: Party;
  parcels: Parcel[];
  options?: ShipmentOptions;
  reference?: string;
  /** Idempotency key for carriers that support one. */
  idempotencyKey?: string;
}

export interface Shipment {
  /** Carrier's internal id (uuid, ref). */
  id: string;
  /** Number printed on the label and used for tracking. */
  trackingNumber: string;
  carrier: string;
  /** Per-parcel tracking numbers for multi-piece shipments. */
  parcelTrackingNumbers?: string[];
  status?: TrackingStatus;
  price?: Money;
  estimatedDeliveryDate?: string;
  createdAt?: string;
  /** Raw carrier response. */
  raw?: unknown;
}

export interface RateRequest {
  sender: Party;
  recipient: Party;
  parcels: Parcel[];
  options?: ShipmentOptions;
}

export interface Rate {
  carrier: string;
  service: string;
  serviceName?: string;
  total: Money;
  /** Breakdown: delivery, COD fee, insurance, ... */
  charges?: Array<{ type: string; amount: Money }>;
  transitDays?: { min?: number; max?: number };
  estimatedDeliveryDate?: string;
  raw?: unknown;
}

export type LabelFormat = 'PDF' | 'PNG' | 'ZPL' | 'EPL' | 'HTML';

export interface LabelRequest {
  shipmentId: string;
  trackingNumber?: string;
  format?: LabelFormat;
  /** Carrier paper size (`A4`, `A5`, `100x100`, ...). */
  size?: string;
}

export type Label =
  | { format: LabelFormat; encoding: 'binary'; data: Uint8Array; contentType: string; size?: string }
  | { format: LabelFormat; encoding: 'base64'; data: string; contentType: string; size?: string }
  | { format: LabelFormat; encoding: 'url'; data: string; contentType?: string; size?: string };

/** Normalized tracking statuses. The raw carrier code is always kept next to them. */
export const TRACKING_STATUSES = [
  'pre_transit',
  'in_transit',
  'out_for_delivery',
  'available_for_pickup',
  'delivered',
  'exception',
  'returned',
  'cancelled',
  'unknown',
] as const;

export type TrackingStatus = (typeof TRACKING_STATUSES)[number];

export function isTrackingStatus(value: unknown): value is TrackingStatus {
  return typeof value === 'string' && (TRACKING_STATUSES as readonly string[]).includes(value);
}

/** Terminal statuses: no further polling needed. */
export function isFinalTrackingStatus(status: TrackingStatus): boolean {
  return status === 'delivered' || status === 'returned' || status === 'cancelled';
}

export interface TrackingEvent {
  status: TrackingStatus;
  /** Carrier's own status/event code (Ukrposhta `event`, Nova Poshta `StatusCode`). */
  rawCode: string;
  rawDescription?: string;
  /** ISO 8601 timestamp. */
  occurredAt: string;
  location?: { name?: string; city?: string; postalCode?: string; country?: string };
}

export interface TrackingResult {
  trackingNumber: string;
  carrier: string;
  status: TrackingStatus;
  /** Oldest first. */
  events: TrackingEvent[];
  estimatedDeliveryDate?: string;
  /** False when the carrier does not know the number (yet). */
  found: boolean;
}

export interface Location {
  id: string;
  carrier: string;
  type: 'branch' | 'locker' | 'partner_point' | 'other';
  name: string;
  number?: string;
  address: Address;
  maxWeightKg?: number;
  openingHours?: Array<{ day: number; open: string; close: string }>;
  raw?: unknown;
}

export interface LocationQuery {
  postalCode?: string;
  city?: string;
  /** Carrier-side city id (Meest `city_id`, Nova Poshta city ref). */
  cityId?: string;
  near?: GeoPoint & { radiusKm?: number };
  type?: Location['type'];
  limit?: number;
}

export interface PickupRequest {
  shipmentIds: string[];
  address: Address;
  contact: Contact;
  /** ISO date and optional time window (`HH:mm`). */
  date: string;
  window?: { from: string; to: string };
}

export interface Pickup {
  id: string;
  carrier: string;
  date: string;
  status?: string;
  raw?: unknown;
}

export interface Manifest {
  id: string;
  carrier: string;
  shipmentIds: string[];
  document?: Label;
  raw?: unknown;
}

export interface AddressValidationResult {
  valid: boolean;
  normalized?: Address;
  suggestions?: Address[];
  messages?: string[];
}

export interface TransitTime {
  service: string;
  minDays?: number;
  maxDays?: number;
  estimatedDeliveryDate?: string;
}
