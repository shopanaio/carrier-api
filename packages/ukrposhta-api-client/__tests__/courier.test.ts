import type { HttpRequest, HttpTransport } from '@shopana/carrier-core';
import { CarrierErrorCategory } from '@shopana/carrier-core';
import type { CreateShipmentInput, Party } from '@shopana/carrier-contracts';
import { money } from '@shopana/carrier-contracts';
import {
  AddressesService,
  ClientsService,
  CourierService,
  LabelsService,
  ManagementService,
  PricingService,
  ShipmentGroupsService,
  ShipmentsService,
  createUkrposhtaContractClient,
} from '../src';
import { courierIntervalOf } from '../src/adapter/shipments';
import { createUkrposhtaAdapter } from '../src/adapter';
import { createUkrposhtaSimulator } from '../src/simulator';

function setup() {
  const world = createUkrposhtaSimulator();
  const retry = { sleep: world.clock.sleep, clock: world.clock };
  const ecom = createUkrposhtaContractClient({
    transport: world.transport,
    retry,
    bearer: 'ecom',
    counterpartyToken: 'cp',
  })
    .use(new AddressesService())
    .use(new ClientsService())
    .use(new ShipmentsService())
    .use(new PricingService())
    .use(new ShipmentGroupsService())
    .use(new LabelsService())
    .use(new CourierService());
  return { world, ecom, adapter: createUkrposhtaAdapter({ ecom }) };
}

const sender: Party = {
  contact: { firstName: 'Петро', lastName: 'Петренко', phone: '+380672802273', email: 'p@example.com' },
  point: { type: 'door', address: { country: 'UA', postalCode: '04071', city: 'Київ' } },
  externalId: 'shop-1',
  taxId: '4201030327',
};
const recipient: Party = {
  contact: { name: 'Іванов Іван', phone: '0982004113' },
  point: { type: 'door', address: { country: 'UA', postalCode: '79000', city: 'Львів' } },
};
const input: CreateShipmentInput = {
  sender,
  recipient,
  parcels: [{ weight: { value: 1, unit: 'kg' }, declaredValue: money(100, 'UAH') }],
};

describe('courierIntervalOf', () => {
  it('maps a window to the interval that contains it', () => {
    expect(courierIntervalOf(undefined)).toBe('INTERVAL_09_12');
    expect(courierIntervalOf({ from: '09:00', to: '12:00' })).toBe('INTERVAL_09_12');
    expect(courierIntervalOf({ from: '13:00', to: '14:30' })).toBe('INTERVAL_12_15');
    expect(courierIntervalOf({ from: '15:00', to: '18:00' })).toBe('INTERVAL_15_18');
  });

  it('refuses windows that fit no interval', () => {
    expect(() => courierIntervalOf({ from: '11:00', to: '13:00' })).toThrow(/09:00-12:00/);
    expect(() => courierIntervalOf({ from: '08:00', to: '10:00' })).toThrow(/09:00-12:00/);
    expect(() => courierIntervalOf({ from: 'noon', to: '13:00' })).toThrow(/HH:mm/);
  });
});

describe('courier service', () => {
  async function order() {
    const { world, ecom, adapter } = setup();
    const shipment = await adapter.createShipment(input);
    const raw = shipment.raw as { sender: { uuid: string; addressId: number; phones: Array<{ phoneId: number }> } };
    return { world, ecom, adapter, shipment, raw };
  }

  it('creates, reads, lists and follows an order', async () => {
    const { world, ecom, shipment, raw } = await order();
    const created = await ecom.courier.createOrder({
      clientUuid: raw.sender.uuid,
      type: 'SINGLE',
      addressId: raw.sender.addressId,
      phoneId: raw.sender.phones[0]!.phoneId,
      dropDate: '2026-10-20',
      interval: 'INTERVAL_12_15',
      shipmentBarcodes: [shipment.trackingNumber],
    });
    expect(created).toMatchObject({ lastStatus: 'ORDERED', orderNumber: 3219085, interval: 'INTERVAL_12_15' });
    expect(await ecom.courier.getOrder(created.uuid)).toMatchObject({ uuid: created.uuid });
    expect((await ecom.courier.listOrders(raw.sender.uuid)).map(o => o.uuid)).toEqual([created.uuid]);

    world.advanceCourierOrder(created.uuid, 'TRANSFERRED_TO_COURIER');
    expect(await ecom.courier.getOrder(created.uuid)).toMatchObject({
      courierLastName: 'Іванов',
      carNumber: 'AA3534AI',
    });
    const statuses = await ecom.courier.getStatuses(created.uuid);
    expect(statuses.map(s => s.orderStatus)).toEqual(['ORDERED', 'TRANSFERRED_TO_COURIER']);
  });

  it('rejects an order the carrier would reject', async () => {
    const { ecom, shipment, raw } = await order();
    const base = {
      clientUuid: raw.sender.uuid,
      type: 'SINGLE' as const,
      addressId: raw.sender.addressId,
      phoneId: raw.sender.phones[0]!.phoneId,
      dropDate: '2026-10-20',
      interval: 'INTERVAL_09_12' as const,
    };
    await expect(ecom.courier.createOrder({ ...base, shipmentBarcodes: [] })).rejects.toMatchObject({
      field: 'shipmentBarcodes',
    });
    await expect(
      ecom.courier.createOrder({ ...base, addressId: 1, shipmentBarcodes: [shipment.trackingNumber] }),
    ).rejects.toMatchObject({ field: 'addressId' });
    await expect(
      ecom.courier.createOrder({ ...base, phoneId: 99999, shipmentBarcodes: [shipment.trackingNumber] }),
    ).rejects.toMatchObject({ field: 'phoneId' });
    await expect(ecom.courier.createOrder({ ...base, shipmentBarcodes: ['0500000000000'] })).rejects.toMatchObject({
      category: CarrierErrorCategory.NotFound,
    });
    await expect(ecom.courier.getOrder('nope')).rejects.toMatchObject({ category: CarrierErrorCategory.NotFound });
  });
});

describe('schedulePickup', () => {
  it('has the capability only when the courier service is present', () => {
    const { adapter } = setup();
    expect(adapter.capabilities.has('pickup')).toBe(true);
    const world = createUkrposhtaSimulator();
    const bare = createUkrposhtaContractClient({ transport: world.transport, bearer: 'b', counterpartyToken: 't' })
      .use(new AddressesService())
      .use(new ClientsService())
      .use(new ShipmentsService())
      .use(new PricingService())
      .use(new ShipmentGroupsService())
      .use(new LabelsService());
    expect(createUkrposhtaAdapter({ ecom: bare }).capabilities.has('pickup')).toBe(false);
  });

  it('orders a SINGLE collection for one shipment and a MASS one for several', async () => {
    const { world, adapter } = setup();
    const a = await adapter.createShipment(input);
    const b = await adapter.createShipment({ ...input, reference: 'second' });
    const single = await adapter.schedulePickup({
      shipmentIds: [a.id],
      address: { country: 'UA', postalCode: '04071' },
      contact: { phone: '0672802273', email: 'p@example.com' },
      date: '2026-10-20T00:00:00Z',
      window: { from: '15:00', to: '18:00' },
    });
    expect(single).toMatchObject({ carrier: 'ukrposhta', date: '2026-10-20', status: 'ORDERED' });
    expect(world.ecom.callsTo('createCourierDeliveryOrderUsingPOST').at(-1)!.body).toMatchObject({
      type: 'SINGLE',
      interval: 'INTERVAL_15_18',
      dropDate: '2026-10-20',
      shipmentBarcodes: [a.trackingNumber],
      email: 'p@example.com',
    });
    await adapter.schedulePickup({
      shipmentIds: [a.id, b.id],
      address: { country: 'UA' },
      contact: {},
      date: '2026-10-21',
    });
    expect(world.ecom.callsTo('createCourierDeliveryOrderUsingPOST').at(-1)!.body).toMatchObject({ type: 'MASS' });
  });

  it('rejects other senders, other addresses and empty requests', async () => {
    const { adapter } = setup();
    const a = await adapter.createShipment(input);
    const other = await adapter.createShipment({ ...input, sender: { ...sender, externalId: 'shop-2' } });
    const base = { address: { country: 'UA' }, contact: {}, date: '2026-10-20' };
    await expect(adapter.schedulePickup({ ...base, shipmentIds: [a.id, other.id] })).rejects.toMatchObject({
      field: 'shipmentIds',
    });
    await expect(adapter.schedulePickup({ ...base, shipmentIds: [] })).rejects.toMatchObject({ field: 'shipmentIds' });
    await expect(
      adapter.schedulePickup({ ...base, shipmentIds: [a.id], address: { country: 'UA', postalCode: '79000' } }),
    ).rejects.toMatchObject({ field: 'address' });
    await expect(
      adapter.schedulePickup({ ...base, shipmentIds: [a.id], window: { from: '11:00', to: '13:00' } }),
    ).rejects.toMatchObject({ field: 'window' });
  });
});

describe('management service', () => {
  function stub() {
    const requests: HttpRequest[] = [];
    const transport: HttpTransport = (async (request: HttpRequest) => {
      requests.push(request);
      return { status: 200, headers: {}, data: {} };
    }) as HttpTransport;
    const client = createUkrposhtaContractClient({
      transport,
      bearer: 'b',
      counterpartyToken: 'tok',
      retry: false,
    }).use(new ManagementService());
    const last = () => {
      const request = requests[requests.length - 1]!;
      return {
        method: request.method,
        path: new URL(request.url).pathname,
        query: request.query,
        body: request.body && 'value' in request.body ? request.body.value : undefined,
      };
    };
    return { client, last };
  }

  it('maps every operation to its documented request', async () => {
    const { client, last } = stub();
    const base = '/ecom/0.0.1';
    await client.management.extendStorage('s1', 17);
    expect(last()).toMatchObject({
      method: 'PUT',
      path: `${base}/shipments/management/s1/return-after-storage-days/17`,
      query: { token: 'tok' },
    });
    await client.management.changeRecipientPhone('s1', '+380672802273');
    expect(last()).toMatchObject({
      method: 'PUT',
      path: `${base}/shipments/management/s1/recipient`,
      body: { recipientPhone: '+380672802273' },
    });
    await client.management.changeRecipient('s1', { uuid: 'c2' });
    expect(last().body).toEqual({ recipient: { uuid: 'c2' } });
    await client.management.forward('s1', { recipient: { uuid: 'c2' }, deliveryType: 'W2W' });
    expect(last()).toMatchObject({
      method: 'POST',
      path: `${base}/shipments/management/s1/forward`,
      body: { deliveryType: 'W2W' },
    });
    await client.management.changePostPay('s1', 1000);
    expect(last()).toMatchObject({
      method: 'PUT',
      path: `${base}/shipments/management/s1/postpay`,
      body: { postPay: 1000 },
    });
    await client.management.createReturnOrder({ barcode: '0500000145397', returnAddressId: 7656280 });
    expect(last()).toMatchObject({
      method: 'POST',
      path: `${base}/dispatch/return-order`,
      body: { barcode: '0500000145397', senderToken: 'tok', returnAddressId: '7656280' },
    });
  });

  it('resolves a lazy counterparty token for the return order body', async () => {
    const requests: HttpRequest[] = [];
    const transport: HttpTransport = (async (request: HttpRequest) => {
      requests.push(request);
      return { status: 200, headers: {}, data: {} };
    }) as HttpTransport;
    const client = createUkrposhtaContractClient({
      transport,
      bearer: 'b',
      counterpartyToken: async () => 'lazy-token',
      retry: false,
    }).use(new ManagementService());
    await client.management.createReturnOrder({ barcode: 'B', returnAddressId: 1 });
    expect(requests[0]!.body).toMatchObject({ value: { senderToken: 'lazy-token' } });
    expect(requests[0]!.query).toMatchObject({ token: 'lazy-token' });
  });
});
