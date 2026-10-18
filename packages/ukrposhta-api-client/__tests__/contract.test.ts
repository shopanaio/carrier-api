import type { HttpRequest, HttpResponse, HttpTransport } from '@shopana/carrier-core';
import { CarrierErrorCategory, isCarrierError } from '@shopana/carrier-core';
import {
  AddressesService,
  ClientsService,
  LabelsService,
  PricingService,
  ShipmentGroupsService,
  ShipmentsService,
  createUkrposhtaContractClient,
} from '../src';

type Answer = Partial<HttpResponse<unknown>> | ((request: HttpRequest) => Partial<HttpResponse<unknown>>);

function setup(answer: Answer = { data: {} }, config: { environment?: 'production' | 'sandbox' } = {}) {
  const requests: HttpRequest[] = [];
  const transport: HttpTransport = (async (request: HttpRequest) => {
    requests.push(request);
    const part = typeof answer === 'function' ? answer(request) : answer;
    return { status: 200, headers: {}, data: {}, ...part };
  }) as HttpTransport;
  const client = createUkrposhtaContractClient({
    transport,
    bearer: 'ecom-bearer',
    counterpartyToken: 'cp-token',
    retry: false,
    ...config,
  })
    .use(new AddressesService())
    .use(new ClientsService())
    .use(new ShipmentsService())
    .use(new PricingService())
    .use(new ShipmentGroupsService())
    .use(new LabelsService());
  const last = () => {
    const request = requests[requests.length - 1]!;
    const url = new URL(request.url);
    return {
      method: request.method,
      path: url.pathname,
      host: url.origin,
      query: request.query ?? {},
      auth: request.headers?.Authorization,
      body: request.body && 'value' in request.body ? request.body.value : undefined,
      responseType: request.responseType,
    };
  };
  return { client, requests, last };
}

describe('authorization', () => {
  it('sends the eCom bearer and the counterparty token to token operations', async () => {
    const { client, last } = setup();
    await client.shipments.get('abc');
    expect(last()).toMatchObject({
      method: 'GET',
      path: '/ecom/0.0.1/shipments/abc',
      auth: 'Bearer ecom-bearer',
      query: { token: 'cp-token' },
    });
  });

  it.each([
    ['addresses.create', (c: ReturnType<typeof setup>['client']) => c.addresses.create({ postcode: '04071' })],
    ['pricing.listTariffs', (c: ReturnType<typeof setup>['client']) => c.pricing.listTariffs()],
    [
      'pricing.calculate',
      (c: ReturnType<typeof setup>['client']) =>
        c.pricing.calculate({
          addressFrom: { postcode: '04071' },
          addressTo: { postcode: '47743' },
          type: 'EXPRESS',
          deliveryType: 'W2W',
          weight: 3000,
          length: 35,
        }),
    ],
  ])('does not send the token on %s', async (_name, call) => {
    const { client, last } = setup();
    await call(client);
    expect(last().query).not.toHaveProperty('token');
    expect(last().auth).toBe('Bearer ecom-bearer');
  });

  it('uses the sandbox host for the sandbox environment', async () => {
    const { client, last } = setup({ data: {} }, { environment: 'sandbox' });
    await client.addresses.get(5);
    expect(last().host).toBe('https://dev.ukrposhta.ua');
    expect(last().path).toBe('/ecom/0.0.1/addresses/5');
  });
});

describe('addresses', () => {
  it('creates, reads, checks a route and updates the description', async () => {
    const { client, last } = setup();
    await client.addresses.create({ postcode: '04071', city: 'Київ' });
    expect(last()).toMatchObject({
      method: 'POST',
      path: '/ecom/0.0.1/addresses',
      body: { postcode: '04071', city: 'Київ' },
    });
    await client.addresses.checkRoute('04071', '47743');
    expect(last().path).toBe('/ecom/0.0.1/addresses/availability-checking/from/04071/to/47743');
    await client.addresses.updateDescription(7, 'Updated');
    expect(last()).toMatchObject({
      method: 'PUT',
      path: '/ecom/0.0.1/addresses/description/7',
      body: { description: 'Updated' },
    });
  });
});

describe('clients', () => {
  it('creates one client or many', async () => {
    const { client, last } = setup();
    await client.clients.create({ name: 'ТОВ', addressId: 1, phoneNumber: '0671231234', type: 'COMPANY' });
    expect(last().method).toBe('POST');
    expect(last().body).toMatchObject({ name: 'ТОВ' });
    await client.clients.create([
      { name: 'A', addressId: 1, phoneNumber: '1' },
      { name: 'B', addressId: 1, phoneNumber: '2' },
    ]);
    expect(Array.isArray(last().body)).toBe(true);
  });

  it('updates, reads and looks clients up', async () => {
    const { client, last } = setup();
    await client.clients.update('u1', { phoneNumber: '0445361100' });
    expect(last()).toMatchObject({ method: 'PUT', path: '/ecom/0.0.1/clients/u1' });
    await client.clients.getByExternalId('ext-1');
    expect(last().path).toBe('/ecom/0.0.1/clients/external-id/ext-1');
    await client.clients.getByPhone('0671231234');
    expect(last()).toMatchObject({
      path: '/ecom/0.0.1/clients/phone',
      query: { countryISO3166: 'UA', phoneNumber: '0671231234', token: 'cp-token' },
    });
    await client.clients.getFields('u1', ['name', 'type']);
    expect(last()).toMatchObject({ method: 'POST', body: ['name', 'type'] });
  });

  it('lists and deletes client contact data', async () => {
    const { client, last } = setup();
    await client.clients.listAddresses('u1');
    expect(last()).toMatchObject({ path: '/ecom/0.0.1/client-addresses', query: { clientUuid: 'u1' } });
    await client.clients.listEmails('u1');
    expect(last().path).toBe('/ecom/0.0.1/client-emails');
    await client.clients.listPhones('u1');
    expect(last().path).toBe('/ecom/0.0.1/client-phones');
    await client.clients.deleteAddress('a1');
    expect(last()).toMatchObject({ method: 'DELETE', path: '/ecom/0.0.1/client-addresses/a1' });
    await client.clients.deleteEmail('e1');
    expect(last().path).toBe('/ecom/0.0.1/client-emails/e1');
    await client.clients.deletePhone('p1');
    expect(last().path).toBe('/ecom/0.0.1/client-phones/p1');
  });

  it('checks phones and manages postpay recipients', async () => {
    const { client, last } = setup();
    await client.clients.listProhibitedPhones();
    expect(last().path).toBe('/ecom/0.0.1/phones/UA/prohibited');
    await client.clients.getProhibitedPhone('1234567');
    expect(last().path).toBe('/ecom/0.0.1/phones/UA/prohibited/1234567');
    await client.clients.getPhone(24645);
    expect(last().path).toBe('/ecom/0.0.1/phones/24645');
    await client.clients.addPostPayRecipient('c1', 'r1');
    expect(last()).toMatchObject({ method: 'POST', path: '/ecom/0.0.1/clients/c1/post-pay-recipients/r1' });
    await client.clients.removePostPayRecipient('c1', 'r1');
    expect(last().method).toBe('DELETE');
    await client.clients.listPostPayRecipients('c1');
    expect(last().path).toBe('/ecom/0.0.1/clients/c1/post-pay-recipients');
  });
});

describe('shipments', () => {
  const input = {
    sender: { uuid: 's' },
    recipient: { uuid: 'r' },
    deliveryType: 'W2D' as const,
    parcels: [{ weight: 1200, length: 170, width: 10, height: 10 }],
  };

  it('creates one shipment or many', async () => {
    const { client, last } = setup();
    await client.shipments.create(input);
    expect(last()).toMatchObject({ method: 'POST', path: '/ecom/0.0.1/shipments', body: input });
    await client.shipments.create([input, input]);
    expect(Array.isArray(last().body)).toBe(true);
  });

  it('does not repeat a shipment creation after a server error', async () => {
    const calls: number[] = [];
    const transport: HttpTransport = (async () => {
      calls.push(1);
      return { status: 503, headers: {}, data: { message: 'down' } };
    }) as HttpTransport;
    const client = createUkrposhtaContractClient({
      transport,
      bearer: 'b',
      counterpartyToken: 't',
      retry: { sleep: async () => undefined },
    }).use(new ShipmentsService());
    await expect(client.shipments.create(input)).rejects.toMatchObject({ httpStatus: 503 });
    expect(calls).toHaveLength(1);
  });

  it('reads by uuid, by barcode and by fields', async () => {
    const { client, last } = setup();
    await client.shipments.getByBarcode('0500100031143');
    expect(last().path).toBe('/ecom/0.0.1/shipments/barcode/0500100031143');
    await client.shipments.getFields('u1', ['weight', 'length']);
    expect(last()).toMatchObject({ method: 'POST', path: '/ecom/0.0.1/shipments/u1', body: ['weight', 'length'] });
    await client.shipments.getLifecycle('u1');
    expect(last().path).toBe('/ecom/0.0.1/shipments/u1/lifecycle');
  });

  it('updates one shipment or many', async () => {
    const { client, last } = setup();
    await client.shipments.update('u1', { description: 'new' });
    expect(last()).toMatchObject({ method: 'PUT', path: '/ecom/0.0.1/shipments/u1' });
    await client.shipments.updateMany([{ uuid: 'u1', description: 'a' }]);
    expect(last()).toMatchObject({ method: 'PUT', path: '/ecom/0.0.1/shipments' });
  });

  it('reads the price-change flag', async () => {
    const { client } = setup({ data: { message: 'isPriceChangedInPostOffice: true' } });
    await expect(client.shipments.isPriceChangedInPostOffice('B1')).resolves.toBe(true);
    const { client: other } = setup({ data: { message: 'isPriceChangedInPostOffice: false' } });
    await expect(other.shipments.isPriceChangedInPostOffice('B1')).resolves.toBe(false);
  });

  it('lists price changes within a period', async () => {
    const { client, last } = setup({ data: [] });
    await client.shipments.listPriceChanged('s1', { from: '2026-01-01', to: '2026-01-31', barcodes: true });
    expect(last()).toMatchObject({
      path: '/ecom/0.0.1/shipments/sender/s1/from/2026-01-01/to/2026-01-31/isPriceChangedInPostOffice',
      query: { barcodes: true },
    });
  });

  it('deletes a shipment and manages parcels', async () => {
    const { client, last } = setup();
    await client.shipments.delete('u1');
    expect(last()).toMatchObject({ method: 'DELETE', path: '/ecom/0.0.1/shipments/u1' });
    await client.shipments.addParcel('u1', { weight: 1000, length: 20 });
    expect(last()).toMatchObject({ method: 'POST', path: '/ecom/0.0.1/shipments/u1/parcels' });
    await client.shipments.deleteParcel('u1', 'B2');
    expect(last()).toMatchObject({ method: 'DELETE', path: '/ecom/0.0.1/shipments/u1/parcels/B2' });
  });
});

describe('pricing', () => {
  it('reads tariffs and calculates', async () => {
    const { client, last } = setup();
    await client.pricing.getTariff('t1');
    expect(last().path).toBe('/ecom/0.0.1/dictionaries/tariffs/t1');
    await client.pricing.calculate({
      addressFrom: { postcode: '04071' },
      addressTo: { postcode: '47743' },
      type: 'EXPRESS',
      deliveryType: 'W2W',
      parcels: [{ weight: 3000, length: 35, width: 20, height: 20 }],
      declaredPrice: 150,
    });
    expect(last()).toMatchObject({ method: 'POST', path: '/ecom/0.0.1/domestic/delivery-price' });
  });
});

describe('shipment groups', () => {
  it('creates, renames and fills a group', async () => {
    const { client, last } = setup();
    await client.shipmentGroups.create({ name: 'Group 1', clientUuid: 'c1' });
    expect(last()).toMatchObject({ method: 'POST', path: '/ecom/0.0.1/shipment-groups' });
    await client.shipmentGroups.rename('g1', 'Group 2');
    expect(last()).toMatchObject({ method: 'PUT', path: '/ecom/0.0.1/shipment-groups/g1', body: { name: 'Group 2' } });
    await client.shipmentGroups.addShipment('g1', 's1');
    expect(last()).toMatchObject({ method: 'POST', path: '/ecom/0.0.1/shipment-groups/g1/shipments/s1' });
    await client.shipmentGroups.addShipments('g1', ['s1', 's2']);
    expect(last()).toMatchObject({
      method: 'PUT',
      path: '/ecom/0.0.1/shipment-groups/g1/shipments',
      body: ['s1', 's2'],
    });
    await client.shipmentGroups.removeShipment('s1');
    expect(last()).toMatchObject({ method: 'DELETE', path: '/ecom/0.0.1/shipments/s1/shipment-group' });
  });

  it('creates shipments inside a group', async () => {
    const { client, last } = setup();
    const shipment = { sender: { uuid: 's' }, recipient: { uuid: 'r' }, deliveryType: 'W2W' as const, parcels: [] };
    await client.shipmentGroups.createShipment('g1', shipment);
    expect(last()).toMatchObject({ method: 'POST', path: '/ecom/0.0.1/shipment-groups/g1/shipments' });
  });

  it('finds groups by client, dates, name and shipment', async () => {
    const { client, last } = setup();
    await client.shipmentGroups.listByClient('c1', { type: 'EXPRESS' });
    expect(last()).toMatchObject({ path: '/ecom/0.0.1/shipment-groups/clients/c1', query: { type: 'EXPRESS' } });
    await client.shipmentGroups.listByClientAndDates('c1', { from: '2026-01-01', to: '2026-01-31' });
    expect(last().path).toBe('/ecom/0.0.1/clients/c1/shipment-groups/from/2026-01-01/to/2026-01-31');
    await client.shipmentGroups.listByClientAndName('c1', 'Group 1');
    expect(last().path).toBe('/ecom/0.0.1/clients/c1/shipment-groups/name/Group%201');
    await client.shipmentGroups.listByClientAndName('c1', 'Group 1', { from: '2026-01-01', to: '2026-01-31' });
    expect(last().path).toBe('/ecom/0.0.1/clients/c1/shipment-groups/name/Group%201/from/2026-01-01/to/2026-01-31');
    await client.shipmentGroups.getByShipment('s1');
    expect(last().path).toBe('/ecom/0.0.1/shipments/shipment-group/s1');
  });

  it('lists shipments with paging, sorting and statuses', async () => {
    const { client, last } = setup({ data: [] });
    await client.shipmentGroups.listShipments('g1', {
      status: ['CREATED', 'REGISTERED'],
      size: 7,
      page: 1,
      sort: ['deliveryPrice', 'weight'],
      order: 'desc',
      statusesGroup: 'NONREGISTERED',
    });
    expect(last().query).toMatchObject({
      status: 'CREATED,REGISTERED',
      size: 7,
      page: 1,
      sort: 'deliveryPrice,weight',
      order: 'desc',
      statusesGroup: 'NONREGISTERED',
    });
    await client.shipmentGroups.countShipments('g1', { status: 'CREATED' });
    expect(last()).toMatchObject({
      path: '/ecom/0.0.1/shipment-groups/g1/shipments-count',
      query: { status: 'CREATED' },
    });
  });

  it('walks all pages of a group', async () => {
    const pages: Record<string, unknown[]> = { 1: [{ uuid: 'a' }, { uuid: 'b' }], 2: [{ uuid: 'c' }] };
    const { client, requests } = setup(request => ({ data: pages[String(request.query?.page)] ?? [] }));
    const seen: string[] = [];
    for await (const shipment of client.shipmentGroups.iterateShipments('g1', { size: 2 })) {
      seen.push((shipment as { uuid: string }).uuid);
    }
    expect(seen).toEqual(['a', 'b', 'c']);
    expect(requests).toHaveLength(2);
  });
});

describe('labels', () => {
  const pdf = { contentType: 'application/pdf', data: new Uint8Array([0x25, 0x50, 0x44, 0x46]) };

  it('reads stickers from the forms host as binary with the token', async () => {
    const { client, last } = setup({ data: pdf });
    const sticker = await client.labels.getSticker('B1', { size: 'SIZE_A4', hideWeight: true });
    expect(sticker).toEqual(pdf);
    expect(last()).toMatchObject({
      method: 'GET',
      path: '/forms/ecom/0.0.1/shipments/B1/sticker',
      responseType: 'binary',
      auth: 'Bearer ecom-bearer',
      query: { size: 'SIZE_A4', hideWeight: 1, token: 'cp-token' },
    });
  });

  it('reads the other stickers and forms', async () => {
    const { client, last } = setup({ data: pdf });
    await client.labels.getParcelSticker('P1');
    expect(last().path).toBe('/forms/ecom/0.0.1/shipments/sticker/parcel/P1');
    await client.labels.getGroupStickers('g1', { size: 'SIZE_A5' });
    expect(last()).toMatchObject({ path: '/forms/ecom/0.0.1/shipment-groups/g1/sticker', query: { size: 'SIZE_A5' } });
    await client.labels.getForm103a('g1', { showSenderName: true, hideDeclaredPrice: true });
    expect(last()).toMatchObject({
      path: '/forms/ecom/0.0.1/shipment-groups/g1/form103a',
      query: { showSenderName: true, hideDeclaredPrice: 1 },
    });
    await client.labels.getShipmentLabel('B1', { hideDeclaredPrice: true });
    expect(last().path).toBe('/forms/ecom/0.0.1/shipments/B1/label');
    await client.labels.getForm119('B1');
    expect(last().path).toBe('/forms/ecom/0.0.1/shipments/B1/form119');
    await client.labels.getGroupForm119('g1');
    expect(last().path).toBe('/forms/ecom/0.0.1/shipment-groups/g1/form119');
  });

  it('prints several stickers with per-shipment options', async () => {
    const { client, last } = setup({ data: pdf });
    await client.labels.getStickers(['B1', 'B2']);
    expect(last()).toMatchObject({ method: 'POST', body: { B1: {}, B2: {} } });
    await client.labels.getStickers({ B1: { hideWeight: true, hideDeliveryPrice: false } }, { size: 'SIZE_A4' });
    expect(last()).toMatchObject({
      path: '/forms/ecom/0.0.1/shipments/stickers-by-barcodes',
      query: { size: 'SIZE_A4' },
      body: { B1: { hideDeliveryPrice: '0', hideWeight: '1' } },
    });
  });

  it('requests the updated form 119', async () => {
    const { client, last } = setup({ data: pdf });
    await client.labels.getUpdatedForm119('B1', { fromNotification: true, pageSize: 'page_a4' });
    expect(last()).toMatchObject({
      method: 'POST',
      path: '/forms/ecom/0.0.1/form2-service/sticker-form119',
      query: { barcode: 'B1', parent: false, pagesize: 'page_a4', dispatch: 'shipment' },
    });
    await client.labels.getUpdatedGroupForm119('g1');
    expect(last()).toMatchObject({
      path: '/forms/ecom/0.0.1/form2-service/sticker-form119-group',
      query: { asPdf: true, barcode: 'g1', pagesize: 'page_10x10' },
    });
  });
});

describe('errors', () => {
  it('maps UPE errors to CarrierError', async () => {
    const { client } = setup({ status: 404, data: { code: 'UPE02001', message: 'Shipment not found' } });
    const error = await client.shipments.get('nope').catch((e: unknown) => e);
    expect(isCarrierError(error)).toBe(true);
    expect(error).toMatchObject({
      carrier: 'ukrposhta',
      code: 'UPE02001',
      category: CarrierErrorCategory.NotFound,
      httpStatus: 404,
    });
  });

  it('never exposes credentials in a logged request', async () => {
    const events: string[] = [];
    const transport: HttpTransport = (async () => ({ status: 200, headers: {}, data: {} })) as HttpTransport;
    const client = createUkrposhtaContractClient({
      transport,
      bearer: 'secret-bearer',
      counterpartyToken: 'secret-token',
      logger: event => events.push(JSON.stringify(event)),
    }).use(new ShipmentsService());
    await client.shipments.get('u1');
    expect(events.length).toBeGreaterThan(0);
    expect(events.join('')).not.toContain('secret-bearer');
    expect(events.join('')).not.toContain('secret-token');
  });
});
