import { isPdf } from '@shopana/carrier-testing';
import { CarrierErrorCategory } from '@shopana/carrier-core';
import {
  AddressesService,
  ClientsService,
  LabelsService,
  PricingService,
  ShipmentGroupsService,
  ShipmentsService,
  createUkrposhtaContractClient,
  createUkrposhtaTrackingClient,
} from '../src';
import { createUkrposhtaSimulator } from '../src/simulator';

function setup() {
  const world = createUkrposhtaSimulator();
  const { clock } = world;
  const retry = { sleep: clock.sleep, clock };
  const ecom = createUkrposhtaContractClient({
    transport: world.transport,
    bearer: 'ecom-bearer',
    counterpartyToken: 'cp-token',
    retry,
  })
    .use(new AddressesService())
    .use(new ClientsService())
    .use(new ShipmentsService())
    .use(new PricingService())
    .use(new ShipmentGroupsService())
    .use(new LabelsService());
  const tracking = createUkrposhtaTrackingClient({ transport: world.transport, bearer: 'tracking-bearer', retry });
  return { world, ecom, tracking };
}

async function senderAndRecipient(ecom: ReturnType<typeof setup>['ecom']) {
  const senderAddress = await ecom.addresses.create({
    postcode: '04071',
    city: 'Київ',
    street: 'Хорива',
    houseNumber: '40',
  });
  const recipientAddress = await ecom.addresses.create({ postcode: '79000', city: 'Львів' });
  const sender = await ecom.clients.create({
    type: 'PRIVATE_ENTREPRENEUR',
    firstName: 'Петро',
    lastName: 'Петренко',
    tin: '4201030327',
    addressId: senderAddress.id,
    phoneNumber: '0672802273',
    bankAccount: 'UA073808050000000026000439806',
  });
  const recipient = await ecom.clients.create({
    type: 'INDIVIDUAL',
    firstName: 'Іван',
    lastName: 'Іванов',
    addressId: recipientAddress.id,
    phoneNumber: '0982004113',
    externalId: 'cust-1',
  });
  return { sender, recipient, senderAddress, recipientAddress };
}

const parcel = { weight: 1200, length: 30, width: 10, height: 10, declaredPrice: 500 };

describe('address → client → shipment → sticker → group → form 103a → tracking', () => {
  it('walks the whole flow', async () => {
    const { world, ecom, tracking } = setup();
    const { sender, recipient } = await senderAndRecipient(ecom);

    const shipment = await ecom.shipments.create({
      sender: { uuid: sender.uuid },
      recipient: { uuid: recipient.uuid },
      deliveryType: 'W2W',
      parcels: [parcel],
      paidByRecipient: true,
    });
    expect(shipment).toMatchObject({ type: 'EXPRESS', lifecycle: { status: 'CREATED' } });
    expect(shipment.barcode).toMatch(/^05\d{11}$/);
    expect(shipment.deliveryPrice).toBeGreaterThan(0);

    const sticker = await ecom.labels.getSticker(shipment.barcode);
    expect(sticker.contentType).toBe('application/pdf');
    expect(isPdf(sticker.data)).toBe(true);

    const group = await ecom.shipmentGroups.create({ name: 'Group 1', clientUuid: sender.uuid });
    await ecom.shipmentGroups.addShipment(group.uuid, shipment.uuid);
    expect(await ecom.shipmentGroups.countShipments(group.uuid)).toMatchObject({ quantity: 1 });
    const form = await ecom.labels.getForm103a(group.uuid, { showSenderName: true });
    expect(isPdf(form.data)).toBe(true);

    world.advance(shipment.uuid, 'REGISTERED');
    expect((await ecom.shipmentGroups.getByShipment(shipment.uuid)).closed).toBe(true);
    expect((await ecom.shipments.getLifecycle(shipment.barcode)).status).toBe('REGISTERED');

    world.advance(shipment.uuid, 'DELIVERED');
    const events = await tracking.tracking.getStatuses(shipment.barcode);
    expect(events.map(e => String(e.event))).toEqual(['10100', '20800', '21700', '41000']);
    expect((await tracking.tracking.getLastStatus(shipment.barcode)).event).toBe('41000');
  });

  it('shows a return as 41000 with reason 10', async () => {
    const { world, ecom, tracking } = setup();
    const { sender, recipient } = await senderAndRecipient(ecom);
    const shipment = await ecom.shipments.create({
      sender: { uuid: sender.uuid },
      recipient: { uuid: recipient.uuid },
      deliveryType: 'W2W',
      parcels: [parcel],
    });
    world.advance(shipment.uuid, 'RETURNED');
    const last = await tracking.tracking.getLastStatus(shipment.barcode);
    expect(last).toMatchObject({ event: '41000', eventReason_id: 10 });
  });
});

describe('carrier rules the simulator enforces', () => {
  it('rejects a shipment deletion after registration, allows it before', async () => {
    const { world, ecom } = setup();
    const { sender, recipient } = await senderAndRecipient(ecom);
    const make = () =>
      ecom.shipments.create({
        sender: { uuid: sender.uuid },
        recipient: { uuid: recipient.uuid },
        deliveryType: 'W2W',
        parcels: [parcel],
      });
    const first = await make();
    await ecom.shipments.delete(first.uuid);
    await expect(ecom.shipments.get(first.uuid)).rejects.toMatchObject({ category: CarrierErrorCategory.NotFound });

    const second = await make();
    world.advance(second.uuid, 'REGISTERED');
    await expect(ecom.shipments.delete(second.uuid)).rejects.toMatchObject({
      code: 'UPE01001',
      category: CarrierErrorCategory.BusinessLogic,
    });
  });

  it.each([
    ['a parcel over 30 kg', { weight: 31000, length: 30 }, 'weight'],
    ['a zero weight', { weight: 0, length: 30 }, 'weight'],
    ['a long side without width and height', { weight: 1000, length: 100 }, 'width'],
    ['sides summing over 250 cm', { weight: 1000, length: 120, width: 70, height: 70 }, 'length'],
  ])('rejects %s with UPE01002', async (_name, bad, field) => {
    const { ecom } = setup();
    const { sender, recipient } = await senderAndRecipient(ecom);
    await expect(
      ecom.shipments.create({
        sender: { uuid: sender.uuid },
        recipient: { uuid: recipient.uuid },
        deliveryType: 'W2W',
        parcels: [bad],
      }),
    ).rejects.toMatchObject({ code: 'UPE01002', field });
  });

  it('limits DOCUMENT shipments and cash on delivery', async () => {
    const { ecom } = setup();
    const { sender, recipient } = await senderAndRecipient(ecom);
    const base = { sender: { uuid: sender.uuid }, recipient: { uuid: recipient.uuid }, deliveryType: 'W2W' as const };
    await expect(
      ecom.shipments.create({ ...base, type: 'DOCUMENT', parcels: [{ weight: 200, length: 20 }] }),
    ).rejects.toMatchObject({ field: 'weight' });
    await expect(
      ecom.shipments.create({ ...base, parcels: [{ weight: 500, length: 20, declaredPrice: 100 }], postPay: 200 }),
    ).rejects.toMatchObject({ field: 'postPay' });
    await expect(
      ecom.shipments.create({
        ...base,
        parcels: [{ weight: 500, length: 20, declaredPrice: 300 }],
        postPay: 200,
        transferPostPayToBankAccount: true,
      }),
    ).resolves.toMatchObject({ postPay: 200 });
  });

  it('validates addresses and clients like the carrier', async () => {
    const { ecom } = setup();
    await expect(ecom.addresses.create({ postcode: '123' })).rejects.toMatchObject({ code: 'UPE01002' });
    await expect(ecom.addresses.create({ postcode: '66666' })).rejects.toMatchObject({
      message: 'Address has not been saved! PostOffice 66666 not found!',
    });
    const address = await ecom.addresses.create({ postcode: '04071' });
    await expect(
      ecom.clients.create({ type: 'COMPANY', name: 'ТОВ', addressId: address.id, phoneNumber: '0671231234' }),
    ).rejects.toMatchObject({ field: 'edrpou' });
    await expect(
      ecom.clients.create({
        type: 'PRIVATE_ENTREPRENEUR',
        firstName: 'A',
        lastName: 'B',
        addressId: address.id,
        phoneNumber: '1',
      }),
    ).rejects.toMatchObject({ field: 'tin' });
    await expect(
      ecom.clients.create({ name: 'ТОВ', edrpou: '40145721', addressId: 999, phoneNumber: '0671231234' }),
    ).rejects.toMatchObject({ category: CarrierErrorCategory.NotFound });
  });

  it('rejects calls without the counterparty token', async () => {
    const world = createUkrposhtaSimulator();
    const ecom = createUkrposhtaContractClient({
      transport: world.transport,
      bearer: 'ecom-bearer',
      counterpartyToken: '',
      retry: false,
    }).use(new ShipmentsService());
    await expect(ecom.shipments.get('x')).rejects.toMatchObject({
      code: 'UPE05001',
      category: CarrierErrorCategory.Authentication,
    });
  });
});

describe('clients', () => {
  it('finds a client by external id and phone and updates it', async () => {
    const { ecom } = setup();
    const { recipient } = await senderAndRecipient(ecom);
    expect((await ecom.clients.getByExternalId('cust-1')).uuid).toBe(recipient.uuid);
    expect((await ecom.clients.getByPhone('0982004113')).map(c => c.uuid)).toEqual([recipient.uuid]);
    const updated = await ecom.clients.update(recipient.uuid, { phoneNumber: '0501112233' });
    expect(updated.phones.map(p => [p.phoneNumber, p.main])).toEqual([
      ['+380982004113', false],
      ['+380501112233', true],
    ]);
    await expect(ecom.clients.getByPhone('0000000001')).rejects.toMatchObject({
      category: CarrierErrorCategory.NotFound,
    });
    expect(await ecom.clients.listAddresses(recipient.uuid)).toHaveLength(1);
    expect(await ecom.clients.listPhones(recipient.uuid)).toHaveLength(2);
    expect(await ecom.clients.listEmails(recipient.uuid)).toEqual([]);
  });

  it('makes another address the main one', async () => {
    const { ecom } = setup();
    const { recipient } = await senderAndRecipient(ecom);
    const second = await ecom.addresses.create({ postcode: '61153', city: 'Харків' });
    const updated = await ecom.clients.update(recipient.uuid, { addresses: [{ addressId: second.id, main: true }] });
    expect(updated.addressId).toBe(second.id);
    expect(updated.addresses.filter(a => a.main).map(a => a.addressId)).toEqual([second.id]);
  });
});

describe('shipments', () => {
  it('changes a shipment while it is not registered and refuses afterwards', async () => {
    const { world, ecom } = setup();
    const { sender, recipient } = await senderAndRecipient(ecom);
    const shipment = await ecom.shipments.create({
      sender: { uuid: sender.uuid },
      recipient: { uuid: recipient.uuid },
      deliveryType: 'W2W',
      parcels: [parcel],
    });
    const changed = await ecom.shipments.update(shipment.uuid, {
      description: 'new',
      parcels: [{ uuid: shipment.parcels[0]!.uuid, weight: 4000, length: 40 }],
    });
    expect(changed).toMatchObject({ description: 'new', weight: 4000 });
    expect(changed.deliveryPrice).toBeGreaterThan(shipment.deliveryPrice);
    const withParcel = await ecom.shipments.addParcel(shipment.uuid, { weight: 500, length: 20, declaredPrice: 10 });
    expect(withParcel.parcels).toHaveLength(2);
    expect((await ecom.shipments.getByBarcode(withParcel.parcels[1]!.barcode)).uuid).toBe(shipment.uuid);
    expect(await ecom.shipments.isPriceChangedInPostOffice(shipment.barcode)).toBe(false);
    expect(
      await ecom.shipments
        .listPriceChanged(sender.uuid, { from: '2026-01-01', to: '2026-12-31' })
        .catch(() => 'not simulated'),
    ).toBe('not simulated');

    world.advance(shipment.uuid, 'REGISTERED');
    await expect(ecom.shipments.update(shipment.uuid, { description: 'late' })).rejects.toMatchObject({
      code: 'UPE01001',
    });
  });

  it('creates many shipments and lists a sender’s shipments', async () => {
    const { ecom } = setup();
    const { sender, recipient } = await senderAndRecipient(ecom);
    const input = {
      sender: { uuid: sender.uuid },
      recipient: { uuid: recipient.uuid },
      deliveryType: 'W2W' as const,
      parcels: [parcel],
    };
    const created = await ecom.shipments.create([input, input]);
    expect(created).toHaveLength(2);
    expect(new Set(created.map(s => s.barcode)).size).toBe(2);
    expect(await ecom.shipments.updateMany([{ uuid: created[0]!.uuid, description: 'x' }])).toHaveLength(1);
  });
});

describe('pricing', () => {
  it('calculates a price with discounts and surcharges', async () => {
    const { ecom } = setup();
    const price = await ecom.pricing.calculate({
      addressFrom: { postcode: '04071' },
      addressTo: { postcode: '47743' },
      type: 'EXPRESS',
      deliveryType: 'W2D',
      parcels: [{ weight: 3000, length: 35, width: 20, height: 20 }],
      declaredPrice: 1000,
      discounts: [{ description: 'Discount 20%', rate: 20 }],
    });
    expect(price.rawDeliveryPrice).toBeGreaterThan(price.deliveryPrice);
    expect(price.calculationDescription).toContain('Discount 20%');
    const tariffs = await ecom.pricing.listTariffs();
    expect(tariffs[0]).toMatchObject({ weight: 250, price: 18 });
    expect((await ecom.pricing.getTariff(tariffs[1]!.uuid)).price).toBe(21);
    await expect(ecom.pricing.getTariff('nope')).rejects.toMatchObject({ category: CarrierErrorCategory.NotFound });
  });

  it('rejects an empty parcel', async () => {
    const { ecom } = setup();
    await expect(
      ecom.pricing.calculate({
        addressFrom: { postcode: '04071' },
        addressTo: { postcode: '47743' },
        type: 'EXPRESS',
        deliveryType: 'W2W',
        weight: 0,
        length: 0,
      }),
    ).rejects.toMatchObject({ code: 'UPE01002' });
  });
});

describe('shipment groups', () => {
  async function groupWith(count: number) {
    const ctx = setup();
    const { sender, recipient } = await senderAndRecipient(ctx.ecom);
    const group = await ctx.ecom.shipmentGroups.create({ name: 'G', clientUuid: sender.uuid });
    const shipments = [];
    for (let i = 0; i < count; i += 1) {
      shipments.push(
        await ctx.ecom.shipments.create({
          sender: { uuid: sender.uuid },
          recipient: { uuid: recipient.uuid },
          deliveryType: 'W2W',
          parcels: [{ ...parcel, weight: 1000 + i * 100 }],
        }),
      );
    }
    return { ...ctx, sender, recipient, group, shipments };
  }

  it('adds many shipments at once, reporting the ones that fail (207)', async () => {
    const { ecom, group, shipments } = await groupWith(2);
    const results = await ecom.shipmentGroups.addShipments(group.uuid, [
      shipments[0]!.uuid,
      shipments[1]!.barcode,
      'missing',
    ]);
    expect(results.map(r => r.httpStatus)).toEqual([200, 200, 404]);
    expect(results[1]).toHaveProperty('targetBarcode', shipments[1]!.barcode);
    expect((await ecom.shipmentGroups.countShipments(group.uuid)).quantity).toBe(2);
  });

  it('pages, sorts and filters the shipments of a group', async () => {
    const { world, ecom, group, shipments } = await groupWith(5);
    await ecom.shipmentGroups.addShipments(
      group.uuid,
      shipments.map(s => s.uuid),
    );
    const page = await ecom.shipmentGroups.listShipments(group.uuid, {
      size: 2,
      page: 2,
      sort: ['weight'],
      order: 'desc',
    });
    expect(page.map(s => s.weight)).toEqual([1200, 1100]);
    const all: number[] = [];
    for await (const shipment of ecom.shipmentGroups.iterateShipments(group.uuid, { size: 2 }))
      all.push(shipment.weight);
    expect(all).toHaveLength(5);
    world.ecom.advance(shipments[0]!.uuid, 'REGISTERED');
    expect(await ecom.shipmentGroups.listShipments(group.uuid, { status: 'REGISTERED' })).toHaveLength(1);
    expect(await ecom.shipmentGroups.listShipments(group.uuid, { statusesGroup: 'NONREGISTERED' })).toHaveLength(4);
    expect((await ecom.shipmentGroups.countShipments(group.uuid, { status: 'CREATED' })).quantity).toBe(4);
  });

  it('refuses changes of a closed group and shipments of another type', async () => {
    const { world, ecom, sender, recipient, group, shipments } = await groupWith(2);
    await ecom.shipmentGroups.addShipment(group.uuid, shipments[0]!.uuid);
    world.advance(shipments[0]!.uuid, 'REGISTERED');
    await expect(ecom.shipmentGroups.addShipment(group.uuid, shipments[1]!.uuid)).rejects.toMatchObject({
      code: 'UPE01001',
    });
    await expect(ecom.shipmentGroups.removeShipment(shipments[0]!.uuid)).rejects.toMatchObject({ code: 'UPE01001' });

    const standard = await ecom.shipmentGroups.create({ name: 'S', type: 'STANDARD' });
    await expect(ecom.shipmentGroups.addShipment(standard.uuid, shipments[1]!.uuid)).rejects.toMatchObject({
      code: 'UPE01001',
    });
    expect(sender.uuid).toBeDefined();
    expect(recipient.uuid).toBeDefined();
  });

  it('creates shipments inside a group, renames it and finds it', async () => {
    const { ecom, sender, recipient, group } = await groupWith(0);
    const [created] = await ecom.shipmentGroups.createShipment(group.uuid, [
      { sender: { uuid: sender.uuid }, recipient: { uuid: recipient.uuid }, deliveryType: 'W2W', parcels: [parcel] },
    ]);
    expect(created!.shipmentGroupUuid).toBe(group.uuid);
    expect((await ecom.shipmentGroups.rename(group.uuid, 'Renamed')).name).toBe('Renamed');
    expect(await ecom.shipmentGroups.listByClient(sender.uuid, { type: 'EXPRESS' })).toHaveLength(1);
    expect(await ecom.shipmentGroups.listByClient(sender.uuid, { type: 'STANDARD' })).toHaveLength(0);
    await ecom.shipmentGroups.removeShipment(created!.uuid);
    await expect(ecom.shipmentGroups.getByShipment(created!.uuid)).rejects.toMatchObject({
      category: CarrierErrorCategory.NotFound,
    });
  });

  it('prints nothing for an empty group', async () => {
    const { ecom, group } = await groupWith(0);
    await expect(ecom.labels.getForm103a(group.uuid)).rejects.toMatchObject({ code: 'UPE01001' });
    await expect(ecom.labels.getGroupStickers(group.uuid)).rejects.toMatchObject({ code: 'UPE01001' });
  });
});

describe('labels', () => {
  it('prints stickers for one parcel, a list and a group', async () => {
    const { ecom, ...rest } = setup();
    void rest;
    const { sender, recipient } = await senderAndRecipient(ecom);
    const shipment = await ecom.shipments.create({
      sender: { uuid: sender.uuid },
      recipient: { uuid: recipient.uuid },
      deliveryType: 'W2W',
      parcels: [parcel, { weight: 300, length: 10, declaredPrice: 5 }],
    });
    expect(isPdf((await ecom.labels.getParcelSticker(shipment.parcels[1]!.barcode)).data)).toBe(true);
    expect(isPdf((await ecom.labels.getStickers([shipment.uuid, shipment.barcode], { size: 'SIZE_A4' })).data)).toBe(
      true,
    );
    expect(isPdf((await ecom.labels.getStickers({ [shipment.barcode]: { hideWeight: true } })).data)).toBe(true);
    expect(isPdf((await ecom.labels.getShipmentLabel(shipment.uuid)).data)).toBe(true);
    await expect(ecom.labels.getSticker('nope')).rejects.toMatchObject({ category: CarrierErrorCategory.NotFound });
    await expect(ecom.labels.getParcelSticker('nope')).rejects.toMatchObject({
      category: CarrierErrorCategory.NotFound,
    });
    await expect(ecom.labels.getStickers(['nope'])).rejects.toMatchObject({ category: CarrierErrorCategory.NotFound });
  });
});

describe('addresses', () => {
  it('reads an address back and refuses unknown ids', async () => {
    const { ecom } = setup();
    const address = await ecom.addresses.create({
      postcode: '04071',
      city: 'Київ',
      street: 'Хорива',
      houseNumber: '40',
    });
    expect(await ecom.addresses.get(address.id)).toMatchObject({ postcode: '04071', country: 'UA' });
    expect(address.detailedInfo).toContain('Хорива 40');
    await expect(ecom.addresses.get(1)).rejects.toMatchObject({ category: CarrierErrorCategory.NotFound });
  });
});
