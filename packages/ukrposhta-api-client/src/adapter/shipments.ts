// code and comments in English
import { money } from '@shopana/carrier-contracts';
import type {
  CallOptions,
  CreateShipmentInput,
  Label,
  LabelRequest,
  Manifest,
  Party,
  Pickup,
  PickupRequest,
  Rate,
  RateRequest,
  Shipment,
} from '@shopana/carrier-contracts';
import type { StickerSize } from '../contract/types/common';
import type { Client, ClientAddress } from '../contract/types/client';
import type { ShipmentInput, Shipment as UkrposhtaShipment } from '../contract/types/shipment';
import type { DeliveryPriceRequest } from '../contract/types/pricing';
import { kyivLocalToIso } from './time';
import type { UkrposhtaEcomClient, UkrposhtaEcomClientWithCourier } from './clients';
import type { CourierInterval } from '../contract/types/courier';
import { invalidInput, isNotFound, notAllowed } from './errors';
import {
  SERVICE_NAMES,
  contactChanges,
  deliveryTypeOf,
  findAddress,
  lifecycleToTrackingStatus,
  postcodeOf,
  samePhone,
  shipmentTypeOf,
  toAddressInput,
  toClientInput,
  toParcelInput,
  uah,
} from './mapping';

interface Resolved {
  clientUuid: string;
  addressId: number;
  client: Client;
}

/** Finds or creates the client and address a party stands for, reusing what the consumer already gave Ukrposhta. */
async function resolveParty(
  ecom: UkrposhtaEcomClient,
  party: Party,
  field: string,
  options: CallOptions,
  bankAccount?: string,
): Promise<Resolved> {
  const refs =
    party.point.type === 'door'
      ? party.point.address.carrierRefs?.ukrposhta
      : party.point.address?.carrierRefs?.ukrposhta;
  const wanted = toAddressInput(party, `${field}.point`);

  let client: Client | undefined;
  if (refs?.clientUuid) {
    client = await ecom.clients.get(refs.clientUuid, options);
  } else if (party.externalId) {
    client = await ecom.clients.getByExternalId(party.externalId, options).catch((error: unknown) => {
      if (isNotFound(error)) return undefined;
      throw error;
    });
  }

  if (!client) {
    const addressId = refs?.addressId ? Number(refs.addressId) : (await ecom.addresses.create(wanted, options)).id;
    // Validate the contact before the client is created, so a bad phone never leaves an orphan address behind.
    const created = await ecom.clients.create(toClientInput(party, addressId, field, bankAccount), options);
    return { clientUuid: created.uuid, addressId, client: created };
  }

  // A party with an external id (or a known client) is the same person, but the contact may have changed since:
  // the latest contact the consumer gives wins and is written to the client before it is used.
  const changes = contactChanges(client, toClientInput(party, client.addressId, field));
  if (Object.keys(changes).length > 0) client = await ecom.clients.update(client.uuid, changes, options);

  let address: ClientAddress | undefined = refs?.addressId
    ? client.addresses.find(item => String(item.addressId) === refs.addressId)
    : findAddress(client.addresses, wanted);
  if (!address) {
    // A shipment may use only an address from the client's own list: create it and attach it to the client.
    const created = await ecom.addresses.create(wanted, options);
    client = await ecom.clients.update(client.uuid, { addresses: [{ addressId: created.id }] }, options);
    address = client.addresses.find(item => item.addressId === created.id);
  }
  if (!address) throw invalidInput('The address could not be attached to the client', `${field}.point`);
  return { clientUuid: client.uuid, addressId: address.addressId, client };
}

/** The sender's IBAN for a new company client, from `options.extra.senderBankAccount`. */
function bankAccountOf(extra: Record<string, unknown> | undefined): string | undefined {
  const value = extra?.senderBankAccount;
  return typeof value === 'string' && value !== '' ? value : undefined;
}

function toShipment(raw: UkrposhtaShipment): Shipment {
  const parcelNumbers = raw.parcels.map(parcel => parcel.barcode);
  return {
    id: raw.uuid,
    trackingNumber: raw.barcode,
    carrier: 'ukrposhta',
    ...(parcelNumbers.length > 1 ? { parcelTrackingNumbers: parcelNumbers } : {}),
    status: lifecycleToTrackingStatus(raw.lifecycle.status),
    price: money(raw.deliveryPrice, 'UAH'),
    ...(raw.deliveryDate ? { estimatedDeliveryDate: kyivLocalToIso(raw.deliveryDate).slice(0, 10) } : {}),
    raw,
  };
}

/**
 * Cash on delivery must not exceed the declared price (Ukrposhta rejects it otherwise). The adapter does not raise the
 * declared value for you: it changes the insurance fee and the amount on the waybill.
 */
function assertCodCovered(parcels: ReturnType<typeof toParcelInput>[], cod: number | undefined): void {
  if (cod === undefined) return;
  const declared = parcels.reduce((sum, parcel) => sum + (parcel.declaredPrice ?? 0), 0);
  if (declared < cod) {
    throw invalidInput(
      `Cash on delivery (${cod}) cannot exceed the declared value of the parcels (${declared}): set parcels.declaredValue`,
      'parcels.declaredValue',
    );
  }
}

export function createShipmentsApi(ecom: UkrposhtaEcomClient) {
  return {
    async createShipment(input: CreateShipmentInput, options: CallOptions = {}): Promise<Shipment> {
      if (input.parcels.length === 0) throw invalidInput('At least one parcel is required', 'parcels');
      if (input.options?.payer === 'third_party')
        throw invalidInput('Ukrposhta has no third-party payer', 'options.payer');
      const type = shipmentTypeOf(input.options?.service);
      const deliveryType = deliveryTypeOf(input.sender, input.recipient);
      const cod = input.options?.cashOnDelivery
        ? uah(input.options.cashOnDelivery.amount, 'options.cashOnDelivery')
        : undefined;
      const parcels = input.parcels.map(toParcelInput);
      assertCodCovered(parcels, cod);

      const senderBankAccount = bankAccountOf(input.options?.extra);
      const senderRefs =
        input.sender.point.type === 'door'
          ? input.sender.point.address.carrierRefs?.ukrposhta
          : input.sender.point.address?.carrierRefs?.ukrposhta;
      if (
        cod !== undefined &&
        input.sender.contact.company &&
        senderBankAccount === undefined &&
        !input.sender.externalId &&
        !senderRefs?.clientUuid
      ) {
        throw invalidInput(
          'A company receives cash on delivery to a bank account: give options.extra.senderBankAccount (an IBAN)',
          'options.extra.senderBankAccount',
        );
      }
      // Validate everything that can be validated locally before the first request, so a bad input leaves nothing behind.
      for (const [party, field] of [
        [input.sender, 'sender'],
        [input.recipient, 'recipient'],
      ] as const) {
        toAddressInput(party, `${field}.point`);
        toClientInput(party, 0, field, field === 'sender' ? senderBankAccount : undefined);
      }
      if (input.reference !== undefined && input.reference.length > 64) {
        throw invalidInput('reference is at most 64 characters (it becomes the shipment externalId)', 'reference');
      }

      const sender = await resolveParty(ecom, input.sender, 'sender', options, senderBankAccount);
      const recipient = await resolveParty(ecom, input.recipient, 'recipient', options);

      // A company receives cash on delivery on its bank account, which must be on file.
      if (cod !== undefined && sender.client.type === 'COMPANY' && !sender.client.bankAccount) {
        throw invalidInput(
          'A company receives cash on delivery to a bank account: give options.extra.senderBankAccount (an IBAN) or use a client that has one',
          'options.extra.senderBankAccount',
        );
      }

      const body: ShipmentInput = {
        sender: { uuid: sender.clientUuid },
        recipient: { uuid: recipient.clientUuid },
        senderAddressId: sender.addressId,
        recipientAddressId: recipient.addressId,
        deliveryType,
        type,
        parcels,
        paidByRecipient: input.options?.payer === 'recipient',
        ...(cod !== undefined
          ? {
              postPay: cod,
              postPayPaidByRecipient: (input.options?.cashOnDelivery?.payer ?? 'recipient') === 'recipient',
              ...(sender.client.type === 'COMPANY' ? { transferPostPayToBankAccount: true } : {}),
            }
          : {}),
        ...(input.reference ? { externalId: input.reference } : {}),
      };
      return toShipment(await ecom.shipments.create(body, options));
    },

    async getShipment(id: string, options: CallOptions = {}): Promise<Shipment> {
      return toShipment(await ecom.shipments.get(id, options));
    },

    async getRates(request: RateRequest, options: CallOptions = {}): Promise<Rate[]> {
      const services = request.options?.service
        ? [shipmentTypeOf(request.options.service)]
        : (['EXPRESS', 'STANDARD'] as const);
      const deliveryType = deliveryTypeOf(request.sender, request.recipient);
      const cod = request.options?.cashOnDelivery
        ? uah(request.options.cashOnDelivery.amount, 'options.cashOnDelivery')
        : undefined;
      const parcels = request.parcels.map(toParcelInput);
      assertCodCovered(parcels, cod);

      const results = await Promise.allSettled(
        services.map(async (type): Promise<Rate> => {
          const body: DeliveryPriceRequest = {
            addressFrom: { postcode: postcodeOf(request.sender, 'sender.point') },
            addressTo: { postcode: postcodeOf(request.recipient, 'recipient.point') },
            type,
            deliveryType,
            parcels,
            ...(cod !== undefined ? { postPay: cod } : {}),
          };
          const price = await ecom.pricing.calculate(body, options);
          const discount = Math.round((price.rawDeliveryPrice - price.deliveryPrice) * 100) / 100;
          return {
            carrier: 'ukrposhta',
            service: type,
            serviceName: SERVICE_NAMES[type],
            total: money(price.deliveryPrice, 'UAH'),
            charges: [
              { type: 'delivery', amount: money(price.rawDeliveryPrice, 'UAH') },
              ...(discount > 0 ? [{ type: 'discount', amount: money(-discount, 'UAH') }] : []),
            ],
            raw: price,
          };
        }),
      );
      const rates = results.flatMap(result => (result.status === 'fulfilled' ? [result.value] : []));
      if (rates.length === 0) {
        const failure = results.find((result): result is PromiseRejectedResult => result.status === 'rejected');
        throw failure?.reason ?? invalidInput('No rate could be calculated');
      }
      return rates;
    },

    async getLabel(request: LabelRequest, options: CallOptions = {}): Promise<Label> {
      if (request.format !== undefined && request.format !== 'PDF') {
        throw invalidInput(`Ukrposhta prints PDF stickers only, not ${request.format}`, 'format');
      }
      const size = stickerSize(request.size);
      const file = await ecom.labels.getSticker(request.shipmentId, { ...(size ? { size } : {}), ...options });
      return {
        format: 'PDF',
        encoding: 'binary',
        data: file.data,
        contentType: file.contentType,
        ...(request.size ? { size: request.size } : {}),
      };
    },

    /**
     * Ukrposhta deletes a shipment only while it is `CREATED` (not accepted at a post office). Later it cannot be
     * cancelled through the API, so the adapter reads the status first and says so.
     */
    async cancelShipment(id: string, options: CallOptions = {}): Promise<void> {
      const { status } = await ecom.shipments.getLifecycle(id, options);
      if (status !== 'CREATED') {
        throw notAllowed('NOT_CANCELLABLE', `A shipment with the status ${status} can no longer be cancelled`);
      }
      await ecom.shipments.delete(id, options);
    },

    /**
     * Form 103a: puts the shipments into a new group and prints its register. All shipments must have one sender and
     * one type, and must not be registered yet (the group closes at registration).
     */
    async createManifest(shipmentIds: string[], options: CallOptions = {}): Promise<Manifest> {
      if (shipmentIds.length === 0) throw invalidInput('At least one shipment is required', 'shipmentIds');
      const shipments = [];
      for (const id of shipmentIds) shipments.push(await ecom.shipments.get(id, options));
      const registered = shipments.find(shipment => shipment.lifecycle.status !== 'CREATED');
      if (registered) {
        throw invalidInput(
          `Shipment ${registered.uuid} is already ${registered.lifecycle.status}: only unregistered shipments can join a manifest`,
          'shipmentIds',
        );
      }
      const first = shipments[0];
      for (const shipment of shipments) {
        if (shipment.sender.uuid !== first.sender.uuid)
          throw invalidInput('All shipments of a manifest need one sender', 'shipmentIds');
        if (shipment.type !== first.type)
          throw invalidInput('All shipments of a manifest need one type', 'shipmentIds');
      }
      const group = await ecom.shipmentGroups.create(
        {
          name: `Manifest ${kyivNow()}`,
          clientUuid: first.sender.uuid,
          type: first.type,
        },
        options,
      );
      const results = await ecom.shipmentGroups.addShipments(
        group.uuid,
        shipments.map(shipment => shipment.uuid),
        options,
      );
      const failed = results.filter(result => result.httpStatus >= 300);
      if (failed.length > 0) {
        throw notAllowed(
          'MANIFEST_FAILED',
          `${failed.length} of ${results.length} shipments could not be added: ${failed[0].message}`,
        );
      }
      const file = await ecom.labels.getForm103a(group.uuid, options);
      return {
        id: group.uuid,
        carrier: 'ukrposhta',
        shipmentIds: shipments.map(shipment => shipment.uuid),
        document: { format: 'PDF', encoding: 'binary', data: file.data, contentType: file.contentType },
        raw: group,
      };
    },
  };
}

function stickerSize(size: string | undefined): StickerSize | undefined {
  if (size === undefined || size === '' || size === '100x100') return undefined;
  const normalized = size.toUpperCase();
  if (normalized === 'A4') return 'SIZE_A4';
  if (normalized === 'A5') return 'SIZE_A5';
  throw invalidInput(`Unknown sticker size "${size}": use 100x100, A4 or A5`, 'size');
}

const COURIER_INTERVALS: ReadonlyArray<{ interval: CourierInterval; from: number; to: number }> = [
  { interval: 'INTERVAL_09_12', from: 9 * 60, to: 12 * 60 },
  { interval: 'INTERVAL_12_15', from: 12 * 60, to: 15 * 60 },
  { interval: 'INTERVAL_15_18', from: 15 * 60, to: 18 * 60 },
];

const minutesOf = (time: string): number => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) throw invalidInput(`Expected a HH:mm time, got "${time}"`, 'window');
  return Number(match[1]) * 60 + Number(match[2]);
};

/**
 * The courier comes in one of three three-hour windows. A requested window maps to the interval that contains it;
 * without a window the morning interval is booked.
 */
export function courierIntervalOf(window: PickupRequest['window']): CourierInterval {
  if (!window) return 'INTERVAL_09_12';
  const from = minutesOf(window.from);
  const to = minutesOf(window.to);
  const match = COURIER_INTERVALS.find(item => from >= item.from && to <= item.to);
  if (!match) {
    throw invalidInput('Ukrposhta couriers come between 09:00-12:00, 12:00-15:00 or 15:00-18:00', 'window');
  }
  return match.interval;
}

export function createPickupApi(ecom: UkrposhtaEcomClientWithCourier) {
  return {
    /**
     * Orders a courier collection from the sender's address of the shipments (one sender, shipments not yet
     * collected). One shipment makes a SINGLE order, several a MASS order.
     */
    async schedulePickup(request: PickupRequest, options: CallOptions = {}): Promise<Pickup> {
      if (request.shipmentIds.length === 0) throw invalidInput('At least one shipment is required', 'shipmentIds');
      const interval = courierIntervalOf(request.window);
      const shipments = await Promise.all(request.shipmentIds.map(id => ecom.shipments.get(id, options)));
      const first = shipments[0];
      if (shipments.some(shipment => shipment.sender.uuid !== first.sender.uuid)) {
        throw invalidInput('All shipments of a pickup need one sender', 'shipmentIds');
      }
      if (shipments.some(shipment => shipment.senderAddressId !== first.senderAddressId)) {
        throw invalidInput('All shipments of a pickup need one sender address', 'shipmentIds');
      }
      const pickupAddress = first.sender.addresses.find(item => item.addressId === first.senderAddressId);
      if (pickupAddress === undefined) {
        throw invalidInput('The sender address of the shipments is not on the sender', 'shipmentIds');
      }
      const differs = addressDiffers(request.address, pickupAddress.address);
      if (differs !== undefined) {
        throw invalidInput(
          `The courier collects from the sender address of the shipments, which has a different ${differs}`,
          'address',
        );
      }
      const given = request.contact.phone;
      const phone =
        given !== undefined && given !== ''
          ? first.sender.phones.find(item => samePhone(item.phoneNumber, given))
          : (first.sender.phones.find(item => item.main) ??
            (first.sender.phones[0] as (typeof first.sender.phones)[number] | undefined));
      if (phone === undefined) {
        throw invalidInput(
          given !== undefined && given !== ''
            ? `The phone ${given} is not a phone of the sender`
            : 'The sender has no phone number',
          'contact.phone',
        );
      }

      const order = await ecom.courier.createOrder(
        {
          clientUuid: first.sender.uuid,
          type: shipments.length > 1 ? 'MASS' : 'SINGLE',
          addressId: first.senderAddressId,
          phoneId: phone.phoneId,
          dropDate: request.date.slice(0, 10),
          interval,
          shipmentBarcodes: shipments.map(shipment => shipment.barcode),
          ...(request.contact.email ? { email: request.contact.email } : {}),
        },
        options,
      );
      return { id: order.uuid, carrier: 'ukrposhta', date: order.dropDate, status: order.lastStatus, raw: order };
    },
  };
}

/** Current Kyiv time as `YYYY-MM-DD HH:mm`, for group names. */
function kyivNow(): string {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Kyiv',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());
  return parts.slice(0, 16);
}

const norm = (value: string | null | undefined) => (value ?? '').trim().toLowerCase();

/** The first field of a requested pickup address that differs from the stored one; fields not given are not compared. */
function addressDiffers(wanted: PickupRequest['address'], stored: ClientAddress['address']): string | undefined {
  if (wanted.country.toUpperCase() !== 'UA') return 'country';
  if (wanted.postalCode !== undefined && wanted.postalCode !== stored.postcode) return 'postcode';
  const checks: Array<[string, string | undefined, string | null | undefined]> = [
    ['street', wanted.street ?? wanted.lines?.join(', '), stored.street],
    ['house number', wanted.building, stored.houseNumber],
    ['apartment', wanted.apartment, stored.apartmentNumber],
    ['city', wanted.city, stored.city],
  ];
  return checks.find(([, given, have]) => given !== undefined && given !== '' && norm(given) !== norm(have))?.[0];
}
