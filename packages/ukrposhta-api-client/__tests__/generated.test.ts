import { GENERATED_OPERATIONS, createUkrposhtaContractClient } from '../src';
import type { ShipmentInput } from '../src';
import { createMockTransport, ok } from './helpers/mock';

const NAMESPACES = [
  'addresses',
  'clients',
  'shipments',
  'pricing',
  'shipmentGroups',
  'labels',
  'courier',
  'management',
  'transfers',
  'barcodes',
  'reference',
  'deliveryNotifications',
  'documentBack',
  'letters',
  'countries',
];

function setup() {
  const mock = createMockTransport([
    { method: 'GET', path: '*', respond: ok({}) },
    { method: 'POST', path: '*', respond: ok({}) },
    { method: 'PUT', path: '*', respond: ok({}) },
    { method: 'DELETE', path: '*', respond: ok({}) },
  ]);
  const client = createUkrposhtaContractClient({
    transport: mock.transport,
    bearer: 'ecom',
    counterpartyToken: 'cp',
    retry: false,
  });
  return { mock, client };
}

describe('the client mounts every service', () => {
  it('has all namespaces without any .use()', () => {
    const { client } = setup();
    for (const namespace of NAMESPACES) expect(client).toHaveProperty(namespace);
  });
});

describe('generated operations', () => {
  it('cover the rest of the snapshot', () => {
    expect(GENERATED_OPERATIONS.length).toBeGreaterThanOrEqual(130);
    const keys = GENERATED_OPERATIONS.map(op => `${op.group}.${op.method}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it.each(GENERATED_OPERATIONS.map(op => [`${op.group}.${op.method}`, op] as const))(
    '%s sends its request',
    async (_name, op) => {
      const { mock, client } = setup();
      const service = (client as unknown as Record<string, Record<string, (args: object) => Promise<unknown>>>)[
        op.group
      ]!;
      const pathParams = [...op.path.matchAll(/\{([^}]+)\}/g)].map(match => match[1]!);
      const args = { ...Object.fromEntries(pathParams.map(name => [name, 'X'])), body: {} };
      await service[op.method]!(args);

      const call = mock.last();
      const host = op.binary ? '/forms/ecom/0.0.1' : '/ecom/0.0.1';
      expect(call.method).toBe(op.httpMethod);
      expect(call.path).toBe(`${host}${op.path.replace(/\{[^}]+\}/g, 'X')}`);
      expect(call.headers.authorization).toBe('Bearer ecom');
      // The token goes to exactly the operations that list it.
      expect(call.query.token).toBe(op.token ? 'cp' : undefined);
      expect(call.request.responseType).toBe(op.binary ? 'binary' : undefined);
    },
  );
});

describe('documented extras', () => {
  it('reads the JSON of form 119 under the documented paths', async () => {
    const { mock, client } = setup();
    await client.deliveryNotifications.getForm119Json('B1');
    expect(mock.last().path).toBe('/ecom/0.0.1/shipments/B1/form119/json');
    await client.deliveryNotifications.getForm119JsonByNotification('N1');
    expect(mock.last().path).toBe('/ecom/0.0.1/shipments/delivery-notifications/N1/form119/json');
    await client.deliveryNotifications.getGroupForm119Json('G1');
    expect(mock.last().path).toBe('/ecom/0.0.1/shipment-groups/G1/form119/json');
  });

  it('takes the packaging and international fields of a shipment in a typed literal', async () => {
    const { mock, client } = setup();
    const shipment: ShipmentInput = {
      sender: { uuid: 's' },
      recipient: { uuid: 'r' },
      deliveryType: 'W2W',
      properties: { packagingPaidByRecipient: true },
      packageType: 'PARCEL',
      currencyCode: 'EUR',
      parcels: [
        {
          weight: 1000,
          length: 20,
          width: 10,
          height: 10,
          properties: { packagingPrice: 25, KMAT: 'K-1' },
          contentsType: 'GOODS',
        },
      ],
    };
    await client.shipments.create(shipment);
    expect(mock.last().body).toEqual(shipment);
  });
});

describe('the default transport', () => {
  it('is the fetch transport of carrier-core', async () => {
    const fetchMock = jest.fn(
      async () => new Response('[]', { status: 200, headers: { 'content-type': 'application/json' } }),
    );
    const original = globalThis.fetch;
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    try {
      const { createUkrposhtaTrackingClient, createUkrposhtaClassifierClient } = await import('../src');
      await createUkrposhtaTrackingClient({ bearer: 't', retry: false }).tracking.getStatuses('B1');
      await createUkrposhtaClassifierClient({ bearer: 'e', retry: false }).classifier.getRegions({ regionName: 'a' });
      await createUkrposhtaContractClient({ bearer: 'e', counterpartyToken: 't', retry: false }).addresses.get(1);
      const urls = fetchMock.mock.calls.map(call => String((call as unknown as [string])[0]));
      expect(urls[0]).toContain('https://www.ukrposhta.ua/status-tracking/0.0.1/statuses');
      expect(urls[1]).toContain('https://www.ukrposhta.ua/address-classifier-ws/get_regions_by_region_ua');
      expect(urls[2]).toContain('https://www.ukrposhta.ua/ecom/0.0.1/addresses/1');
    } finally {
      globalThis.fetch = original;
    }
  });
});
