import { createUkrposhtaClassifierClient, createUkrposhtaContractClient, createUkrposhtaTrackingClient } from '../src';
import { describeIf, env, transport } from './env';

// A wider eCom flow than `ecom.e2e.ts`: clients, a shipment group, reading a shipment every way and
// asking tracking about a shipment that has no events yet. Works against the sandbox and a simulator.
describeIf(env.bearer && env.token && env.trackingBearer)('Ukrposhta sandbox: shipment flow', () => {
  const ecom = createUkrposhtaContractClient({
    transport,
    environment: 'sandbox',
    bearer: env.bearer!,
    counterpartyToken: env.token!,
    ...(env.ecomBaseUrl ? { baseUrl: env.ecomBaseUrl } : {}),
    ...(env.formsBaseUrl ? { formsBaseUrl: env.formsBaseUrl } : {}),
  });
  const tracking = createUkrposhtaTrackingClient({
    transport,
    bearer: env.trackingBearer!,
    ...(env.trackingBaseUrl ? { baseUrl: env.trackingBaseUrl } : {}),
  });
  const classifier = createUkrposhtaClassifierClient({
    transport,
    bearer: env.bearer!,
    ...(env.classifierBaseUrl ? { baseUrl: env.classifierBaseUrl } : {}),
  });

  it('groups a shipment, reads it back and tracks it', async () => {
    const from = await ecom.addresses.create({ postcode: '04071', city: 'Kyiv', street: 'Khoryva', houseNumber: '40' });
    const to = await ecom.addresses.create({ postcode: '79000', city: 'Lviv' });
    expect((await ecom.addresses.get(from.id)).postcode).toBe('04071');
    expect((await ecom.addresses.checkRoute('04071', '79000')).code).toBeDefined();

    const sender = await ecom.clients.create({
      type: 'INDIVIDUAL',
      firstName: 'Test',
      lastName: 'Vidpravnyk',
      middleName: 'Testovych',
      addressId: from.id,
      phoneNumber: '0671231235',
    });
    const recipient = await ecom.clients.create({
      type: 'INDIVIDUAL',
      firstName: 'Test',
      lastName: 'Otrymuvach',
      middleName: 'Testovych',
      addressId: to.id,
      phoneNumber: '0501231235',
    });
    const renamed = await ecom.clients.update(sender.uuid, { firstName: 'Testa' });
    expect(renamed.firstName).toBe('Testa');
    expect((await ecom.clients.get(sender.uuid)).firstName).toBe('Testa');

    const group = await ecom.shipmentGroups.create({ name: 'e2e group', clientUuid: sender.uuid });
    const shipment = await ecom.shipments.create({
      sender: { uuid: sender.uuid },
      recipient: { uuid: recipient.uuid },
      deliveryType: 'W2W',
      parcels: [{ weight: 1500, length: 30, width: 20, height: 10 }],
    });
    try {
      await ecom.shipmentGroups.addShipment(group.uuid, shipment.uuid);
      expect((await ecom.shipmentGroups.getByShipment(shipment.uuid)).uuid).toBe(group.uuid);
      expect((await ecom.shipmentGroups.listShipments(group.uuid)).map(({ uuid }) => uuid)).toContain(shipment.uuid);
      expect((await ecom.shipmentGroups.rename(group.uuid, 'e2e group 2')).name).toBe('e2e group 2');
      expect((await ecom.shipmentGroups.listByClient(sender.uuid)).map(({ uuid }) => uuid)).toContain(group.uuid);

      expect((await ecom.shipments.get(shipment.uuid)).barcode).toBe(shipment.barcode);
      expect((await ecom.shipments.getByBarcode(shipment.barcode)).uuid).toBe(shipment.uuid);
      expect((await ecom.shipments.getLifecycle(shipment.barcode)).status).toBe('CREATED');
      expect((await ecom.shipments.listBySender(sender.uuid)).map(({ uuid }) => uuid)).toContain(shipment.uuid);
      expect((await ecom.barcodes.get(shipment.barcode)).barcode).toBe(shipment.barcode);
      const updated = await ecom.shipments.update(shipment.uuid, { description: 'e2e' });
      expect(updated.description).toBe('e2e');

      const stickers = await ecom.labels.getGroupStickers(group.uuid);
      expect(new TextDecoder().decode(stickers.data.slice(0, 4))).toBe('%PDF');

      const statuses = await tracking.tracking.getStatusesBatchWithNotFound([shipment.barcode]);
      expect(statuses.notFound).toContain(shipment.barcode);
    } finally {
      await ecom.shipmentGroups.removeShipment(shipment.uuid).catch(() => undefined);
      await ecom.shipments.delete(shipment.uuid);
    }
  });

  it('finds a region in the classifier', async () => {
    const answer = await classifier.classifier.getRegions({ regionName: 'Львівська' });
    expect(JSON.stringify(answer)).toContain('Львівська');
  });
});
