// code and comments in English
import type { UkrposhtaDateTime } from './common';

/** Body of `POST /addresses`. Only `postcode` is required; it is checked against the post office registry. */
export interface AddressInput {
  /** Five digits: the delivery zone code from the address classifier. */
  postcode: string;
  region?: string;
  district?: string;
  city?: string;
  street?: string;
  houseNumber?: string;
  apartmentNumber?: string;
  description?: string;
  /** Military unit or place of imprisonment: such a recipient allows only STANDARD or DOCUMENT shipments. */
  specialDestination?: string;
  /** Mailbox number; street, house and apartment must stay empty. A mailbox cannot be a door (`..2D`) address. */
  mailbox?: string;
  /** Working elevator at the address; required when the shipment asks for lifting to the floor. */
  lift?: boolean;
  floor?: number;
  /** International shipments only. */
  foreignStreetHouseApartment?: string;
  country?: string;
}

export interface Address extends AddressInput {
  id: number;
  countryside: boolean;
  detailedInfo: string;
  created: UkrposhtaDateTime;
  lastModified: UkrposhtaDateTime;
  ddCode?: string | null;
}

/** Answer of `GET /addresses/availability-checking/from/{a}/to/{b}`. */
export interface RouteAvailability {
  code: string;
  description: string;
  /** Location of the mobile post office: 1 absent, 2 village council, ... 9 other. */
  mrtps?: string;
}
