// code and comments in English
import {
  Lifecycle,
  SimClock,
  SimStore,
  binary,
  createSimulator,
  httpError,
  json,
  minimalPdf,
} from '@shopana/carrier-testing';
import type { SimContext, SimResponse } from '@shopana/carrier-testing';
import { ukrposhtaBaseUrls } from '../config';
import type { Address, AddressInput } from '../contract/types/address';
import type { Client, ClientAddress, ClientInput } from '../contract/types/client';
import type { LifecycleStatus } from '../contract/types/common';
import type { DeliveryPriceRequest } from '../contract/types/pricing';
import type { Parcel, ParcelInput, Shipment, ShipmentInput } from '../contract/types/shipment';
import type { ShipmentGroup, ShipmentGroupInput } from '../contract/types/group';
import type { UkrposhtaStatusEvent } from '../public/types/tracking';
import { takesCounterpartyToken, ukrposhtaEcomContract } from './ecomContract';
import { requestToPriceInput, simulatedPrice, simulatedTariffs } from './ecomPricing';
import type { UkrposhtaSimulatorOptions } from './index';

type Body = Record<string, unknown>;

const COUNTERPARTY_UUID = '8f0c6d52-0000-4000-8000-00000000c0de';
const MAX_PARCEL_WEIGHT = 30_000;
const MAX_GROUP_SIZE = 500;
const NOT_REGISTERED_GROUP_STATUS: LifecycleStatus = 'CREATED';

/**
 * Shipment statuses. Delete is allowed only from `CREATED`; a group closes when its shipments are registered.
 * The returning branch follows the documentation (31200 → 41010); `STORAGE` is the unclaimed-parcel branch.
 */
export const shipmentLifecycle = new Lifecycle<LifecycleStatus>({
  CREATED: ['REGISTERED', 'DELETED'],
  REGISTERED: ['DELIVERING', 'CANCELED'],
  DELIVERING: ['IN_DEPARTMENT', 'FORWARDING', 'RETURNING'],
  FORWARDING: ['DELIVERING', 'RETURNING'],
  IN_DEPARTMENT: ['DELIVERED', 'STORAGE', 'FORWARDING'],
  STORAGE: ['RETURNING', 'DELIVERED'],
  RETURNING: ['RETURNED'],
  RETURNED: [],
  DELIVERED: [],
  CANCELED: [],
  DELETED: [],
});

/** Tracking event a shipment gets on entering a status (event codes of Annex B of the tracking documentation). */
const STATUS_EVENTS: Partial<Record<LifecycleStatus, { event: string; name: string; reasonId?: number }>> = {
  REGISTERED: { event: '10100', name: 'Acceptance' },
  DELIVERING: { event: '20800', name: 'Shipment' },
  IN_DEPARTMENT: { event: '21700', name: 'Arrival to the branch office' },
  FORWARDING: { event: '31400', name: 'Forwarded' },
  RETURNING: { event: '31200', name: 'Returning to the sender' },
  STORAGE: { event: '21400', name: 'Transferred for storage' },
  DELIVERED: { event: '41000', name: 'Delivery', reasonId: 2 },
  RETURNED: { event: '41000', name: 'Shipment delivered to: sender', reasonId: 10 },
  CANCELED: { event: '10600', name: 'Reception canceled' },
};

interface ClientRow extends Client {
  /** Marks rows created through the simulator API, for lookups. */
  readonly createdBy: 'api';
}

function error(status: number, code: string, message: string, field?: string) {
  return httpError(status, { code, message, ...(field ? { field } : {}) });
}
const invalid = (message: string, field?: string) => error(400, 'UPE01002', message, field);
const notFound = (what: string) => error(404, 'UPE02001', `${what} not found`);
const badState = (message: string) => error(400, 'UPE01001', message);

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('380')) return `+${digits}`;
  if (digits.length === 10 && digits.startsWith('0')) return `+38${digits}`;
  return `+${digits}`;
}

const nowOf = (clock: SimClock) => clock.toISOString().slice(0, 19);

/** Simulator of the eCom API and the forms service (both base URLs share the contract). */
export function createUkrposhtaEcomSimulator(options: UkrposhtaSimulatorOptions = {}) {
  const clock = options.clock ?? new SimClock();
  const state = options.state ?? new SimStore();
  const addresses = state.collection<Address>('ecom-addresses');
  const clients = state.collection<ClientRow>('ecom-clients');
  const shipments = state.collection<Shipment>('ecom-shipments');
  const groups = state.collection<ShipmentGroup>('ecom-groups');
  const barcodes = state.collection<{ shipmentUuid: string }>('ecom-barcodes');
  const tracked = state.collection<UkrposhtaStatusEvent[]>('tracked');

  // --- lookups ---------------------------------------------------------------------------------------------------

  const shipmentBy = (idOrBarcode: string): Shipment => {
    const direct = shipments.get(idOrBarcode);
    if (direct) return direct;
    const byBarcode = barcodes.get(idOrBarcode);
    if (byBarcode) return shipments.require(byBarcode.shipmentUuid);
    throw notFound(`Shipment ${idOrBarcode}`);
  };
  const clientBy = (uuid: string): ClientRow => clients.require(uuid, () => notFound(`Client ${uuid}`));
  const groupBy = (uuid: string): ShipmentGroup => groups.require(uuid, () => notFound(`Shipment group ${uuid}`));
  const many = <T>(body: unknown): T[] => (Array.isArray(body) ? (body as T[]) : [body as T]);
  const respond = <T>(body: unknown, items: T[]): SimResponse => json(Array.isArray(body) ? items : items[0]);

  // --- addresses -------------------------------------------------------------------------------------------------

  const createAddress = (input: AddressInput): Address => {
    if (!/^\d{5}$/.test(input.postcode ?? '')) throw invalid('postcode must be five digits', 'postcode');
    if (['00000', '66666'].includes(input.postcode)) {
      throw invalid(`Address has not been saved! PostOffice ${input.postcode} not found!`, 'postcode');
    }
    if (input.mailbox && (input.street || input.houseNumber || input.apartmentNumber)) {
      throw invalid('A mailbox address must not have street, house or apartment', 'mailbox');
    }
    const id = Number(state.ids.sequence('ecom-address', { start: 100000 }));
    const stamp = nowOf(clock);
    const address: Address = {
      ...input,
      id,
      countryside: false,
      country: input.country ?? 'UA',
      detailedInfo: [
        'Україна',
        input.postcode,
        input.region,
        input.district,
        input.city,
        [input.street, input.houseNumber].filter(Boolean).join(' '),
        input.apartmentNumber,
      ]
        .filter(Boolean)
        .join(', '),
      created: stamp,
      lastModified: stamp,
    };
    return addresses.insert(String(id), address);
  };

  // --- clients ---------------------------------------------------------------------------------------------------

  const createClient = (input: ClientInput): ClientRow => {
    const type = input.type ?? 'COMPANY';
    if (!input.phoneNumber) throw invalid('phoneNumber is required', 'phoneNumber');
    const address = addresses.get(String(input.addressId));
    if (!address) throw notFound(`Address ${String(input.addressId)}`);
    if (type === 'COMPANY') {
      if (!input.name || input.name.length < 2) throw invalid('name is required for a company', 'name');
      if (!/^\d{5,8}$/.test(input.edrpou ?? ''))
        throw invalid('edrpou (5 to 8 digits) is required for a company', 'edrpou');
    } else {
      if (!input.firstName || !input.lastName) throw invalid('firstName and lastName are required', 'firstName');
      if (type === 'PRIVATE_ENTREPRENEUR' && !/^\d{10}$/.test(input.tin ?? '')) {
        throw invalid('tin (10 digits) is required for a private entrepreneur', 'tin');
      }
    }
    const uuid = state.ids.uuid('ecom-client');
    const phone = normalizePhone(input.phoneNumber);
    const clientAddress: ClientAddress = {
      uuid: state.ids.uuid('ecom-client-address'),
      addressId: address.id,
      address,
      type: 'PHYSICAL',
      main: true,
    };
    const name =
      type === 'COMPANY' ? input.name! : [input.lastName, input.firstName, input.middleName].filter(Boolean).join(' ');
    const row: ClientRow = {
      createdBy: 'api',
      uuid,
      name,
      firstName: input.firstName ?? null,
      middleName: input.middleName ?? null,
      lastName: input.lastName ?? null,
      latinName: input.latinName ?? null,
      postId: null,
      externalId: input.externalId ?? null,
      uniqueRegistrationNumber: input.uniqueRegistrationNumber ?? null,
      counterpartyUuid: COUNTERPARTY_UUID,
      addressId: address.id,
      addresses: [clientAddress],
      phoneNumber: phone,
      phones: [
        {
          uuid: state.ids.uuid('ecom-client-phone'),
          phoneId: clients.size + 1,
          phoneNumber: phone,
          type: 'PERSONAL',
          main: true,
        },
      ],
      email: input.email ?? '',
      emails: input.email ? [{ uuid: state.ids.uuid('ecom-client-email'), email: input.email, main: true }] : [],
      type,
      postPayPaymentType: 'POSTPAY_PAYMENT_CASH_ONLY',
      ...(input.edrpou ? { edrpou: input.edrpou } : {}),
      ...(input.tin ? { tin: input.tin } : {}),
      ...(input.bankAccount ? { bankAccount: input.bankAccount } : {}),
      contactPersonName: input.contactPersonName ?? null,
      resident: input.resident ?? true,
      GDPRRead: false,
      GDPRAccept: false,
      personalDataApproved: false,
      checkOnDeliveryAllowed: type !== 'INDIVIDUAL',
    };
    return clients.insert(uuid, row);
  };

  const updateClient = (uuid: string, patch: Partial<ClientInput>): ClientRow => {
    const row = clientBy(uuid);
    const next: ClientRow = { ...row };
    if (patch.name !== undefined) next.name = patch.name;
    if (patch.firstName !== undefined) next.firstName = patch.firstName;
    if (patch.lastName !== undefined) next.lastName = patch.lastName;
    if (patch.middleName !== undefined) next.middleName = patch.middleName;
    if (patch.latinName !== undefined) next.latinName = patch.latinName;
    if (patch.externalId !== undefined) next.externalId = patch.externalId;
    if (patch.bankAccount !== undefined) next.bankAccount = patch.bankAccount;
    if (patch.contactPersonName !== undefined) next.contactPersonName = patch.contactPersonName;
    if (patch.email !== undefined) {
      next.email = patch.email;
      next.emails = patch.email ? [{ uuid: state.ids.uuid('ecom-client-email'), email: patch.email, main: true }] : [];
    }
    if (patch.phoneNumber !== undefined) {
      const phone = normalizePhone(patch.phoneNumber);
      next.phoneNumber = phone;
      next.phones = [
        ...row.phones.map(p => ({ ...p, main: false })),
        {
          uuid: state.ids.uuid('ecom-client-phone'),
          phoneId: clients.size + row.phones.length + 1,
          phoneNumber: phone,
          type: 'PERSONAL' as const,
          main: true,
        },
      ];
    }
    const requested = [
      ...(patch.addressId === undefined ? [] : [{ addressId: patch.addressId, main: true }]),
      ...(patch.addresses ?? []),
    ];
    for (const item of requested) {
      const address = addresses.get(String(item.addressId));
      if (!address) throw notFound(`Address ${String(item.addressId)}`);
      const existing = next.addresses.find(a => a.addressId === address.id);
      if (!existing) {
        next.addresses = [
          ...next.addresses,
          {
            uuid: state.ids.uuid('ecom-client-address'),
            addressId: address.id,
            address,
            type: 'PHYSICAL',
            main: false,
          },
        ];
      }
      if (item.main) {
        next.addresses = next.addresses.map(a => ({ ...a, main: a.addressId === address.id }));
        next.addressId = address.id;
      }
    }
    return clients.upsert(uuid, next);
  };

  // --- shipments -------------------------------------------------------------------------------------------------

  const validateParcels = (input: Pick<ShipmentInput, 'parcels' | 'postPay'> & { type: string }): void => {
    const parcels = input.parcels ?? [];
    if (parcels.length === 0) throw invalid('At least one parcel is required', 'parcels');
    const document = input.type === 'DOCUMENT';
    if (document && parcels.length > 1) throw invalid('A DOCUMENT shipment has one parcel', 'parcels');
    let total = 0;
    for (const parcel of parcels) {
      if (!(parcel.weight > 0)) throw invalid('Parcel weight must be greater than zero', 'weight');
      if (!(parcel.length > 0)) throw invalid('Parcel length must be greater than zero', 'length');
      if (parcel.weight > MAX_PARCEL_WEIGHT) throw invalid('A parcel weighs at most 30 kg', 'weight');
      if (document && parcel.weight > 100) throw invalid('A DOCUMENT shipment weighs at most 100 g', 'weight');
      if (document && parcel.length > 30) throw invalid('A DOCUMENT shipment is at most 30 cm long', 'length');
      if (document && (parcel.declaredPrice ?? 0) > 300)
        throw invalid('A DOCUMENT is declared at most 300 UAH', 'declaredPrice');
      if (!document) {
        const longest = Math.max(parcel.length, parcel.width ?? 0, parcel.height ?? 0);
        if (longest > 120) throw invalid('The longest side is at most 120 cm', 'length');
        if (parcel.length > 70) {
          if (!parcel.width || !parcel.height) throw invalid('width and height are required above 70 cm', 'width');
          if (parcel.length + parcel.width + parcel.height > 250)
            throw invalid('The sum of the sides is at most 250 cm', 'length');
          if (parcels.length > 5) throw invalid('At most 5 parcels when a side exceeds 70 cm', 'parcels');
        }
      }
      total += parcel.weight;
    }
    if (total > 1_000_000) throw invalid('A shipment weighs at most 1000 kg', 'weight');
    if (input.postPay !== undefined) {
      if (document) throw invalid('A DOCUMENT shipment cannot have cash on delivery', 'postPay');
      const declared = parcels.reduce((sum, p) => sum + (p.declaredPrice ?? 0), 0);
      if (input.postPay > declared) throw invalid('postPay must not exceed the declared price', 'postPay');
    }
  };

  const toParcel = (parcel: ParcelInput, index: number): Parcel => {
    const barcode = state.ids.sequence('ecom-barcode', { prefix: '05', pad: 11 });
    return {
      ...parcel,
      uuid: state.ids.uuid('ecom-parcel'),
      barcode,
      parcelNumber: parcel.parcelNumber ?? index + 1,
      parcelItems: null,
    };
  };

  const createShipment = (input: ShipmentInput): Shipment => {
    if (!input.sender?.uuid || !input.recipient?.uuid) throw invalid('sender and recipient are required', 'sender');
    if (!input.deliveryType) throw invalid('deliveryType is required', 'deliveryType');
    const sender = clientBy(input.sender.uuid);
    const recipient = clientBy(input.recipient.uuid);
    const type = input.type ?? 'EXPRESS';
    validateParcels({ ...input, type });
    const senderAddressId = Number(input.senderAddressId ?? sender.addressId);
    const recipientAddressId = Number(input.recipientAddressId ?? recipient.addressId);
    if (!sender.addresses.some(a => a.addressId === senderAddressId))
      throw invalid('senderAddressId is not an address of the sender', 'senderAddressId');
    if (!recipient.addresses.some(a => a.addressId === recipientAddressId)) {
      throw invalid('recipientAddressId is not an address of the recipient', 'recipientAddressId');
    }
    const recipientAddress = addresses.require(String(recipientAddressId));
    if (recipientAddress.mailbox && input.deliveryType.endsWith('2D')) {
      throw invalid('A mailbox address cannot be a door delivery address', 'deliveryType');
    }
    if (input.postPay !== undefined && sender.type === 'COMPANY' && !input.transferPostPayToBankAccount) {
      throw invalid(
        'A company receives cash on delivery to a bank account: set transferPostPayToBankAccount',
        'transferPostPayToBankAccount',
      );
    }
    if (input.transferPostPayToBankAccount && sender.type === 'INDIVIDUAL') {
      throw invalid('An individual cannot receive cash on delivery to a bank account', 'transferPostPayToBankAccount');
    }
    const groupUuid = input.shipmentGroupUuid ?? null;
    if (groupUuid) assertCanJoin(groupBy(groupUuid), type);

    const parcels = input.parcels.map(toParcel);
    const price = simulatedPrice({
      type,
      deliveryType: input.deliveryType,
      parcels,
      postPay: input.postPay,
      documentBack: input.documentBack,
      sms: input.sms,
    });
    const uuid = state.ids.uuid('ecom-shipment');
    const stamp = nowOf(clock);
    const shipment: Shipment = {
      uuid,
      type,
      sender,
      recipient,
      senderAddressId,
      recipientAddressId,
      returnAddressId: Number(input.returnAddressId ?? senderAddressId),
      recipientPhone: input.recipientPhone ?? recipient.phoneNumber,
      recipientEmail: input.recipientEmail ?? (recipient.email || null),
      shipmentGroupUuid: groupUuid,
      externalId: input.externalId ?? null,
      deliveryType: input.deliveryType,
      onFailReceiveType: input.onFailReceiveType ?? 'RETURN',
      barcode: parcels[0].barcode,
      weight: parcels.reduce((sum, p) => sum + p.weight, 0),
      length: Math.max(...parcels.map(p => p.length)),
      width: Math.max(...parcels.map(p => p.width ?? 0)) || null,
      height: Math.max(...parcels.map(p => p.height ?? 0)) || null,
      declaredPrice: parcels.reduce((sum, p) => sum + (p.declaredPrice ?? 0), 0) || null,
      deliveryPrice: price.deliveryPrice,
      rawDeliveryPrice: price.rawDeliveryPrice,
      returnDeliveryPrice: price.returnDeliveryPrice,
      postPay: input.postPay ?? null,
      postPayUah: input.postPay ?? 0,
      postPayDeliveryPrice: price.postPayDeliveryPrice,
      discounts: [],
      lastModified: stamp,
      description: input.description ?? null,
      parcels,
      lifecycle: { status: 'CREATED', statusDate: stamp },
      deliveryDate: null,
      calculationDescription: price.calculationDescription,
      paidByRecipient: input.paidByRecipient ?? false,
      postPayPaidByRecipient: input.postPayPaidByRecipient ?? true,
      bulky: input.bulky ?? Math.max(...parcels.map(p => p.length)) > 70,
      fragile: input.fragile ?? false,
      bees: input.bees ?? false,
      sms: input.sms ?? false,
      documentBack: input.documentBack ?? false,
      checkOnDelivery: input.checkOnDelivery ?? false,
      transferPostPayToBankAccount: input.transferPostPayToBankAccount ?? false,
      deliveryPricePaid: false,
      postPayPaid: false,
      postPayDeliveryPricePaid: false,
      packedBySender: input.packedBySender ?? false,
      availablePaymentTypes: ['CASH', 'CASHLESS', 'CARD', 'CARD_ON_SITE'],
      withDeliveryNotification: input.withDeliveryNotification ?? false,
      free: false,
    };
    shipments.insert(uuid, shipment);
    for (const parcel of parcels) barcodes.insert(parcel.barcode, { shipmentUuid: uuid });
    return shipment;
  };

  const updateShipment = (uuid: string, patch: Partial<ShipmentInput>): Shipment => {
    const current = shipmentBy(uuid);
    if (current.lifecycle.status !== 'CREATED') throw badState('A registered shipment cannot be changed');
    const next: Shipment = { ...current };
    const simple = [
      'deliveryType',
      'description',
      'externalId',
      'paidByRecipient',
      'postPay',
      'bulky',
      'fragile',
      'bees',
      'sms',
      'documentBack',
      'checkOnDelivery',
      'packedBySender',
      'onFailReceiveType',
      'withDeliveryNotification',
    ] as const;
    for (const key of simple) {
      if (patch[key] !== undefined) (next as unknown as Body)[key] = patch[key];
    }
    if (patch.parcels) {
      next.parcels = current.parcels.map(parcel => {
        const change = patch.parcels!.find(
          p => p.uuid === parcel.uuid || (p.barcode !== undefined && p.barcode === parcel.barcode),
        );
        return change ? { ...parcel, ...change, uuid: parcel.uuid, barcode: parcel.barcode } : parcel;
      });
      validateParcels({ parcels: next.parcels, postPay: next.postPay ?? undefined, type: next.type });
      next.weight = next.parcels.reduce((sum, p) => sum + p.weight, 0);
      next.length = Math.max(...next.parcels.map(p => p.length));
    }
    const price = simulatedPrice({
      type: next.type,
      deliveryType: next.deliveryType,
      parcels: next.parcels,
      postPay: next.postPay ?? undefined,
    });
    next.deliveryPrice = price.deliveryPrice;
    next.rawDeliveryPrice = price.rawDeliveryPrice;
    next.calculationDescription = price.calculationDescription;
    next.lastModified = nowOf(clock);
    return shipments.upsert(current.uuid, next);
  };

  const addParcel = (idOrBarcode: string, input: ParcelInput): Shipment => {
    const current = shipmentBy(idOrBarcode);
    if (current.lifecycle.status !== 'CREATED') throw badState('A registered shipment cannot be changed');
    const parcel = toParcel(input, current.parcels.length);
    const parcels = [...current.parcels, parcel];
    validateParcels({ parcels, postPay: current.postPay ?? undefined, type: current.type });
    barcodes.insert(parcel.barcode, { shipmentUuid: current.uuid });
    const price = simulatedPrice({ type: current.type, deliveryType: current.deliveryType, parcels });
    return shipments.upsert(current.uuid, {
      ...current,
      parcels,
      weight: parcels.reduce((sum, p) => sum + p.weight, 0),
      deliveryPrice: price.deliveryPrice,
      rawDeliveryPrice: price.rawDeliveryPrice,
    });
  };

  // --- groups ----------------------------------------------------------------------------------------------------

  const membersOf = (groupUuid: string) => shipments.filter(s => s.shipmentGroupUuid === groupUuid);

  function assertCanJoin(group: ShipmentGroup, type: string): void {
    if (group.closed) throw badState('The shipment group is closed');
    if (group.type !== type) throw badState(`A ${group.type} group holds only ${group.type} shipments`);
    if (membersOf(group.uuid).length >= MAX_GROUP_SIZE) throw badState('A group holds at most 500 shipments');
  }

  const createGroup = (input: ShipmentGroupInput): ShipmentGroup => {
    if (!input.name) throw invalid('name is required', 'name');
    if (input.clientUuid) clientBy(input.clientUuid);
    const uuid = state.ids.uuid('ecom-group');
    const stamp = nowOf(clock);
    const group: ShipmentGroup = {
      uuid,
      name: input.name,
      type: input.type ?? 'EXPRESS',
      clientUuid: input.clientUuid ?? '',
      counterpartyUuid: COUNTERPARTY_UUID,
      counterpartyRegcode: '0',
      created: stamp,
      barcode_g_id: `${stamp.replace(/\D/g, '')}${state.ids.sequence('ecom-group-code', { pad: 3 })}`,
      byCourier: false,
      closed: false,
    };
    return groups.insert(uuid, group);
  };

  const addToGroup = (group: ShipmentGroup, shipment: Shipment): Shipment => {
    if (shipment.shipmentGroupUuid === group.uuid) return shipment;
    assertCanJoin(group, shipment.type);
    return shipments.upsert(shipment.uuid, { ...shipment, shipmentGroupUuid: group.uuid });
  };

  const SORTABLE = [
    'declaredPrice',
    'deliveryPrice',
    'length',
    'weight',
    'width',
    'height',
    'postPay',
    'lastModified',
  ] as const;

  const pageOf = (items: Shipment[], ctx: SimContext): Shipment[] => {
    const sorts = typeof ctx.query.sort === 'string' ? ctx.query.sort.split(',') : [];
    const order = ctx.query.order === 'desc' ? -1 : 1;
    const sorted = sorts.length
      ? [...items].sort((a, b) => {
          for (const field of sorts) {
            if (!(SORTABLE as readonly string[]).includes(field)) continue;
            const x = (a as unknown as Body)[field] as number | string | null;
            const y = (b as unknown as Body)[field] as number | string | null;
            if (x === y) continue;
            return ((x ?? 0) < (y ?? 0) ? -1 : 1) * order;
          }
          return 0;
        })
      : items;
    const size = typeof ctx.query.size === 'number' ? ctx.query.size : undefined;
    const page = typeof ctx.query.page === 'number' ? ctx.query.page : 1;
    return size ? sorted.slice((page - 1) * size, page * size) : sorted;
  };

  const filterByStatus = (items: Shipment[], ctx: SimContext): Shipment[] => {
    const status = typeof ctx.query.status === 'string' ? ctx.query.status.split(',') : [];
    const byStatus = status.length ? items.filter(s => status.includes(s.lifecycle.status)) : items;
    return ctx.query.statusesGroup === 'NONREGISTERED'
      ? byStatus.filter(s => s.lifecycle.status === NOT_REGISTERED_GROUP_STATUS)
      : byStatus;
  };

  // --- authorization and errors ----------------------------------------------------------------------------------

  const sim = createSimulator({
    contract: ukrposhtaEcomContract,
    baseUrl: [
      ukrposhtaBaseUrls('production').ecom,
      ukrposhtaBaseUrls('sandbox').ecom,
      ukrposhtaBaseUrls('production').forms,
      ukrposhtaBaseUrls('sandbox').forms,
    ],
    clock,
    state,
    auth: ctx => {
      if (!ctx.headers.authorization?.startsWith('Bearer ')) {
        return { status: 401, body: { code: 'UPE05001', message: 'Wrong token' } };
      }
      if (takesCounterpartyToken(ctx.operation) && (ctx.request.query?.token ?? '') === '') {
        return { status: 401, body: { code: 'UPE05001', message: 'Wrong token' } };
      }
      return undefined;
    },
    invalidRequest: issues => ({
      status: 400,
      body: {
        code: 'UPE01002',
        message: issues[0]?.message ?? 'Input data validation error',
        ...(issues[0]?.field ? { field: issues[0].field } : {}),
      },
    }),
    handlers: {
      CreateAddressUsingPOST: ctx => json(createAddress(ctx.body as AddressInput)),
      GetAddressUsingGET: ctx =>
        json(addresses.require(String(ctx.params.id), () => notFound(`Address ${String(ctx.params.id)}`))),

      CreateClientsUsingPOST: ctx => respond(ctx.body, many<ClientInput>(ctx.body).map(createClient)),
      GetClientUsingGET: ctx => json(clientBy(String(ctx.params.uuid))),
      UpdateClientUsingPUT: ctx => json(updateClient(String(ctx.params.uuid), ctx.body as Partial<ClientInput>)),
      GetClientByExternalIdUsingGET: ctx => {
        const client = clients.find(c => c.externalId === ctx.params.externalId);
        if (!client) throw notFound('Client');
        return json(client);
      },
      GetClientsByPhoneUsingGET: ctx => {
        const phone = normalizePhone(String(ctx.query.phoneNumber));
        const client = clients.find(c => c.phones.some(p => p.phoneNumber === phone));
        if (!client) throw notFound('Client');
        return json([client]);
      },
      GetAllClientAddressesByClientUuidUsingGET: ctx => json(clientBy(String(ctx.query.clientUuid)).addresses),
      GetAllClientPhonesByClientUuidUsingGET: ctx => json(clientBy(String(ctx.query.clientUuid)).phones),
      GetAllClientEmailsByClientUuidUsingGET: ctx => json(clientBy(String(ctx.query.clientUuid)).emails),

      CreateShipmentsUsingPOST: ctx => respond(ctx.body, many<ShipmentInput>(ctx.body).map(createShipment)),
      GetShipmentUsingGET: ctx => json(shipmentBy(String(ctx.params.uuid))),
      GetShipmentByBarcodeUsingGET: ctx => json(shipmentBy(String(ctx.params.barcode))),
      UpdateShipmentUsingPUT: ctx => json(updateShipment(String(ctx.params.uuid), ctx.body as Partial<ShipmentInput>)),
      UpdateMultipleShipmentsUsingPUT: ctx =>
        json(many<Partial<ShipmentInput> & { uuid: string }>(ctx.body).map(item => updateShipment(item.uuid, item))),
      CreateNewParcelsInShipmentUsingPOST: ctx => json(addParcel(String(ctx.params.uuid), ctx.body as ParcelInput)),
      GetShipmentsBySenderUuidUsingGET: ctx => json(shipments.filter(s => s.sender.uuid === ctx.query.senderUuid)),
      GetShipmentLifecycleMinifiedByIdentifierUsingGET: ctx => {
        const shipment = shipmentBy(String(ctx.params.uuid));
        return json({
          shipmentUuid: shipment.uuid,
          shipmentBarcode: shipment.barcode,
          status: shipment.lifecycle.status,
          statusDate: shipment.lifecycle.statusDate,
        });
      },
      GetIsPriceChangedInPostOfficeByBarcodeUsingGET: ctx => {
        shipmentBy(String(ctx.params.barcode));
        return json({ message: 'isPriceChangedInPostOffice: false' });
      },
      RemoveShipmentUsingDELETE: ctx => {
        const shipment = shipmentBy(String(ctx.params.uuid));
        if (shipment.lifecycle.status !== 'CREATED') {
          throw badState('A shipment can be deleted only while it has the status CREATED');
        }
        shipments.delete(shipment.uuid);
        for (const parcel of shipment.parcels) barcodes.delete(parcel.barcode);
        return json({});
      },

      Calculatedeliverypriceusingpost2: ctx => {
        const request = ctx.body as DeliveryPriceRequest;
        const input = requestToPriceInput(request);
        if (input.parcels.some(p => !(p.weight > 0) || !(p.length > 0))) {
          throw invalid('weight and length must be greater than zero', 'weight');
        }
        return json({ ...request, ...simulatedPrice(input) });
      },
      GetTariffsUsingGET: () => json(simulatedTariffs()),
      GetTariffUsingGET: ctx => {
        const tariff = simulatedTariffs().find(t => t.uuid === ctx.params.uuid);
        if (!tariff) throw notFound('Tariff');
        return json(tariff);
      },

      CreateShipmentGroupUsingPOST: ctx => respond(ctx.body, many<ShipmentGroupInput>(ctx.body).map(createGroup)),
      GetShipmentGroupUsingGET: ctx => json(groupBy(String(ctx.params.uuid))),
      UpdateShipmentGroupUsingPUT: ctx => {
        const group = groupBy(String(ctx.params.uuid));
        const name = (ctx.body as { name?: string }).name;
        return json(groups.upsert(group.uuid, { ...group, ...(name ? { name } : {}) }));
      },
      AddShipmentToShipmentGroupUsingPOST: ctx => {
        const group = groupBy(String(ctx.params.shipmentGroupUuid));
        const shipment = shipments.require(String(ctx.params.shipmentUuid), () => notFound('Shipment'));
        addToGroup(group, shipment);
        return json({ message: `Shipment ${shipment.uuid} is assigned to group ${group.uuid}` });
      },
      AssignMultipleShipmentsToShipmentGroupUsingPUT: ctx => {
        const group = groupBy(String(ctx.params.uuid));
        const results = (ctx.body as string[]).map(identifier => {
          const key = barcodes.has(identifier) ? 'targetBarcode' : 'targetUuid';
          try {
            const shipment = shipmentBy(identifier);
            addToGroup(group, shipment);
            return {
              [key]: identifier,
              httpStatus: 200,
              message: `Shipment ${shipment.uuid} is assigned to group ${group.uuid}`,
            };
          } catch (e) {
            const response = (e as { response?: { status?: number; body?: { message?: string } } }).response;
            return {
              [key]: identifier,
              httpStatus: response?.status ?? 400,
              message: response?.body?.message ?? 'Failed',
            };
          }
        });
        return json(results, results.some(r => r.httpStatus !== 200) ? 207 : 200);
      },
      CreateShipmentAndAddToShipmentGroupUsingPOST: ctx => {
        const groupUuid = String(ctx.params.shipmentGroupUuid);
        groupBy(groupUuid);
        const created = many<ShipmentInput>(ctx.body).map(item =>
          createShipment({ ...item, shipmentGroupUuid: groupUuid }),
        );
        return respond(ctx.body, created);
      },
      RemoveShipmentFromShipmentGroupUsingDELETE: ctx => {
        const shipment = shipmentBy(String(ctx.params.uuid));
        if (shipment.shipmentGroupUuid && groupBy(shipment.shipmentGroupUuid).closed) {
          throw badState('The shipment group is closed');
        }
        shipments.upsert(shipment.uuid, { ...shipment, shipmentGroupUuid: null });
        return json({});
      },
      Getallshipmentgroupsbyclientusingget1: ctx =>
        json(
          groups.filter(
            g => g.clientUuid === ctx.params.clientUuid && (ctx.query.type === undefined || g.type === ctx.query.type),
          ),
        ),
      GetShipmentGroupByShipmentUuidUsingGET: ctx => {
        const shipment = shipmentBy(String(ctx.params.shipmentUuid));
        if (!shipment.shipmentGroupUuid) throw error(404, 'UPE02003', 'The shipment is not in a group');
        return json(groupBy(shipment.shipmentGroupUuid));
      },
      GetShipmentsByShipmentGroupUuidUsingGET: ctx => {
        const group = groupBy(String(ctx.params.uuid));
        return json(pageOf(filterByStatus(membersOf(group.uuid), ctx), ctx));
      },
      GetShipmentsQuantityFromShipmentGroupByUuidUsingGET: ctx => {
        const group = groupBy(String(ctx.params.uuid));
        const quantity = filterByStatus(membersOf(group.uuid), ctx).length;
        return json({ message: `Quantity of shipments in shipment group '${group.uuid}'`, quantity });
      },

      getShipmentStickerUsingGET_2: ctx =>
        binary('application/pdf', minimalPdf(shipmentBy(String(ctx.params.uuidOrBarcode)).barcode)),
      getShipmentStickerUsingGET_1: ctx =>
        binary('application/pdf', minimalPdf(shipmentBy(String(ctx.params.uuidOrBarcode)).barcode)),
      getStickerForParcelUsingGET: ctx => {
        const link = barcodes.get(String(ctx.params.barcode));
        if (!link) throw notFound('Parcel');
        return binary('application/pdf', minimalPdf(String(ctx.params.barcode)));
      },
      GetStickersByBarcodesUsingPOST: ctx => {
        const ids = Object.keys(ctx.body as Body);
        if (ids.length === 0) throw invalid('At least one shipment is required');
        for (const id of ids) shipmentBy(id);
        return binary('application/pdf', minimalPdf(`${ids.length} stickers`));
      },
      getShipmentGroupStickerUsingGET_2: ctx => {
        const group = groupBy(String(ctx.params.uuid));
        if (membersOf(group.uuid).length === 0) throw badState('The group has no shipments');
        return binary('application/pdf', minimalPdf(group.name));
      },
      getShipmentGroupForm103AUsingGET_1: ctx => {
        const group = groupBy(String(ctx.params.uuid));
        if (membersOf(group.uuid).length === 0) throw badState('The group has no shipments');
        return binary('application/pdf', minimalPdf(`103a ${group.barcode_g_id}`));
      },
    },
  });

  // --- test helpers ----------------------------------------------------------------------------------------------

  const pushEvent = (shipment: Shipment, status: LifecycleStatus): void => {
    const spec = STATUS_EVENTS[status];
    if (!spec) return;
    const events = tracked.get(shipment.barcode) ?? [];
    events.push({
      barcode: shipment.barcode,
      step: events.length + 1,
      date: nowOf(clock),
      index: '01001',
      name: 'KYIV 1',
      event: spec.event,
      eventName: spec.name,
      country: 'Ukraine',
      eventReason: spec.reasonId === 10 ? 'sender' : null,
      eventReason_id: spec.reasonId ?? 1,
      mailType: 1048576,
      indexOrder: events.length + 1,
    });
    tracked.upsert(shipment.barcode, events);
  };

  /**
   * Moves a shipment through its lifecycle to `status`, one tracking event per step, so the status-tracking
   * simulator (sharing this store) answers for it. Registering a shipment closes its group.
   */
  const advance = (idOrBarcode: string, status: LifecycleStatus): Shipment => {
    let shipment = shipmentBy(idOrBarcode);
    for (const step of shipmentLifecycle.path(shipment.lifecycle.status, status)) {
      clock.advance(3_600_000);
      shipment = shipments.upsert(shipment.uuid, {
        ...shipment,
        lifecycle: { status: step, statusDate: nowOf(clock) },
        lastModified: nowOf(clock),
      });
      if (step === 'REGISTERED' && shipment.shipmentGroupUuid) {
        const group = groupBy(shipment.shipmentGroupUuid);
        groups.upsert(group.uuid, { ...group, closed: true });
      }
      pushEvent(shipment, step);
    }
    return shipment;
  };

  return Object.assign(sim, { advance, shipmentLifecycle });
}
