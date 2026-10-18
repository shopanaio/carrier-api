import type { HttpRequest, HttpTransport } from '@shopana/carrier-core';
import { CarrierErrorCategory } from '@shopana/carrier-core';
import { createUkrposhtaContractClient } from '../src';
import type { CourierOrder } from '../src';
import { addressFrom, clientFrom, shipmentFrom } from './helpers/fixtures';
import { createMockTransport, fail, ok } from './helpers/mock';

const ECOM = '/ecom/0.0.1';

function build(mock: ReturnType<typeof createMockTransport>) {
  const base = createUkrposhtaContractClient({
    transport: mock.transport,
    bearer: 'ecom',
    counterpartyToken: 'cp',
    retry: false,
  });
  return base;
}

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
    });
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
      method: 'PUT',
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

  it('masks the counterparty token inside the return order body in logs', async () => {
    const events: string[] = [];
    const transport: HttpTransport = (async () => ({ status: 200, headers: {}, data: {} })) as HttpTransport;
    const client = createUkrposhtaContractClient({
      transport,
      bearer: 'secret-bearer',
      counterpartyToken: 'secret-token',
      retry: false,
      logger: event => events.push(JSON.stringify(event)),
    });
    await client.management.createReturnOrder({ barcode: 'B', returnAddressId: 1 });
    expect(events.length).toBeGreaterThan(0);
    expect(events.join('')).not.toContain('secret-token');
    expect(events.join('')).not.toContain('secret-bearer');
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
    });
    await client.management.createReturnOrder({ barcode: 'B', returnAddressId: 1 });
    expect(requests[0]!.body).toMatchObject({ value: { senderToken: 'lazy-token' } });
    expect(requests[0]!.query).toMatchObject({ token: 'lazy-token' });
  });
});
