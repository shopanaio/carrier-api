import { money } from '@shopana/carrier-contracts';
import type { Address, CreateShipmentInput, Party } from '@shopana/carrier-contracts';
import { CarrierErrorCategory } from '@shopana/carrier-core';
import {
  AddressesService,
  ClientsService,
  LabelsService,
  PricingService,
  ShipmentGroupsService,
  ShipmentsService,
  createUkrposhtaClassifierClient,
  createUkrposhtaContractClient,
  createUkrposhtaTrackingClient,
} from '../src';
import type { ClientInput } from '../src';
import { createUkrposhtaAdapter, kyivLocalToIso, ukrposhtaStatusMap } from '../src/adapter';
import { addressFrom, clientFrom, shipmentFrom, statusEvent } from './helpers/fixtures';
import { createMockTransport, fail, ok } from './helpers/mock';
import type { MockCall } from './helpers/mock';

const ECOM = '/ecom/0.0.1';
const FORMS = '/forms/ecom/0.0.1';
const TRACKING = '/status-tracking/0.0.1';
const CLASSIFIER = '/address-classifier-ws';
const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);

const senderAddress: Address = { country: 'UA', postalCode: '04071', city: 'Kyiv', street: 'Khoryva', building: '40' };
const recipientAddress: Address = {
  country: 'UA',
  postalCode: '79000',
  city: 'Lviv',
  street: 'Horodotska',
  building: '1',
};
const sender: Party = {
  contact: { firstName: 'Petro', lastName: 'Petrenko', phone: '+380672802273' },
  point: { type: 'door', address: senderAddress },
  externalId: 'shop-1',
  taxId: '4201030327',
};
const recipient: Party = {
  contact: { name: 'Ivanov Ivan Ivanovych', phone: '0982004113', email: 'ivan@example.com' },
  point: { type: 'door', address: recipientAddress },
};
const shipmentInput: CreateShipmentInput = {
  sender,
  recipient,
  parcels: [
    {
      weight: { value: 1.2, unit: 'kg' },
      dimensions: { length: 20, width: 30, height: 10, unit: 'cm' },
      declaredValue: money(500, 'UAH'),
    },
  ],
  reference: 'order-1',
};

const bodyOf = <T>(call: MockCall) => call.body as T;

/** A mock of the eCom host: every create echoes the request, lookups by external id answer 404. */
function ecomMock() {
  const mock = createMockTransport();
  mock.on({
    method: 'GET',
    path: `${ECOM}/clients/external-id/{id}`,
    respond: fail(404, 'UPE02001', 'Client not found'),
  });
  mock.on({ method: 'POST', path: `${ECOM}/addresses`, respond: call => ok(addressFrom(bodyOf(call))) });
  mock.on({ method: 'POST', path: `${ECOM}/clients`, respond: call => ok(clientFrom(bodyOf<ClientInput>(call))) });
  mock.on({
    method: 'POST',
    path: `${ECOM}/shipments`,
    respond: call => {
      const body = bodyOf<Parameters<typeof shipmentFrom>[0]>(call);
      return ok(
        shipmentFrom(
          body,
          clientFrom({ addressId: 1, phoneNumber: '0' }),
          clientFrom({ addressId: 2, phoneNumber: '0' }),
        ),
      );
    },
  });
  return mock;
}

function build(mock: ReturnType<typeof createMockTransport>) {
  const retry = { sleep: async () => undefined };
  const base = { transport: mock.transport, retry };
  const ecom = createUkrposhtaContractClient({ ...base, bearer: 'ecom', counterpartyToken: 'cp' })
    .use(new AddressesService())
    .use(new ClientsService())
    .use(new ShipmentsService())
    .use(new PricingService())
    .use(new ShipmentGroupsService())
    .use(new LabelsService());
  const tracking = createUkrposhtaTrackingClient({ ...base, bearer: 'tracking' });
  const classifier = createUkrposhtaClassifierClient({ ...base, bearer: 'ecom' });
  return { ecom, tracking, classifier, adapter: createUkrposhtaAdapter({ ecom, tracking, classifier }) };
}

describe('capabilities follow the clients that are given', () => {
  it('declares only what it can serve', () => {
    const mock = createMockTransport();
    const { ecom, tracking, classifier } = build(mock);
    expect([...createUkrposhtaAdapter({ tracking }).capabilities]).toEqual(['tracking']);
    expect([...createUkrposhtaAdapter({ classifier }).capabilities]).toEqual(['locations', 'addressValidation']);
    expect([...createUkrposhtaAdapter({ ecom }).capabilities].sort()).toEqual([
      'cancel',
      'labels',
      'manifest',
      'rates',
      'shipments',
    ]);
    expect(createUkrposhtaAdapter({ ecom, tracking, classifier }).capabilities.size).toBe(8);
  });
});

describe('tracking', () => {
  function trackingMock(found: Record<string, ReturnType<typeof statusEvent>[]>) {
    const mock = createMockTransport();
    mock.on({
      method: 'POST',
      path: `${TRACKING}/statuses/with-not-found`,
      respond: call => {
        const barcodes = bodyOf<string[]>(call);
        return ok({
          found: Object.fromEntries(barcodes.filter(b => found[b]).map(b => [b, found[b]])),
          notFound: barcodes.filter(b => !found[b]),
        });
      },
    });
    return { mock, ...build(mock) };
  }

  it('normalizes statuses and keeps raw codes, oldest first', async () => {
    const { adapter } = trackingMock({
      B1: [
        statusEvent('B1', 41000, { date: '2026-01-12T10:00:00', eventReason_id: 2 }),
        statusEvent('B1', 10100, { date: '2026-01-10T10:00:00' }),
        statusEvent('B1', 21700, { date: '2026-01-11T10:00:00' }),
      ],
    });
    const [result] = await adapter.track(['B1']);
    expect(result).toMatchObject({ trackingNumber: 'B1', carrier: 'ukrposhta', status: 'delivered', found: true });
    expect(result!.events.map(e => [e.rawCode, e.status])).toEqual([
      ['10100', 'in_transit'],
      ['21700', 'available_for_pickup'],
      ['41000', 'delivered'],
    ]);
  });

  it('recognises a return to the sender (41000 + reason 10)', async () => {
    const { adapter } = trackingMock({
      B1: [statusEvent('B1', 10100), statusEvent('B1', '41000', { date: '2026-01-12T10:00:00', eventReason_id: 10 })],
    });
    const [result] = await adapter.track(['B1']);
    expect(result!.status).toBe('returned');
    expect(result!.events.at(-1)!.rawCode).toBe('41010');
  });

  it('reports unknown numbers as not found without failing the rest', async () => {
    const { adapter } = trackingMock({ B1: [statusEvent('B1', 10100)] });
    const results = await adapter.track(['B1', 'GONE', 'B1']);
    expect(results.map(r => [r.trackingNumber, r.found])).toEqual([
      ['B1', true],
      ['GONE', false],
      ['B1', true],
    ]);
  });

  it('chunks more than 50 numbers and asks once per number', async () => {
    const numbers = Array.from({ length: 120 }, (_, i) => `B${i}`);
    const { mock, adapter } = trackingMock(Object.fromEntries(numbers.map(n => [n, [statusEvent(n, 10100)]])));
    expect(await adapter.track(numbers)).toHaveLength(120);
    expect(mock.callsTo('POST', `${TRACKING}/statuses/with-not-found`).map(c => (c.body as string[]).length)).toEqual([
      50, 50, 20,
    ]);
  });

  it('puts event times on the Kyiv offset', async () => {
    const { adapter } = trackingMock({
      B1: [
        statusEvent('B1', 10100, { date: '2026-07-27T16:33:00' }),
        statusEvent('B1', 41000, { date: '2026-01-15T10:00:00' }),
      ],
    });
    const [result] = await adapter.track(['B1']);
    expect(result!.events.map(e => e.occurredAt)).toEqual(['2026-01-15T10:00:00+02:00', '2026-07-27T16:33:00+03:00']);
  });

  it('keeps unknown codes as unknown', () => {
    expect(ukrposhtaStatusMap('12345')).toBe('unknown');
  });
});

describe('kyivLocalToIso', () => {
  it('uses +02:00 in winter and +03:00 in summer', () => {
    expect(kyivLocalToIso('2026-01-10T08:00:00')).toBe('2026-01-10T08:00:00+02:00');
    expect(kyivLocalToIso('2026-07-10T08:00:00')).toBe('2026-07-10T08:00:00+03:00');
  });

  it('handles the daylight saving switch days', () => {
    expect(kyivLocalToIso('2026-03-29T02:00:00')).toMatch(/\+0[23]:00$/);
    expect(kyivLocalToIso('2026-03-29T12:00:00')).toBe('2026-03-29T12:00:00+03:00');
    expect(kyivLocalToIso('2026-10-25T12:00:00')).toBe('2026-10-25T12:00:00+02:00');
  });

  it('resolves the hour the clocks go back to the earlier offset, and the skipped hour to the old one', () => {
    expect(kyivLocalToIso('2026-10-25T03:30:00')).toBe('2026-10-25T03:30:00+03:00');
    expect(kyivLocalToIso('2026-03-29T03:30:00')).toBe('2026-03-29T03:30:00+02:00');
  });

  it('leaves unparseable input alone', () => {
    expect(kyivLocalToIso('yesterday')).toBe('yesterday');
  });
});

describe('createShipment', () => {
  it('creates the addresses, clients and shipment, and maps the answer', async () => {
    const mock = ecomMock();
    const { adapter } = build(mock);
    const shipment = await adapter.createShipment(shipmentInput);
    expect(shipment).toMatchObject({
      carrier: 'ukrposhta',
      status: 'pre_transit',
      price: { amount: '42', currency: 'UAH' },
    });
    expect(shipment.trackingNumber).toMatch(/^05\d{11}$/);

    expect(mock.callsTo('POST', `${ECOM}/addresses`).map(c => c.body)).toEqual([
      { postcode: '04071', city: 'Kyiv', street: 'Khoryva', houseNumber: '40' },
      { postcode: '79000', city: 'Lviv', street: 'Horodotska', houseNumber: '1' },
    ]);
    const [senderBody, recipientBody] = mock.callsTo('POST', `${ECOM}/clients`).map(c => c.body);
    expect(senderBody).toMatchObject({
      type: 'PRIVATE_ENTREPRENEUR',
      firstName: 'Petro',
      lastName: 'Petrenko',
      tin: '4201030327',
      externalId: 'shop-1',
      phoneNumber: '+380672802273',
    });
    expect(recipientBody).toMatchObject({
      type: 'INDIVIDUAL',
      lastName: 'Ivanov',
      firstName: 'Ivan',
      middleName: 'Ivanovych',
      email: 'ivan@example.com',
    });
    expect(bodyOf(mock.last())).toMatchObject({
      deliveryType: 'D2D',
      type: 'EXPRESS',
      externalId: 'order-1',
      paidByRecipient: false,
      // The longest side goes to `length`.
      parcels: [{ weight: 1200, length: 30, width: 20, height: 10, declaredPrice: 500 }],
    });
  });

  it('reuses a client found by external id and the address already on it', async () => {
    const mock = ecomMock();
    const address = addressFrom({ postcode: '04071', street: 'Khoryva', houseNumber: '40' });
    const existing = clientFrom(
      {
        addressId: address.id,
        phoneNumber: '0672802273',
        externalId: 'shop-1',
        type: 'PRIVATE_ENTREPRENEUR',
        firstName: 'Petro',
        lastName: 'Petrenko',
        tin: '4201030327',
      },
      address,
    );
    mock.on({ method: 'GET', path: `${ECOM}/clients/external-id/shop-1`, respond: ok(existing) });
    const { adapter } = build(mock);
    await adapter.createShipment(shipmentInput);
    // Only the recipient is created: no client POST for the sender, no address POST for the known address.
    expect(mock.callsTo('POST', `${ECOM}/clients`)).toHaveLength(1);
    expect(mock.callsTo('POST', `${ECOM}/addresses`)).toHaveLength(1);
    expect(mock.callsTo('PUT', `${ECOM}/clients/{uuid}`)).toHaveLength(0);
    expect(bodyOf(mock.last())).toMatchObject({ sender: { uuid: existing.uuid }, senderAddressId: address.id });
  });

  it('attaches a new address to a reused client', async () => {
    const mock = ecomMock();
    const old = addressFrom({ postcode: '04071', street: 'Khoryva', houseNumber: '39' });
    const existing = clientFrom(
      {
        addressId: old.id,
        phoneNumber: '0672802273',
        externalId: 'shop-1',
        type: 'PRIVATE_ENTREPRENEUR',
        firstName: 'Petro',
        lastName: 'Petrenko',
        tin: '4201030327',
      },
      old,
    );
    mock.on({ method: 'GET', path: `${ECOM}/clients/external-id/shop-1`, respond: ok(existing) });
    mock.on({
      method: 'PUT',
      path: `${ECOM}/clients/{uuid}`,
      respond: call => {
        const added = bodyOf<{ addresses: Array<{ addressId: number }> }>(call).addresses[0]!.addressId;
        const created = mock.callsTo('POST', `${ECOM}/addresses`).length;
        expect(created).toBeGreaterThan(0);
        return ok({
          ...existing,
          addresses: [
            ...existing.addresses,
            { uuid: 'a2', addressId: added, address: old, type: 'PHYSICAL', main: false },
          ],
        });
      },
    });
    const { adapter } = build(mock);
    await adapter.createShipment(shipmentInput);
    const [put] = mock.callsTo('PUT', `${ECOM}/clients/{uuid}`);
    expect(put!.path).toBe(`${ECOM}/clients/${existing.uuid}`);
    expect(put!.body).toMatchObject({ addresses: [{ addressId: expect.any(Number) }] });
  });

  it('uses carrierRefs of a known client and address without any lookup', async () => {
    const mock = ecomMock();
    const address = addressFrom({ postcode: '04071' });
    const known = clientFrom({ addressId: address.id, phoneNumber: '0672802273' }, address);
    mock.on({ method: 'GET', path: `${ECOM}/clients/{uuid}`, respond: ok(known) });
    const { adapter } = build(mock);
    const party: Party = {
      ...sender,
      point: {
        type: 'door',
        address: {
          ...senderAddress,
          carrierRefs: { ukrposhta: { clientUuid: known.uuid, addressId: String(address.id) } },
        },
      },
    };
    await adapter.createShipment({ ...shipmentInput, sender: party });
    expect(mock.callsTo('GET', `${ECOM}/clients/external-id/{id}`)).toHaveLength(0);
    expect(mock.callsTo('GET', `${ECOM}/clients/{uuid}`)).toHaveLength(1);
    expect(bodyOf(mock.last())).toMatchObject({ sender: { uuid: known.uuid }, senderAddressId: address.id });
  });

  it('delivers to a post office with W2W', async () => {
    const mock = ecomMock();
    const { adapter } = build(mock);
    await adapter.createShipment({
      ...shipmentInput,
      sender: { ...sender, point: { type: 'location', locationId: '04071' } },
      recipient: { ...recipient, point: { type: 'location', locationId: '79000' } },
    });
    expect(bodyOf(mock.last())).toMatchObject({ deliveryType: 'W2W' });
    expect(mock.callsTo('POST', `${ECOM}/addresses`).map(c => c.body)).toEqual([
      { postcode: '04071' },
      { postcode: '79000' },
    ]);
  });

  it('maps cash on delivery, payer and service', async () => {
    const mock = ecomMock();
    const { adapter } = build(mock);
    await adapter.createShipment({
      ...shipmentInput,
      parcels: [{ weight: { value: 800, unit: 'g' }, declaredValue: money(300, 'UAH') }],
      options: {
        service: 'standard',
        payer: 'recipient',
        cashOnDelivery: { amount: money(300, 'UAH'), payer: 'sender' },
      },
      sender: { ...sender, contact: { company: 'TOV Limon', phone: '0671231234' }, taxId: '40145721' },
    });
    expect(bodyOf(mock.last())).toMatchObject({
      type: 'STANDARD',
      paidByRecipient: true,
      postPay: 300,
      postPayPaidByRecipient: false,
      parcels: [{ weight: 800, length: 1, declaredPrice: 300 }],
      // A company receives cash on delivery on its bank account.
      transferPostPayToBankAccount: true,
    });
    expect(mock.callsTo('POST', `${ECOM}/clients`)[0]!.body).toMatchObject({
      type: 'COMPANY',
      name: 'TOV Limon',
      edrpou: '40145721',
    });
  });

  it('refuses cash on delivery above the declared value instead of raising it', async () => {
    const mock = ecomMock();
    const { adapter } = build(mock);
    await expect(
      adapter.createShipment({
        ...shipmentInput,
        parcels: [{ weight: { value: 1, unit: 'kg' }, declaredValue: money(100, 'UAH') }],
        options: { cashOnDelivery: { amount: money(300, 'UAH') } },
      }),
    ).rejects.toMatchObject({ category: CarrierErrorCategory.Validation, field: 'parcels.declaredValue' });
    expect(mock.calls).toHaveLength(0);
  });

  it('refuses a reference too long for the external id, and validates both parties before any request', async () => {
    const mock = ecomMock();
    const { adapter } = build(mock);
    await expect(adapter.createShipment({ ...shipmentInput, reference: 'x'.repeat(65) })).rejects.toMatchObject({
      field: 'reference',
    });
    // The recipient is invalid: the sender's address and client must not be created first.
    await expect(
      adapter.createShipment({
        ...shipmentInput,
        recipient: { ...recipient, contact: { name: 'Ivanov', phone: '1' } },
      }),
    ).rejects.toMatchObject({ field: 'recipient.contact' });
    expect(mock.calls).toHaveLength(0);
  });

  it('does not invent a creation time', async () => {
    const { adapter } = build(ecomMock());
    expect(await adapter.createShipment(shipmentInput)).not.toHaveProperty('createdAt');
  });

  it('sends several parcels and returns their numbers', async () => {
    const mock = ecomMock();
    const { adapter } = build(mock);
    const shipment = await adapter.createShipment({
      ...shipmentInput,
      parcels: [
        { weight: { value: 1, unit: 'kg' }, declaredValue: money(10, 'UAH') },
        { weight: { value: 2, unit: 'kg' } },
      ],
    });
    expect(shipment.parcelTrackingNumbers).toHaveLength(2);
    expect(shipment.parcelTrackingNumbers![0]).toBe(shipment.trackingNumber);
  });

  it.each([
    [
      'a missing phone',
      { ...shipmentInput, sender: { ...sender, contact: { firstName: 'A', lastName: 'B' } } },
      'sender.contact.phone',
    ],
    [
      'a single-word name',
      { ...shipmentInput, recipient: { ...recipient, contact: { name: 'Ivanov', phone: '1' } } },
      'recipient.contact',
    ],
    [
      'a company without a tax id',
      { ...shipmentInput, sender: { ...sender, taxId: undefined, contact: { company: 'TOV', phone: '1' } } },
      'sender.taxId',
    ],
    [
      'a foreign currency',
      { ...shipmentInput, parcels: [{ weight: { value: 1, unit: 'kg' }, declaredValue: money(10, 'EUR') }] },
      'parcels.declaredValue',
    ],
    ['a zero weight', { ...shipmentInput, parcels: [{ weight: { value: 0, unit: 'kg' } }] }, 'parcels.weight'],
    ['no parcels', { ...shipmentInput, parcels: [] }, 'parcels'],
    ['an unknown service', { ...shipmentInput, options: { service: 'teleport' } }, 'options.service'],
    ['a third-party payer', { ...shipmentInput, options: { payer: 'third_party' as const } }, 'options.payer'],
    [
      'a bad postcode',
      {
        ...shipmentInput,
        recipient: { ...recipient, point: { type: 'door' as const, address: { country: 'UA', postalCode: '12' } } },
      },
      'recipient.point',
    ],
  ])('rejects %s before creating the shipment', async (_name, input, field) => {
    const mock = ecomMock();
    const { adapter } = build(mock);
    await expect(adapter.createShipment(input as CreateShipmentInput)).rejects.toMatchObject({
      carrier: 'ukrposhta',
      category: CarrierErrorCategory.Validation,
      field,
    });
    expect(mock.callsTo('POST', `${ECOM}/shipments`)).toHaveLength(0);
  });

  it('turns a carrier rejection into a CarrierError', async () => {
    const mock = ecomMock();
    mock.on({
      method: 'POST',
      path: `${ECOM}/shipments`,
      respond: { status: 400, data: { code: 'UPE01002', message: 'A parcel weighs at most 30 kg', field: 'weight' } },
    });
    const { adapter } = build(mock);
    await expect(adapter.createShipment(shipmentInput)).rejects.toMatchObject({
      code: 'UPE01002',
      category: CarrierErrorCategory.Validation,
      field: 'weight',
    });
  });
});

describe('getShipment', () => {
  it('reads a shipment back with its status', async () => {
    const mock = ecomMock();
    const raw = shipmentFrom({
      ...({} as never),
      deliveryType: 'W2W',
      parcels: [{ weight: 1000, length: 10 }],
      sender: { uuid: 's' },
      recipient: { uuid: 'r' },
    });
    mock.on({
      method: 'GET',
      path: `${ECOM}/shipments/{uuid}`,
      respond: ok({ ...raw, lifecycle: { status: 'DELIVERED', statusDate: '2026-01-02T10:00:00' } }),
    });
    const { adapter } = build(mock);
    expect(await adapter.getShipment(raw.uuid)).toMatchObject({ id: raw.uuid, status: 'delivered' });
  });
});

describe('getRates', () => {
  const request = { sender, recipient, parcels: shipmentInput.parcels };

  function pricingMock() {
    const mock = ecomMock();
    mock.on({
      method: 'POST',
      path: `${ECOM}/domestic/delivery-price`,
      respond: call => {
        const type = bodyOf<{ type: string }>(call).type;
        return ok(
          type === 'EXPRESS'
            ? { deliveryPrice: 90, rawDeliveryPrice: 100, calculationDescription: 'x' }
            : { deliveryPrice: 60, rawDeliveryPrice: 60, calculationDescription: 'y' },
        );
      },
    });
    return mock;
  }

  it('prices Express and Standard', async () => {
    const mock = pricingMock();
    const { adapter } = build(mock);
    const rates = await adapter.getRates(request);
    expect(rates.map(r => [r.service, r.serviceName, r.total])).toEqual([
      ['EXPRESS', 'Ukrposhta Express', { amount: '90', currency: 'UAH' }],
      ['STANDARD', 'Ukrposhta Standard', { amount: '60', currency: 'UAH' }],
    ]);
    expect(bodyOf(mock.callsTo('POST', `${ECOM}/domestic/delivery-price`)[0]!)).toMatchObject({
      addressFrom: { postcode: '04071' },
      addressTo: { postcode: '79000' },
      deliveryType: 'D2D',
      parcels: [{ weight: 1200, length: 30, width: 20, height: 10, declaredPrice: 500 }],
    });
  });

  it('shows the discount as a negative charge', async () => {
    const { adapter } = build(pricingMock());
    const [express, standard] = await adapter.getRates(request);
    expect(express!.charges).toEqual([
      { type: 'delivery', amount: { amount: '100', currency: 'UAH' } },
      { type: 'discount', amount: { amount: '-10', currency: 'UAH' } },
    ]);
    expect(standard!.charges).toHaveLength(1);
  });

  it('prices one requested service', async () => {
    const mock = pricingMock();
    const { adapter } = build(mock);
    expect(await adapter.getRates({ ...request, options: { service: 'EXPRESS' } })).toHaveLength(1);
    expect(mock.callsTo('POST', `${ECOM}/domestic/delivery-price`)).toHaveLength(1);
  });

  it('works from postcodes alone, without contacts or a phone', async () => {
    const mock = pricingMock();
    const { adapter } = build(mock);
    const rates = await adapter.getRates({
      sender: { contact: {}, point: { type: 'location', locationId: '04071' } },
      recipient: { contact: {}, point: { type: 'location', locationId: '79000' } },
      parcels: [{ weight: { value: 2, unit: 'kg' } }],
    });
    expect(rates.length).toBeGreaterThan(0);
    expect(bodyOf(mock.last())).toMatchObject({ deliveryType: 'W2W' });
  });

  it('keeps the rates that worked when one service fails, and throws when all fail', async () => {
    const mock = pricingMock();
    let failures = 1;
    mock.on({
      method: 'POST',
      path: `${ECOM}/domestic/delivery-price`,
      respond: call =>
        failures-- > 0
          ? fail(400, 'UPE01002', 'bad')
          : ok({
              deliveryPrice: 60,
              rawDeliveryPrice: 60,
              calculationDescription: bodyOf<{ type: string }>(call).type,
            }),
    });
    const { adapter } = build(mock);
    expect(await adapter.getRates(request)).toHaveLength(1);
    mock.on({ method: 'POST', path: `${ECOM}/domestic/delivery-price`, respond: fail(400, 'UPE01002', 'bad') });
    await expect(adapter.getRates(request)).rejects.toMatchObject({ code: 'UPE01002' });
  });

  it('adds the cash on delivery fee basis to the request', async () => {
    const mock = pricingMock();
    const { adapter } = build(mock);
    await adapter.getRates({
      ...request,
      options: { service: 'EXPRESS', cashOnDelivery: { amount: money(400, 'UAH') } },
    });
    expect(bodyOf(mock.last())).toMatchObject({ postPay: 400, parcels: [{ declaredPrice: 500 }] });
  });
});

describe('getLabel', () => {
  function labelMock() {
    const mock = ecomMock();
    mock.on({
      method: 'GET',
      path: `${FORMS}/shipments/{id}/sticker`,
      respond: ok({ contentType: 'application/pdf', data: PDF }),
    });
    return mock;
  }

  it('prints a PDF sticker from the forms host, in the requested size', async () => {
    const mock = labelMock();
    const { adapter } = build(mock);
    const label = await adapter.getLabel({ shipmentId: 'abc', size: 'A4' });
    expect(label).toMatchObject({ format: 'PDF', encoding: 'binary', contentType: 'application/pdf', size: 'A4' });
    expect(label.encoding === 'binary' && label.data).toEqual(PDF);
    expect(mock.last()).toMatchObject({
      path: `${FORMS}/shipments/abc/sticker`,
      query: { size: 'SIZE_A4', token: 'cp' },
    });
    await adapter.getLabel({ shipmentId: 'abc', size: '100x100' });
    expect(mock.last().query.size).toBeUndefined();
    await adapter.getLabel({ shipmentId: 'abc', size: 'a5' });
    expect(mock.last().query).toMatchObject({ size: 'SIZE_A5' });
  });

  it('refuses other formats and sizes', async () => {
    const { adapter } = build(labelMock());
    await expect(adapter.getLabel({ shipmentId: 'abc', format: 'ZPL' })).rejects.toMatchObject({ field: 'format' });
    await expect(adapter.getLabel({ shipmentId: 'abc', size: 'A3' })).rejects.toMatchObject({ field: 'size' });
  });
});

describe('cancelShipment', () => {
  function lifecycleMock(status: string) {
    const mock = ecomMock();
    mock.on({
      method: 'GET',
      path: `${ECOM}/shipments/{id}/lifecycle`,
      respond: ok({ shipmentUuid: 's', shipmentBarcode: 'B', status, statusDate: '2026-01-01T09:00:00' }),
    });
    mock.on({ method: 'DELETE', path: `${ECOM}/shipments/{id}`, respond: ok({}) });
    return mock;
  }

  it('deletes a shipment that is still CREATED', async () => {
    const mock = lifecycleMock('CREATED');
    const { adapter } = build(mock);
    await adapter.cancelShipment('s1');
    expect(mock.callsTo('DELETE', `${ECOM}/shipments/s1`)).toHaveLength(1);
    // The status check needs no counterparty token.
    expect(mock.callsTo('GET', `${ECOM}/shipments/{id}/lifecycle`)[0]!.query).not.toHaveProperty('token');
  });

  it.each(['REGISTERED', 'DELIVERING', 'DELIVERED'])(
    'says plainly that a %s shipment cannot be cancelled',
    async status => {
      const mock = lifecycleMock(status);
      const { adapter } = build(mock);
      await expect(adapter.cancelShipment('s1')).rejects.toMatchObject({
        code: 'NOT_CANCELLABLE',
        category: CarrierErrorCategory.BusinessLogic,
      });
      expect(mock.callsTo('DELETE', `${ECOM}/shipments/s1`)).toHaveLength(0);
    },
  );
});

describe('createManifest', () => {
  function manifestMock(shipments: Array<ReturnType<typeof shipmentFrom>>, addResults?: unknown) {
    const mock = ecomMock();
    for (const shipment of shipments) {
      mock.on({ method: 'GET', path: `${ECOM}/shipments/${shipment.uuid}`, respond: ok(shipment) });
    }
    mock.on({
      method: 'POST',
      path: `${ECOM}/shipment-groups`,
      respond: call => ok({ uuid: 'g1', ...bodyOf<object>(call) }),
    });
    mock.on({
      method: 'PUT',
      path: `${ECOM}/shipment-groups/{uuid}/shipments`,
      respond: call =>
        ok(addResults ?? bodyOf<string[]>(call).map(id => ({ targetUuid: id, httpStatus: 200, message: 'ok' }))),
    });
    mock.on({
      method: 'GET',
      path: `${FORMS}/shipment-groups/{uuid}/form103a`,
      respond: ok({ contentType: 'application/pdf', data: PDF }),
    });
    return mock;
  }

  const make = (sender: string, type: 'EXPRESS' | 'STANDARD' = 'EXPRESS') =>
    shipmentFrom(
      {
        sender: { uuid: sender },
        recipient: { uuid: 'r' },
        deliveryType: 'W2W',
        type,
        parcels: [{ weight: 1000, length: 10 }],
      },
      { ...clientFrom({ addressId: 1, phoneNumber: '0' }), uuid: sender },
    );

  it('groups the shipments and prints form 103a', async () => {
    const a = make('sender-1');
    const b = make('sender-1');
    const mock = manifestMock([a, b]);
    const { adapter } = build(mock);
    const manifest = await adapter.createManifest([a.uuid, b.uuid]);
    expect(manifest).toMatchObject({ id: 'g1', carrier: 'ukrposhta', shipmentIds: [a.uuid, b.uuid] });
    expect(manifest.document).toMatchObject({ format: 'PDF', encoding: 'binary', data: PDF });
    expect(mock.callsTo('POST', `${ECOM}/shipment-groups`)[0]!.body).toMatchObject({
      clientUuid: 'sender-1',
      type: 'EXPRESS',
    });
    expect(mock.callsTo('PUT', `${ECOM}/shipment-groups/g1/shipments`)[0]!.body).toEqual([a.uuid, b.uuid]);
  });

  it('refuses shipments that are already registered', async () => {
    const a = make('sender-1');
    const mock = manifestMock([{ ...a, lifecycle: { status: 'REGISTERED', statusDate: '2026-01-01T09:00:00' } }]);
    const { adapter } = build(mock);
    await expect(adapter.createManifest([a.uuid])).rejects.toMatchObject({ field: 'shipmentIds' });
    expect(mock.callsTo('POST', `${ECOM}/shipment-groups`)).toHaveLength(0);
  });

  it('refuses shipments of different senders or types, and none at all', async () => {
    const a = make('sender-1');
    const other = make('sender-2');
    const standard = make('sender-1', 'STANDARD');
    const { adapter } = build(manifestMock([a, other, standard]));
    await expect(adapter.createManifest([a.uuid, other.uuid])).rejects.toMatchObject({ field: 'shipmentIds' });
    await expect(adapter.createManifest([a.uuid, standard.uuid])).rejects.toMatchObject({ field: 'shipmentIds' });
    await expect(adapter.createManifest([])).rejects.toMatchObject({ field: 'shipmentIds' });
  });

  it('reports the shipments the carrier would not add', async () => {
    const a = make('sender-1');
    const mock = manifestMock([a], [{ targetUuid: a.uuid, httpStatus: 400, message: 'already registered' }]);
    const { adapter } = build(mock);
    await expect(adapter.createManifest([a.uuid])).rejects.toMatchObject({
      code: 'MANIFEST_FAILED',
      message: expect.stringContaining('already registered'),
    });
    expect(mock.callsTo('GET', `${FORMS}/shipment-groups/{uuid}/form103a`)).toHaveLength(0);
  });
});

describe('locations and address validation', () => {
  const office = {
    ID: '2700',
    POSTINDEX: '01001',
    POSTCODE: '01001',
    PO_SHORT: 'Kyiv 1',
    PO_LONG: 'Viddilennia № 1',
    CITY_UA: 'Kyiv',
    REGION_UA: 'Kyiv',
    LATTITUDE: '50.449855',
    LONGITUDE: '30.523063',
  };
  const entries = (...rows: Array<Record<string, string>>) =>
    ok(rows.length === 0 ? {} : { Entries: { Entry: rows.length === 1 ? rows[0] : rows } });

  function classifierMock() {
    const mock = createMockTransport();
    mock.on({
      method: 'GET',
      path: `${CLASSIFIER}/get_postoffices_by_postindex`,
      respond: call =>
        entries(
          ...(call.query.pi === '01001' || call.query.pc === '01001' || call.query.poCityId === '29713'
            ? [office]
            : []),
        ),
    });
    mock.on({
      method: 'GET',
      path: `${CLASSIFIER}/get_city_by_region_id_and_district_id_and_city_ua`,
      respond: entries({ CITY_ID: '29713', CITY_UA: 'Kyiv' }),
    });
    mock.on({
      method: 'GET',
      path: `${CLASSIFIER}/get_postoffices_by_geolocation`,
      respond: entries({
        ID: '2700',
        POSTINDEX: '01001',
        POSTCODE: '01001',
        POSTFILIALNAME: 'Kyiv 1',
        CITYNAME: 'Kyiv',
        ADDRESS: 'vul. Khreshchatyk, 22',
        DISTANCE: '0',
        LATITUDE: '50.449855',
        LONGITUDE: '30.523063',
      }),
    });
    mock.on({
      method: 'GET',
      path: `${CLASSIFIER}/get_city_details_by_postcode`,
      respond: call =>
        entries(
          ...(call.query.postcode === '01001'
            ? [{ POSTCODE: '01001', REGION_NAME: 'Kyiv', DISTRICT_NAME: 'Kyiv', CITY_NAME: 'Kyiv' }]
            : []),
        ),
    });
    return { mock, ...build(mock) };
  }

  it('finds post offices by postcode, locality and distance', async () => {
    const { mock, adapter } = classifierMock();
    const [byCode] = await adapter.findLocations({ postalCode: '01001' });
    expect(byCode).toMatchObject({
      id: '01001',
      carrier: 'ukrposhta',
      type: 'branch',
      name: 'Viddilennia № 1',
      number: '01001',
    });
    expect(byCode!.address).toMatchObject({
      country: 'UA',
      postalCode: '01001',
      city: 'Kyiv',
      geo: { lat: 50.449855, lng: 30.523063 },
    });
    // The same office came back by index and by code: listed once.
    expect(await adapter.findLocations({ postalCode: '01001' })).toHaveLength(1);
    expect(await adapter.findLocations({ cityId: '29713' })).toHaveLength(1);
    expect(mock.last().query).toEqual({ poCityId: '29713' });
    expect(await adapter.findLocations({ city: 'Kyiv' })).toHaveLength(1);
    const near = await adapter.findLocations({ near: { lat: 50.45, lng: 30.52, radiusKm: 3 } });
    expect(near[0]).toMatchObject({ id: '01001', name: 'Kyiv 1' });
    expect(mock.last().query).toEqual({ lat: 50.45, long: 30.52, maxdistance: 3 });
    expect(await adapter.findLocations({ postalCode: '01001', type: 'locker' })).toEqual([]);
    expect(await adapter.findLocations({ postalCode: '01001', limit: 0 })).toEqual([]);
    await expect(adapter.findLocations({})).rejects.toMatchObject({ field: 'query' });
  });

  it('validates an address against the classifier', async () => {
    const { mock, adapter } = classifierMock();
    expect(await adapter.validateAddress({ country: 'UA', postalCode: '01001', city: 'Kyiv' })).toMatchObject({
      valid: true,
      normalized: { region: 'Kyiv', district: 'Kyiv', city: 'Kyiv' },
    });
    expect(await adapter.validateAddress({ country: 'UA', postalCode: '01001', city: 'Lviv' })).toMatchObject({
      valid: false,
      messages: [expect.stringContaining('belongs to Kyiv')],
    });
    expect(await adapter.validateAddress({ country: 'UA', postalCode: '01001', city: 'Kyi' })).toMatchObject({
      valid: false,
    });
    expect(await adapter.validateAddress({ country: 'UA', postalCode: '99999' })).toMatchObject({ valid: false });
    const before = mock.calls.length;
    expect(await adapter.validateAddress({ country: 'UA', postalCode: '12' })).toMatchObject({ valid: false });
    expect(await adapter.validateAddress({ country: 'UA' })).toMatchObject({ valid: false });
    expect(mock.calls).toHaveLength(before);
  });
});
