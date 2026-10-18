import type { HttpRequest, HttpTransport } from '@shopana/carrier-core';
import { CarrierErrorCategory } from '@shopana/carrier-core';
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
import type { CourierOrder } from '../src';
import { courierIntervalOf } from '../src/adapter/shipments';
import { createUkrposhtaAdapter } from '../src/adapter';
import { addressFrom, clientFrom, shipmentFrom } from './helpers/fixtures';
import { createMockTransport, fail, ok } from './helpers/mock';

const ECOM = '/ecom/0.0.1';

function build(mock: ReturnType<typeof createMockTransport>, withCourier = true) {
  const base = createUkrposhtaContractClient({
    transport: mock.transport,
    bearer: 'ecom',
    counterpartyToken: 'cp',
    retry: false,
  })
    .use(new AddressesService())
    .use(new ClientsService())
    .use(new ShipmentsService())
    .use(new PricingService())
    .use(new ShipmentGroupsService())
    .use(new LabelsService());
  return withCourier ? base.use(new CourierService()) : base;
}

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

const order: CourierOrder = {
  uuid: 'o1',
  orderNumber: 3219085,
  clientUuid: 'c1',
  type: 'SINGLE',
  addressId: 100001,
  phoneId: 24001,
  dropDate: '2026-10-20',
  interval: 'INTERVAL_12_15',
  shipmentBarcodes: ['0500000000001'],
  lastStatus: 'ORDERED',
  lastStatusDate: '2026-10-18T11:31:05',
};

describe('courier service', () => {
  it('creates, reads, lists and follows an order', async () => {
    const mock = createMockTransport([
      { method: 'POST', path: `${ECOM}/courier-service/orders`, respond: ok(order) },
      { method: 'GET', path: `${ECOM}/courier-service/orders/{id}`, respond: ok(order) },
      { method: 'GET', path: `${ECOM}/clients/{id}/courier-delivery-orders`, respond: ok([order]) },
      {
        method: 'GET',
        path: `${ECOM}/courier-service/orders/{id}/statuses`,
        respond: ok([{ uuid: 's1', orderUuid: 'o1', statusDate: '2026-10-18T11:31:05', orderStatus: 'ORDERED' }]),
      },
    ]);
    const client = build(mock);
    const { lastStatus: _status, lastStatusDate: _date, orderNumber: _number, uuid: _uuid, ...input } = order;
    expect(await client.courier.createOrder(input)).toMatchObject({ uuid: 'o1', lastStatus: 'ORDERED' });
    expect(mock.last()).toMatchObject({
      method: 'POST',
      path: `${ECOM}/courier-service/orders`,
      query: { token: 'cp' },
      body: input,
    });
    expect(await client.courier.getOrder('o1')).toMatchObject({ orderNumber: 3219085 });
    expect(mock.last().path).toBe(`${ECOM}/courier-service/orders/o1`);
    expect(await client.courier.listOrders('c1')).toHaveLength(1);
    expect(mock.last().path).toBe(`${ECOM}/clients/c1/courier-delivery-orders`);
    expect((await client.courier.getStatuses('o1'))[0]).toMatchObject({ orderStatus: 'ORDERED' });
    expect(mock.last().path).toBe(`${ECOM}/courier-service/orders/o1/statuses`);
  });

  it('maps a carrier rejection', async () => {
    const mock = createMockTransport([
      { method: 'GET', path: `${ECOM}/courier-service/orders/{id}`, respond: fail(404, 'UPE02001', 'Order not found') },
    ]);
    await expect(build(mock).courier.getOrder('nope')).rejects.toMatchObject({
      category: CarrierErrorCategory.NotFound,
    });
  });
});

describe('schedulePickup', () => {
  const address = addressFrom({ postcode: '04071', street: 'Khoryva' });
  const senderClient = {
    ...clientFrom(
      {
        addressId: address.id,
        phoneNumber: '0672802273',
        type: 'INDIVIDUAL',
        firstName: 'Petro',
        lastName: 'Petrenko',
      },
      address,
    ),
    uuid: 'sender-1',
  };
  senderClient.phones = [
    { uuid: 'p1', phoneId: 111, phoneNumber: '+380501112233', type: 'WORK', main: false },
    { uuid: 'p2', phoneId: 222, phoneNumber: '+380672802273', type: 'PERSONAL', main: true },
  ];
  const makeShipment = (uuid: string, sender = senderClient) => ({
    ...shipmentFrom(
      {
        sender: { uuid: sender.uuid },
        recipient: { uuid: 'r' },
        deliveryType: 'W2W',
        parcels: [{ weight: 1000, length: 10 }],
        senderAddressId: address.id,
      },
      sender,
    ),
    uuid,
  });

  function pickupMock(shipments: Array<ReturnType<typeof makeShipment>>) {
    const mock = createMockTransport();
    for (const shipment of shipments) {
      mock.on({ method: 'GET', path: `${ECOM}/shipments/${shipment.uuid}`, respond: ok(shipment) });
    }
    mock.on({
      method: 'POST',
      path: `${ECOM}/courier-service/orders`,
      respond: call =>
        ok({
          ...(call.body as object),
          uuid: 'order-1',
          orderNumber: 1,
          lastStatus: 'ORDERED',
          lastStatusDate: '2026-10-18T11:31:05',
        }),
    });
    return mock;
  }

  const request = {
    address: { country: 'UA', postalCode: '04071' },
    contact: { phone: '0672802273', email: 'p@example.com' },
    date: '2026-10-20T00:00:00Z',
  };

  it('has the capability only when the courier service is present', () => {
    const mock = createMockTransport();
    expect(createUkrposhtaAdapter({ ecom: build(mock) }).capabilities.has('pickup')).toBe(true);
    expect(createUkrposhtaAdapter({ ecom: build(mock, false) }).capabilities.has('pickup')).toBe(false);
  });

  it('orders a SINGLE collection for one shipment, with the phone the contact named', async () => {
    const a = makeShipment('s1');
    const mock = pickupMock([a]);
    const adapter = createUkrposhtaAdapter({ ecom: build(mock) });
    const pickup = await adapter.schedulePickup({
      ...request,
      shipmentIds: ['s1'],
      contact: { phone: '050 111 22 33', email: 'p@example.com' },
      window: { from: '15:00', to: '18:00' },
    });
    expect(pickup).toMatchObject({ id: 'order-1', carrier: 'ukrposhta', date: '2026-10-20', status: 'ORDERED' });
    expect(mock.last().body).toMatchObject({
      clientUuid: 'sender-1',
      type: 'SINGLE',
      addressId: address.id,
      // The contact's phone matched the sender's work phone.
      phoneId: 111,
      dropDate: '2026-10-20',
      interval: 'INTERVAL_15_18',
      shipmentBarcodes: [a.barcode],
      email: 'p@example.com',
    });
  });

  it('orders a MASS collection for several shipments, with the main phone by default', async () => {
    const a = makeShipment('s1');
    const b = makeShipment('s2');
    const mock = pickupMock([a, b]);
    const adapter = createUkrposhtaAdapter({ ecom: build(mock) });
    await adapter.schedulePickup({
      shipmentIds: ['s1', 's2'],
      address: { country: 'UA' },
      contact: {},
      date: '2026-10-21',
    });
    expect(mock.last().body).toMatchObject({
      type: 'MASS',
      phoneId: 222,
      interval: 'INTERVAL_09_12',
      shipmentBarcodes: [a.barcode, b.barcode],
    });
  });

  it('rejects other senders, other addresses, bad windows and empty requests before ordering', async () => {
    const a = makeShipment('s1');
    const other = makeShipment('s2', { ...senderClient, uuid: 'sender-2' });
    const mock = pickupMock([a, other]);
    const adapter = createUkrposhtaAdapter({ ecom: build(mock) });
    const base = { address: { country: 'UA' }, contact: {}, date: '2026-10-20' };
    await expect(adapter.schedulePickup({ ...base, shipmentIds: ['s1', 's2'] })).rejects.toMatchObject({
      field: 'shipmentIds',
    });
    await expect(adapter.schedulePickup({ ...base, shipmentIds: [] })).rejects.toMatchObject({ field: 'shipmentIds' });
    await expect(
      adapter.schedulePickup({ ...base, shipmentIds: ['s1'], address: { country: 'UA', postalCode: '79000' } }),
    ).rejects.toMatchObject({ field: 'address' });
    await expect(
      adapter.schedulePickup({ ...base, shipmentIds: ['s1'], window: { from: '11:00', to: '13:00' } }),
    ).rejects.toMatchObject({ field: 'window' });
    expect(mock.callsTo('POST', `${ECOM}/courier-service/orders`)).toHaveLength(0);
  });

  it('needs a phone on the sender', async () => {
    const a = makeShipment('s1', { ...senderClient, phones: [] });
    const adapter = createUkrposhtaAdapter({ ecom: build(pickupMock([a])) });
    await expect(adapter.schedulePickup({ ...request, shipmentIds: ['s1'], contact: {} })).rejects.toMatchObject({
      field: 'contact.phone',
    });
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
