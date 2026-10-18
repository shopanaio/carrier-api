// Response bodies shaped like the documentation examples. Builders echo what a request carried, nothing more.
import type { Address, AddressInput } from '../../src/contract/types/address';
import type { Client, ClientInput } from '../../src/contract/types/client';
import type { Shipment, ShipmentInput } from '../../src/contract/types/shipment';
import type { UkrposhtaStatusEvent } from '../../src/public/types/tracking';

let counter = 0;
const next = () => (counter += 1);
const uuid = (prefix: string) => `${prefix}-0000-4000-8000-${String(next()).padStart(12, '0')}`;

export function addressFrom(input: AddressInput): Address {
  const id = 100000 + next();
  return {
    ...input,
    id,
    countryside: false,
    country: 'UA',
    detailedInfo: `Ukraina, ${input.postcode}`,
    created: '2026-01-01T09:00:00',
    lastModified: '2026-01-01T09:00:00',
  };
}

export function clientFrom(input: ClientInput, address?: Address): Client {
  const addr = address ?? addressFrom({ postcode: '00000' });
  const phone = input.phoneNumber.startsWith('+') ? input.phoneNumber : `+38${input.phoneNumber}`;
  const type = input.type ?? 'COMPANY';
  return {
    uuid: uuid('c1'),
    name: input.name ?? [input.lastName, input.firstName, input.middleName].filter(Boolean).join(' '),
    firstName: input.firstName ?? null,
    middleName: input.middleName ?? null,
    lastName: input.lastName ?? null,
    latinName: null,
    postId: null,
    externalId: input.externalId ?? null,
    uniqueRegistrationNumber: null,
    counterpartyUuid: 'cp-uuid',
    addressId: Number(input.addressId),
    addresses: [{ uuid: uuid('a1'), addressId: Number(input.addressId), address: addr, type: 'PHYSICAL', main: true }],
    phoneNumber: phone,
    phones: [{ uuid: uuid('p1'), phoneId: 24000 + next(), phoneNumber: phone, type: 'PERSONAL', main: true }],
    email: input.email ?? '',
    emails: [],
    type,
    contactPersonName: null,
    resident: true,
    GDPRRead: false,
    GDPRAccept: false,
    personalDataApproved: false,
    checkOnDeliveryAllowed: type !== 'INDIVIDUAL',
    ...(input.edrpou ? { edrpou: input.edrpou } : {}),
    ...(input.tin ? { tin: input.tin } : {}),
  };
}

export function shipmentFrom(input: ShipmentInput, sender?: Client, recipient?: Client): Shipment {
  const parcels = input.parcels.map((parcel, index) => ({
    ...parcel,
    uuid: uuid('p2'),
    barcode: `05${String(next()).padStart(11, '0')}`,
    parcelNumber: index + 1,
    parcelItems: null,
  }));
  return {
    uuid: uuid('s1'),
    type: input.type ?? 'EXPRESS',
    sender: sender ?? clientFrom({ addressId: 1, phoneNumber: '0' }),
    recipient: recipient ?? clientFrom({ addressId: 2, phoneNumber: '0' }),
    senderAddressId: Number(input.senderAddressId ?? 1),
    recipientAddressId: Number(input.recipientAddressId ?? 2),
    returnAddressId: Number(input.returnAddressId ?? input.senderAddressId ?? 1),
    shipmentGroupUuid: null,
    externalId: input.externalId ?? null,
    deliveryType: input.deliveryType,
    onFailReceiveType: 'RETURN',
    barcode: parcels[0]!.barcode,
    weight: parcels.reduce((sum, p) => sum + p.weight, 0),
    length: Math.max(...parcels.map(p => p.length)),
    declaredPrice: null,
    deliveryPrice: 42,
    rawDeliveryPrice: 45,
    postPay: input.postPay ?? null,
    discounts: [],
    lastModified: '2026-01-01T09:00:00',
    description: input.description ?? null,
    parcels,
    lifecycle: { status: 'CREATED', statusDate: '2026-01-01T09:00:00' },
    paidByRecipient: input.paidByRecipient ?? false,
  };
}

export function statusEvent(
  barcode: string,
  event: number | string,
  extra: Partial<UkrposhtaStatusEvent> = {},
): UkrposhtaStatusEvent {
  return {
    barcode,
    step: 1,
    date: '2026-01-10T10:00:00',
    index: '01001',
    name: 'KYIV 1',
    event,
    eventName: `Event ${event}`,
    country: 'Ukraine',
    eventReason: null,
    eventReason_id: 1,
    mailType: 1048576,
    indexOrder: 1,
    ...extra,
  };
}
