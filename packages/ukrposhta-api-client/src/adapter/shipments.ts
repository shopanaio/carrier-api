// code and comments in English
import { money } from '@shopana/carrier-contracts';
import type {
  CallOptions,
  CreateShipmentInput,
  Label,
  LabelRequest,
  Manifest,
  Party,
  Rate,
  RateRequest,
  Shipment,
} from '@shopana/carrier-contracts';
import type { StickerSize } from '../contract/types/common';
import type { Client, ClientAddress } from '../contract/types/client';
import type { ShipmentInput, Shipment as UkrposhtaShipment } from '../contract/types/shipment';
import type { DeliveryPriceRequest } from '../contract/types/pricing';
import { kyivLocalToIso } from './time';
import type { UkrposhtaEcomClient } from './clients';
import { invalidInput, isNotFound, notAllowed } from './errors';
import {
  SERVICE_NAMES,
  deliveryTypeOf,
  findAddress,
  lifecycleToTrackingStatus,
  postcodeOf,
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
    const created = await ecom.clients.create(toClientInput(party, addressId, field), options);
    return { clientUuid: created.uuid, addressId, client: created };
  }

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
    createdAt: kyivLocalToIso(raw.lastModified),
    raw,
  };
}

/** COD needs a declared price at least as large; when the consumer gave none, the first parcel carries the COD amount. */
function withDeclaredPriceForCod(parcels: ReturnType<typeof toParcelInput>[], cod: number | undefined) {
  if (cod === undefined) return parcels;
  const declared = parcels.reduce((sum, parcel) => sum + (parcel.declaredPrice ?? 0), 0);
  if (declared >= cod || parcels.length === 0) return parcels;
  const [first, ...rest] = parcels as [ReturnType<typeof toParcelInput>, ...ReturnType<typeof toParcelInput>[]];
  return [{ ...first, declaredPrice: (first.declaredPrice ?? 0) + (cod - declared) }, ...rest];
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
      const parcels = withDeclaredPriceForCod(input.parcels.map(toParcelInput), cod);

      const sender = await resolveParty(ecom, input.sender, 'sender', options);
      const recipient = await resolveParty(ecom, input.recipient, 'recipient', options);

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
              // A company receives cash on delivery on its bank account.
              ...(sender.client.type === 'COMPANY' ? { transferPostPayToBankAccount: true } : {}),
            }
          : {}),
        ...(input.reference ? { externalId: input.reference.slice(0, 64) } : {}),
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
      const parcels = withDeclaredPriceForCod(request.parcels.map(toParcelInput), cod);

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
      const shipments = await Promise.all(shipmentIds.map(id => ecom.shipments.get(id, options)));
      const first = shipments[0];
      for (const shipment of shipments) {
        if (shipment.sender.uuid !== first.sender.uuid)
          throw invalidInput('All shipments of a manifest need one sender', 'shipmentIds');
        if (shipment.type !== first.type)
          throw invalidInput('All shipments of a manifest need one type', 'shipmentIds');
      }
      const group = await ecom.shipmentGroups.create(
        {
          name: `Manifest ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`,
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
