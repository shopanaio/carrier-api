// code and comments in English
import { moneyToNumber, toCm, toKg } from '@shopana/carrier-contracts';
import type {
  Address as CanonicalAddress,
  Parcel as CanonicalParcel,
  Contact,
  Money,
  Party,
} from '@shopana/carrier-contracts';
import type { Address, AddressInput } from '../contract/types/address';
import type { Client, ClientAddress, ClientInput } from '../contract/types/client';
import type { DeliveryType, LifecycleStatus, ShipmentType } from '../contract/types/common';
import type { ParcelInput } from '../contract/types/shipment';
import type { TrackingStatus } from '@shopana/carrier-contracts';
import { invalidInput } from './errors';

export const SHIPMENT_TYPES: readonly ShipmentType[] = ['EXPRESS', 'STANDARD', 'DOCUMENT', 'CARGO'];

/** `options.service` → shipment type. Express by default. */
export function shipmentTypeOf(service: string | undefined): ShipmentType {
  if (service === undefined || service === '') return 'EXPRESS';
  const type = service.toUpperCase() as ShipmentType;
  if (!SHIPMENT_TYPES.includes(type)) {
    throw invalidInput(`Unknown service "${service}": use ${SHIPMENT_TYPES.join(', ')}`, 'options.service');
  }
  return type;
}

export const SERVICE_NAMES: Record<ShipmentType, string> = {
  EXPRESS: 'Ukrposhta Express',
  STANDARD: 'Ukrposhta Standard',
  DOCUMENT: 'Ukrposhta Document',
  CARGO: 'Ukrposhta Cargo',
};

/** UAH amount as a number; Ukrposhta prices everything in hryvnia. */
export function uah(value: Money, field: string): number {
  if (value.currency !== 'UAH') throw invalidInput(`Ukrposhta works in UAH, got ${value.currency}`, field);
  return moneyToNumber(value);
}

/** Weight in grams, at least 1. */
export function gramsOf(parcel: CanonicalParcel): number {
  const grams = Math.round(toKg(parcel.weight) * 1000);
  if (!(grams > 0)) throw invalidInput('Parcel weight must be greater than zero', 'parcels.weight');
  return grams;
}

/** The API's `length` is the longest side; the other two go to `width` and `height`. */
export function sizesOf(parcel: CanonicalParcel): Pick<ParcelInput, 'length' | 'width' | 'height'> | undefined {
  if (!parcel.dimensions) return undefined;
  const cm = toCm(parcel.dimensions);
  const [length, width, height] = [cm.length, cm.width, cm.height]
    .map(side => Math.max(1, Math.ceil(side)))
    .sort((a, b) => b - a) as [number, number, number];
  return { length, width, height };
}

export function toParcelInput(parcel: CanonicalParcel): ParcelInput {
  const sizes = sizesOf(parcel);
  return {
    weight: gramsOf(parcel),
    // Without dimensions the API still needs a length; 1 cm keeps the weight tariff.
    length: sizes?.length ?? 1,
    ...(sizes ? { width: sizes.width, height: sizes.height } : {}),
    ...(parcel.declaredValue ? { declaredPrice: uah(parcel.declaredValue, 'parcels.declaredValue') } : {}),
    ...(parcel.description ? { description: parcel.description.slice(0, 1024) } : {}),
  };
}

/** Delivery type letters: `D` door, `W` post office (a carrier location). */
export function deliveryTypeOf(sender: Party, recipient: Party): DeliveryType {
  const door = (party: Party) => party.point.type === 'door';
  if (door(sender)) return door(recipient) ? 'D2D' : 'D2W';
  return door(recipient) ? 'W2D' : 'W2W';
}

/** Postcode of a party: the address postcode, or the post office index of a location. */
export function postcodeOf(party: Party, field: string): string {
  const code =
    party.point.type === 'location'
      ? (party.point.address?.postalCode ?? party.point.locationId)
      : party.point.address.postalCode;
  if (code === undefined || !/^\d{5}$/.test(code)) {
    throw invalidInput('A five-digit postcode (or a post office index as the location id) is required', field);
  }
  return code;
}

export function toAddressInput(party: Party, field: string): AddressInput {
  const postcode = postcodeOf(party, field);
  const address: CanonicalAddress | undefined = party.point.address;
  return {
    postcode,
    ...(address?.region ? { region: address.region.slice(0, 25) } : {}),
    ...(address?.district ? { district: address.district.slice(0, 45) } : {}),
    ...(address?.city ? { city: address.city.slice(0, 45) } : {}),
    ...(address ? streetFields(address) : {}),
  };
}

function streetFields(address: CanonicalAddress): Partial<AddressInput> {
  const street = address.street ?? address.lines?.join(', ');
  return {
    ...(street ? { street: street.slice(0, 255) } : {}),
    ...(address.building ? { houseNumber: address.building.slice(0, 15) } : {}),
    ...(address.apartment ? { apartmentNumber: address.apartment.slice(0, 15) } : {}),
  };
}

const norm = (value: string | null | undefined) => (value ?? '').trim().toLowerCase();

/** Whether a stored client address is the address the consumer gave (postcode and street fields equal). */
export function sameAddress(existing: Address, wanted: AddressInput): boolean {
  return (
    existing.postcode === wanted.postcode &&
    norm(existing.street) === norm(wanted.street) &&
    norm(existing.houseNumber) === norm(wanted.houseNumber) &&
    norm(existing.apartmentNumber) === norm(wanted.apartmentNumber)
  );
}

export function findAddress(addresses: ClientAddress[], wanted: AddressInput): ClientAddress | undefined {
  return addresses.find(item => sameAddress(item.address, wanted));
}

interface Names {
  firstName: string;
  lastName: string;
  middleName?: string;
}

/**
 * `contact.firstName` / `lastName` / `middleName` win. A plain `name` is read in the Ukrainian order:
 * "Surname Name Patronymic" (or "Surname Name").
 */
export function namesOf(contact: Contact, field: string): Names {
  if (contact.firstName && contact.lastName) {
    return {
      firstName: contact.firstName,
      lastName: contact.lastName,
      ...(contact.middleName ? { middleName: contact.middleName } : {}),
    };
  }
  const parts = (contact.name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const [lastName, firstName, ...rest] = parts as [string, string, ...string[]];
    return { firstName, lastName, ...(rest.length ? { middleName: rest.join(' ') } : {}) };
  }
  throw invalidInput('firstName and lastName (or a name of two words) are required', field);
}

export function toClientInput(party: Party, addressId: number | string, field: string): ClientInput {
  const { contact } = party;
  if (!contact.phone) throw invalidInput('A phone number is required', `${field}.contact.phone`);
  const base = {
    addressId,
    phoneNumber: contact.phone,
    ...(contact.email ? { email: contact.email } : {}),
    ...(party.externalId ? { externalId: party.externalId } : {}),
  };
  if (contact.company) {
    if (!party.taxId) throw invalidInput('A company needs its EDRPOU in taxId', `${field}.taxId`);
    return { ...base, type: 'COMPANY', name: contact.company, edrpou: party.taxId };
  }
  const names = namesOf(contact, `${field}.contact`);
  // A ten-digit tax id belongs to a sole proprietor.
  if (party.taxId && /^\d{10}$/.test(party.taxId))
    return { ...base, type: 'PRIVATE_ENTREPRENEUR', ...names, tin: party.taxId };
  return { ...base, type: 'INDIVIDUAL', ...names };
}

export function lifecycleToTrackingStatus(status: LifecycleStatus): TrackingStatus {
  switch (status) {
    case 'CREATED':
      return 'pre_transit';
    case 'REGISTERED':
    case 'DELIVERING':
    case 'FORWARDING':
      return 'in_transit';
    case 'IN_DEPARTMENT':
      return 'available_for_pickup';
    case 'DELIVERED':
      return 'delivered';
    case 'RETURNED':
      return 'returned';
    case 'RETURNING':
    case 'STORAGE':
      return 'exception';
    case 'CANCELED':
    case 'DELETED':
      return 'cancelled';
    default:
      return 'unknown';
  }
}

export type { Client };
