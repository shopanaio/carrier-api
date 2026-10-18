import { money } from '@shopana/carrier-contracts';
import type { Address, CreateShipmentInput, Party } from '@shopana/carrier-contracts';
import { CarrierErrorCategory } from '@shopana/carrier-core';
import { isPdf, runAdapterConformance } from '@shopana/carrier-testing';
import {
  AddressesService,
  ClassifierService,
  ClientsService,
  LabelsService,
  PricingService,
  ShipmentGroupsService,
  ShipmentsService,
  createUkrposhtaClassifierClient,
  createUkrposhtaContractClient,
  createUkrposhtaTrackingClient,
} from '../src';
import { createUkrposhtaAdapter, kyivLocalToIso, ukrposhtaStatusMap } from '../src/adapter';
import { createUkrposhtaSimulator } from '../src/simulator';

function setup(only: Array<'ecom' | 'tracking' | 'classifier'> = ['ecom', 'tracking', 'classifier']) {
  const world = createUkrposhtaSimulator();
  const retry = { sleep: world.clock.sleep, clock: world.clock };
  const base = { transport: world.transport, retry };
  const ecom = createUkrposhtaContractClient({ ...base, bearer: 'ecom', counterpartyToken: 'cp' })
    .use(new AddressesService())
    .use(new ClientsService())
    .use(new ShipmentsService())
    .use(new PricingService())
    .use(new ShipmentGroupsService())
    .use(new LabelsService());
  const tracking = createUkrposhtaTrackingClient({ ...base, bearer: 'tracking' });
  const classifier = createUkrposhtaClassifierClient({ ...base, bearer: 'ecom' });
  const adapter = createUkrposhtaAdapter({
    ...(only.includes('ecom') ? { ecom } : {}),
    ...(only.includes('tracking') ? { tracking } : {}),
    ...(only.includes('classifier') ? { classifier } : {}),
  });
  return { world, adapter, ecom };
}

const senderAddress: Address = { country: 'UA', postalCode: '04071', city: 'Київ', street: 'Хорива', building: '40' };
const recipientAddress: Address = {
  country: 'UA',
  postalCode: '79000',
  city: 'Львів',
  street: 'Городоцька',
  building: '1',
};

const sender: Party = {
  contact: { firstName: 'Петро', lastName: 'Петренко', phone: '+380672802273' },
  point: { type: 'door', address: senderAddress },
  externalId: 'shop-1',
  taxId: '4201030327',
};
const recipient: Party = {
  contact: { name: 'Іванов Іван Іванович', phone: '0982004113', email: 'ivan@example.com' },
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

describe('capabilities follow the clients that are given', () => {
  it('declares only what it can serve', () => {
    expect([...setup(['tracking']).adapter.capabilities]).toEqual(['tracking']);
    expect([...setup(['classifier']).adapter.capabilities]).toEqual(['locations', 'addressValidation']);
    expect([...setup(['ecom']).adapter.capabilities].sort()).toEqual(
      ['cancel', 'labels', 'manifest', 'rates', 'shipments'].sort(),
    );
    expect(setup().adapter.capabilities.size).toBe(8);
  });
});

describe('tracking', () => {
  it('normalizes statuses and keeps raw codes, oldest first', async () => {
    const { world, adapter } = setup();
    world.tracking.seed('B1', [10100, 21700, { event: 41000, eventReason_id: 2 }]);
    const [result] = await adapter.track(['B1']);
    expect(result).toMatchObject({ trackingNumber: 'B1', carrier: 'ukrposhta', status: 'delivered', found: true });
    expect(result!.events.map(e => [e.rawCode, e.status])).toEqual([
      ['10100', 'in_transit'],
      ['21700', 'available_for_pickup'],
      ['41000', 'delivered'],
    ]);
  });

  it('recognises a return to the sender (41000 + reason 10)', async () => {
    const { world, adapter } = setup();
    world.tracking.seed('B1', [10100, { event: '41000', eventReason_id: 10 }]);
    const [result] = await adapter.track(['B1']);
    expect(result!.status).toBe('returned');
    expect(result!.events.at(-1)!.rawCode).toBe('41010');
  });

  it('reports unknown numbers as not found without failing the rest', async () => {
    const { world, adapter } = setup();
    world.tracking.seed('B1', [10100]);
    const results = await adapter.track(['B1', 'GONE', 'B1']);
    expect(results.map(r => [r.trackingNumber, r.found])).toEqual([
      ['B1', true],
      ['GONE', false],
      ['B1', true],
    ]);
  });

  it('chunks more than 50 numbers', async () => {
    const { world, adapter } = setup();
    const numbers = Array.from({ length: 120 }, (_, i) => `B${i}`);
    numbers.forEach(n => world.tracking.seed(n, [10100]));
    expect(await adapter.track(numbers)).toHaveLength(120);
    expect(world.tracking.callsTo('getStatusesBatchWithNotFound')).toHaveLength(3);
  });

  it('puts event times on the Kyiv offset', async () => {
    const { world, adapter } = setup();
    world.tracking.seed('B1', [
      { event: 10100, date: '2026-07-27T16:33:00' },
      { event: 41000, date: '2026-01-15T10:00:00' },
    ]);
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

  it('leaves unparseable input alone', () => {
    expect(kyivLocalToIso('yesterday')).toBe('yesterday');
  });
});

describe('createShipment', () => {
  it('creates the addresses, clients and shipment, and maps the answer', async () => {
    const { world, adapter } = setup();
    const shipment = await adapter.createShipment(shipmentInput);
    expect(shipment).toMatchObject({ carrier: 'ukrposhta', status: 'pre_transit' });
    expect(shipment.trackingNumber).toMatch(/^05\d{11}$/);
    expect(shipment.price).toMatchObject({ currency: 'UAH' });
    const wire = world.state
      .collection<{
        uuid: string;
        deliveryType: string;
        type: string;
        externalId: string;
        paidByRecipient: boolean;
        length: number;
        width: number;
        height: number;
        sender: { type: string; tin: string; externalId: string };
        recipient: { firstName: string; lastName: string; middleName: string; phoneNumber: string };
      }>('ecom-shipments')
      .require(shipment.id);
    expect(wire).toMatchObject({
      deliveryType: 'D2D',
      type: 'EXPRESS',
      externalId: 'order-1',
      paidByRecipient: false,
      // The longest side goes to `length`.
      length: 30,
      width: 20,
      height: 10,
      sender: { type: 'PRIVATE_ENTREPRENEUR', tin: '4201030327', externalId: 'shop-1' },
      recipient: { lastName: 'Іванов', firstName: 'Іван', middleName: 'Іванович', phoneNumber: '+380982004113' },
    });
  });

  it('reuses a client by external id and an address already on the client', async () => {
    const { world, adapter } = setup();
    await adapter.createShipment(shipmentInput);
    await adapter.createShipment(shipmentInput);
    // The sender has an external id and is reused; the recipient has none and is created each time.
    expect(world.ecom.callsTo('CreateClientsUsingPOST')).toHaveLength(3);
    expect(world.ecom.callsTo('GetClientByExternalIdUsingGET')).toHaveLength(2);
    expect(world.ecom.callsTo('CreateAddressUsingPOST')).toHaveLength(3);
  });

  it('attaches a new address to a reused client', async () => {
    const { adapter } = setup();
    await adapter.createShipment(shipmentInput);
    const moved: CreateShipmentInput = {
      ...shipmentInput,
      sender: { ...sender, point: { type: 'door', address: { ...senderAddress, building: '41' } } },
    };
    const shipment = await adapter.createShipment(moved);
    expect(shipment.id).toBeDefined();
  });

  it('uses carrierRefs of a known client and address', async () => {
    const { world, adapter } = setup();
    const first = await adapter.createShipment(shipmentInput);
    const raw = first.raw as { sender: { uuid: string; addressId: number } };
    const known: Party = {
      ...sender,
      point: {
        type: 'door',
        address: {
          ...senderAddress,
          carrierRefs: { ukrposhta: { clientUuid: raw.sender.uuid, addressId: String(raw.sender.addressId) } },
        },
      },
    };
    const lookups = world.ecom.callsTo('GetClientByExternalIdUsingGET').length;
    await adapter.createShipment({ ...shipmentInput, sender: known });
    expect(world.ecom.callsTo('GetClientByExternalIdUsingGET')).toHaveLength(lookups);
    expect(world.ecom.callsTo('GetClientUsingGET')).toHaveLength(1);
  });

  it('delivers to a post office with W2W', async () => {
    const { world, adapter } = setup();
    const toOffice: CreateShipmentInput = {
      ...shipmentInput,
      sender: { ...sender, point: { type: 'location', locationId: '04071' } },
      recipient: { ...recipient, point: { type: 'location', locationId: '79000' } },
    };
    const shipment = await adapter.createShipment(toOffice);
    expect(world.state.collection<{ deliveryType: string }>('ecom-shipments').require(shipment.id).deliveryType).toBe(
      'W2W',
    );
  });

  it('maps cash on delivery, payer and service', async () => {
    const { world, adapter } = setup();
    const shipment = await adapter.createShipment({
      ...shipmentInput,
      parcels: [{ weight: { value: 800, unit: 'g' } }],
      options: {
        service: 'standard',
        payer: 'recipient',
        cashOnDelivery: { amount: money(300, 'UAH'), payer: 'sender' },
      },
      sender: { ...sender, contact: { company: 'ТОВ Лімон', phone: '0671231234' }, taxId: '40145721' },
    });
    const wire = world.state
      .collection<{
        type: string;
        paidByRecipient: boolean;
        postPay: number;
        postPayPaidByRecipient: boolean;
        declaredPrice: number;
        transferPostPayToBankAccount: boolean;
      }>('ecom-shipments')
      .require(shipment.id);
    expect(wire).toMatchObject({
      type: 'STANDARD',
      paidByRecipient: true,
      postPay: 300,
      postPayPaidByRecipient: false,
      // No declared value was given, so the COD amount is declared.
      declaredPrice: 300,
      transferPostPayToBankAccount: true,
    });
  });

  it('creates several parcels', async () => {
    const { adapter } = setup();
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
      { ...shipmentInput, recipient: { ...recipient, contact: { name: 'Іванов', phone: '1' } } },
      'recipient.contact',
    ],
    [
      'a company without a tax id',
      { ...shipmentInput, sender: { ...sender, taxId: undefined, contact: { company: 'ТОВ', phone: '1' } } },
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
  ])('rejects %s before sending anything', async (_name, input, field) => {
    const { world, adapter } = setup();
    await expect(adapter.createShipment(input as CreateShipmentInput)).rejects.toMatchObject({
      carrier: 'ukrposhta',
      category: CarrierErrorCategory.Validation,
      field,
    });
    expect(world.ecom.callsTo('CreateShipmentsUsingPOST')).toHaveLength(0);
  });

  it('turns a carrier rejection into a CarrierError', async () => {
    const { adapter } = setup();
    await expect(
      adapter.createShipment({ ...shipmentInput, parcels: [{ weight: { value: 31, unit: 'kg' } }] }),
    ).rejects.toMatchObject({ code: 'UPE01002', category: CarrierErrorCategory.Validation });
  });
});

describe('getShipment', () => {
  it('reads a shipment back with its status', async () => {
    const { world, adapter } = setup();
    const created = await adapter.createShipment(shipmentInput);
    world.advance(created.id, 'DELIVERED');
    expect(await adapter.getShipment(created.id)).toMatchObject({ id: created.id, status: 'delivered' });
  });
});

describe('getRates', () => {
  const request = { sender, recipient, parcels: shipmentInput.parcels };

  it('prices Express and Standard', async () => {
    const { adapter } = setup();
    const rates = await adapter.getRates(request);
    expect(rates.map(r => r.service)).toEqual(['EXPRESS', 'STANDARD']);
    expect(rates[0]).toMatchObject({ carrier: 'ukrposhta', serviceName: 'Ukrposhta Express' });
    expect(rates[0]!.total.currency).toBe('UAH');
    expect(Number(rates[1]!.total.amount)).toBeLessThan(Number(rates[0]!.total.amount));
  });

  it('prices one requested service', async () => {
    const { adapter } = setup();
    const rates = await adapter.getRates({ ...request, options: { service: 'EXPRESS' } });
    expect(rates).toHaveLength(1);
  });

  it('works from postcodes alone, without contacts or a phone', async () => {
    const { adapter } = setup();
    const rates = await adapter.getRates({
      sender: { contact: {}, point: { type: 'location', locationId: '04071' } },
      recipient: { contact: {}, point: { type: 'location', locationId: '79000' } },
      parcels: [{ weight: { value: 2, unit: 'kg' } }],
    });
    expect(rates.length).toBeGreaterThan(0);
  });

  it('reports the discount as a charge when the API gives one', async () => {
    const { adapter } = setup();
    const [rate] = await adapter.getRates({ ...request, options: { service: 'EXPRESS' } });
    expect(rate!.charges![0]).toMatchObject({ type: 'delivery' });
  });

  it('keeps the rates that worked when one service fails, and throws when all fail', async () => {
    const { world, adapter } = setup();
    world.ecom.fail({
      operation: 'Calculatedeliverypriceusingpost2',
      status: 400,
      body: { code: 'UPE01002', message: 'bad' },
    });
    expect(await adapter.getRates(request)).toHaveLength(1);
    world.ecom.fail({
      operation: 'Calculatedeliverypriceusingpost2',
      status: 400,
      times: 2,
      body: { code: 'UPE01002', message: 'bad' },
    });
    await expect(adapter.getRates(request)).rejects.toMatchObject({ code: 'UPE01002' });
  });
});

describe('getLabel', () => {
  it('prints a PDF sticker, in the requested size', async () => {
    const { world, adapter } = setup();
    const shipment = await adapter.createShipment(shipmentInput);
    const label = await adapter.getLabel({ shipmentId: shipment.id, size: 'A4' });
    expect(label).toMatchObject({ format: 'PDF', encoding: 'binary', size: 'A4' });
    expect(label.encoding === 'binary' && isPdf(label.data)).toBe(true);
    expect(world.ecom.callsTo('getShipmentStickerUsingGET_2').at(-1)!.query).toMatchObject({ size: 'SIZE_A4' });
    await adapter.getLabel({ shipmentId: shipment.id, size: '100x100' });
    expect(world.ecom.callsTo('getShipmentStickerUsingGET_2').at(-1)!.query).not.toHaveProperty('size');
  });

  it('refuses other formats and sizes', async () => {
    const { adapter } = setup();
    const shipment = await adapter.createShipment(shipmentInput);
    await expect(adapter.getLabel({ shipmentId: shipment.id, format: 'ZPL' })).rejects.toMatchObject({
      field: 'format',
    });
    await expect(adapter.getLabel({ shipmentId: shipment.id, size: 'A3' })).rejects.toMatchObject({ field: 'size' });
  });
});

describe('cancelShipment', () => {
  it('deletes a fresh shipment', async () => {
    const { adapter } = setup();
    const shipment = await adapter.createShipment(shipmentInput);
    await adapter.cancelShipment(shipment.id);
    await expect(adapter.getShipment(shipment.id)).rejects.toMatchObject({ category: CarrierErrorCategory.NotFound });
  });

  it('says plainly that a registered shipment cannot be cancelled', async () => {
    const { world, adapter } = setup();
    const shipment = await adapter.createShipment(shipmentInput);
    world.advance(shipment.id, 'REGISTERED');
    await expect(adapter.cancelShipment(shipment.id)).rejects.toMatchObject({
      code: 'NOT_CANCELLABLE',
      category: CarrierErrorCategory.BusinessLogic,
    });
    expect((await adapter.getShipment(shipment.id)).status).toBe('in_transit');
  });
});

describe('createManifest', () => {
  it('groups the shipments and prints form 103a', async () => {
    const { adapter, world } = setup();
    const a = await adapter.createShipment(shipmentInput);
    const b = await adapter.createShipment({ ...shipmentInput, reference: 'order-2' });
    const manifest = await adapter.createManifest([a.id, b.id]);
    expect(manifest).toMatchObject({ carrier: 'ukrposhta', shipmentIds: [a.id, b.id] });
    expect(manifest.document?.encoding === 'binary' && isPdf(manifest.document.data)).toBe(true);
    expect(
      (await world.ecom.callsTo('AddShipmentToShipmentGroupUsingPOST')).length +
        world.ecom.callsTo('AssignMultipleShipmentsToShipmentGroupUsingPUT').length,
    ).toBe(1);
  });

  it('refuses shipments of different senders or types, and failed additions', async () => {
    const { adapter, world } = setup();
    const a = await adapter.createShipment(shipmentInput);
    const other = await adapter.createShipment({ ...shipmentInput, sender: { ...sender, externalId: 'shop-2' } });
    await expect(adapter.createManifest([a.id, other.id])).rejects.toMatchObject({ field: 'shipmentIds' });
    const standard = await adapter.createShipment({ ...shipmentInput, options: { service: 'STANDARD' } });
    await expect(adapter.createManifest([a.id, standard.id])).rejects.toMatchObject({ field: 'shipmentIds' });
    await expect(adapter.createManifest([])).rejects.toMatchObject({ field: 'shipmentIds' });
    world.advance(a.id, 'REGISTERED');
    await expect(adapter.createManifest([a.id])).rejects.toMatchObject({ code: 'MANIFEST_FAILED' });
  });
});

describe('locations and address validation', () => {
  function seeded() {
    const ctx = setup();
    ctx.world.classifier.seedPostOffice({
      ID: '2700',
      POSTINDEX: '01001',
      POSTCODE: '01001',
      PO_SHORT: 'Київ 1',
      PO_LONG: 'Відділення № 1',
      CITY_UA: 'Київ',
      REGION_UA: 'Київ',
      POCITY_ID: '29713',
      LATTITUDE: '50.449855',
      LONGITUDE: '30.523063',
      ADDRESS: 'вул. Хрещатик, 22',
    });
    ctx.world.classifier.seedPostOffice({
      ID: '9',
      POSTINDEX: '79000',
      POSTCODE: '79000',
      PO_SHORT: 'Львів 0',
      CITY_UA: 'Львів',
      POCITY_ID: '5',
      LATTITUDE: '49.84',
      LONGITUDE: '24.03',
    });
    ctx.world.classifier.seedCity({
      CITY_ID: '29713',
      REGION_ID: '286',
      DISTRICT_ID: '412',
      CITY_UA: 'Київ',
      REGION_UA: 'Київ',
      DISTRICT_UA: 'Київ',
      POSTCODE: '01001',
    });
    return ctx;
  }

  it('finds post offices by postcode, locality and distance', async () => {
    const { adapter } = seeded();
    const [byCode] = await adapter.findLocations({ postalCode: '01001' });
    expect(byCode).toMatchObject({
      id: '01001',
      carrier: 'ukrposhta',
      type: 'branch',
      name: 'Відділення № 1',
      number: '01001',
    });
    expect(byCode!.address).toMatchObject({
      country: 'UA',
      postalCode: '01001',
      city: 'Київ',
      geo: { lat: 50.449855, lng: 30.523063 },
    });
    expect(await adapter.findLocations({ cityId: '5' })).toHaveLength(1);
    expect(await adapter.findLocations({ city: 'Київ' })).toHaveLength(1);
    const near = await adapter.findLocations({ near: { lat: 50.45, lng: 30.52, radiusKm: 3 } });
    expect(near.map(l => l.id)).toEqual(['01001']);
    expect(near[0]!.name).toBe('Київ 1');
    expect(await adapter.findLocations({ postalCode: '01001', type: 'locker' })).toEqual([]);
    expect(await adapter.findLocations({ near: { lat: 50.45, lng: 30.52, radiusKm: 1000 }, limit: 1 })).toHaveLength(1);
    await expect(adapter.findLocations({})).rejects.toMatchObject({ field: 'query' });
  });

  it('validates an address against the classifier', async () => {
    const { adapter } = seeded();
    expect(await adapter.validateAddress({ country: 'UA', postalCode: '01001', city: 'Київ' })).toMatchObject({
      valid: true,
      normalized: { region: 'Київ', district: 'Київ', city: 'Київ' },
    });
    expect(await adapter.validateAddress({ country: 'UA', postalCode: '01001', city: 'Львів' })).toMatchObject({
      valid: false,
      messages: [expect.stringContaining('belongs to Київ')],
    });
    expect(await adapter.validateAddress({ country: 'UA', postalCode: '99999' })).toMatchObject({ valid: false });
    expect(await adapter.validateAddress({ country: 'UA', postalCode: '12' })).toMatchObject({ valid: false });
    expect(await adapter.validateAddress({ country: 'UA' })).toMatchObject({ valid: false });
  });
});

runAdapterConformance('Ukrposhta', () => {
  const { world, adapter } = setup();
  world.classifier.seedPostOffice({
    ID: '2700',
    POSTINDEX: '01001',
    POSTCODE: '01001',
    PO_SHORT: 'Київ 1',
    CITY_UA: 'Київ',
  });
  const wire = (shipment: { id: string }) => {
    const row = world.state
      .collection<{ weight: number; senderAddressId: number; recipientAddressId: number }>('ecom-shipments')
      .require(shipment.id);
    const address = (id: number) =>
      world.state
        .collection<{ country: string; postcode: string; city?: string }>('ecom-addresses')
        .require(String(id));
    const from = address(row.senderAddressId);
    const to = address(row.recipientAddressId);
    return {
      weightKg: row.weight / 1000,
      sender: { country: from.country, postalCode: from.postcode, city: from.city },
      recipient: { country: to.country, postalCode: to.postcode, city: to.city },
    };
  };
  return {
    adapter,
    scenario: {
      shipment: shipmentInput,
      invalidShipment: { ...shipmentInput, parcels: [{ weight: { value: 31, unit: 'kg' } }] },
      rateRequest: { sender, recipient, parcels: shipmentInput.parcels },
      locationQuery: { postalCode: '01001' },
      unknownTrackingNumber: '0599999999999',
      deliver: s => void world.advance(s.id, 'DELIVERED'),
      inspectShipment: wire,
    },
  };
});
