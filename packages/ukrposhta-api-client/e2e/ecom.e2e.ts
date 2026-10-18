import {
  AddressesService,
  ClientsService,
  LabelsService,
  PricingService,
  ShipmentsService,
  createUkrposhtaContractClient,
} from '../src';
import { describeIf, env, transport } from './env';

describeIf(env.bearer && env.token)('Ukrposhta sandbox: eCom', () => {
  const client = createUkrposhtaContractClient({
    transport,
    environment: 'sandbox',
    bearer: env.bearer!,
    counterpartyToken: env.token!,
  })
    .use(new AddressesService())
    .use(new ClientsService())
    .use(new ShipmentsService())
    .use(new PricingService())
    .use(new LabelsService());

  it('creates a shipment, prints its sticker and deletes it', async () => {
    const from = await client.addresses.create({
      postcode: '04071',
      city: 'Київ',
      street: 'Хорива',
      houseNumber: '40',
    });
    const to = await client.addresses.create({ postcode: '79000', city: 'Львів' });
    const sender = await client.clients.create({
      type: 'INDIVIDUAL',
      firstName: 'Тест',
      lastName: 'Відправник',
      middleName: 'Тестович',
      addressId: from.id,
      phoneNumber: '0671231234',
    });
    const recipient = await client.clients.create({
      type: 'INDIVIDUAL',
      firstName: 'Тест',
      lastName: 'Отримувач',
      middleName: 'Тестович',
      addressId: to.id,
      phoneNumber: '0501231234',
    });
    const shipment = await client.shipments.create({
      sender: { uuid: sender.uuid },
      recipient: { uuid: recipient.uuid },
      deliveryType: 'W2W',
      parcels: [{ weight: 1000, length: 30, width: 20, height: 10 }],
    });
    try {
      expect(shipment.lifecycle.status).toBe('CREATED');
      const sticker = await client.labels.getSticker(shipment.uuid);
      expect(new TextDecoder().decode(sticker.data.slice(0, 4))).toBe('%PDF');
    } finally {
      await client.shipments.delete(shipment.uuid);
    }
  });

  it('calculates a price', async () => {
    const price = await client.pricing.calculate({
      addressFrom: { postcode: '04071' },
      addressTo: { postcode: '79000' },
      type: 'EXPRESS',
      deliveryType: 'W2W',
      parcels: [{ weight: 1000, length: 30, width: 20, height: 10 }],
    });
    expect(price.deliveryPrice).toBeGreaterThan(0);
  });
});
