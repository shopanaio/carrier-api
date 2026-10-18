// Requests written the way the official documentation shows them (eCom 02.09.2026, letters 07.10.2026,
// international 16.10.2026), checked on the wire: method, host, path, query and body.
import { createUkrposhtaContractClient } from '../src';
import type { ShipmentInput } from '../src';
import { createMockTransport, ok } from './helpers/mock';

function setup() {
  const mock = createMockTransport([
    { method: 'GET', path: '*', respond: ok({}) },
    { method: 'POST', path: '*', respond: ok({}) },
    { method: 'PUT', path: '*', respond: ok({}) },
    { method: 'DELETE', path: '*', respond: ok({}) },
  ]);
  const client = createUkrposhtaContractClient({
    transport: mock.transport,
    bearer: 'bearer',
    counterpartyToken: 'token',
    retry: false,
  });
  return { mock, client };
}

describe('shipment with packaging (eCom, section 4)', () => {
  it('sends properties and parcels_properties as the example does', async () => {
    const { mock, client } = setup();
    // The literal of the documentation example, typed without any cast.
    const example: ShipmentInput = {
      sender: { uuid: '{SenderUuid}' },
      recipient: { uuid: '{RecipientUuid}' },
      type: 'STANDARD',
      deliveryType: 'W2W',
      description: 'Shipment with packaging',
      paidByRecipient: false,
      properties: { packagingPaidByRecipient: false },
      parcels: [
        {
          name: 'Parcel-1',
          weight: 1200,
          length: 20,
          width: 10,
          height: 10,
          declaredPrice: 500,
          parcels_properties: { packagingPrice: '25', KMAT: 'PACK02' },
        },
      ],
    };
    await client.shipments.create(example);
    expect(mock.last()).toMatchObject({ method: 'POST', path: '/ecom/0.0.1/shipments', query: { token: 'token' } });
    expect(mock.last().body).toEqual(example);
  });

  it('prices each parcel separately in a multi-parcel shipment', async () => {
    const { mock, client } = setup();
    await client.shipments.create({
      sender: { uuid: 's' },
      recipient: { uuid: 'r' },
      deliveryType: 'W2W',
      parcels: [
        {
          weight: 1200,
          length: 150,
          width: 10,
          height: 10,
          parcels_properties: { packagingPrice: '10', KMAT: 'PACK02' },
        },
        {
          weight: 1200,
          length: 150,
          width: 11,
          height: 10,
          parcels_properties: { packagingPrice: '20', KMAT: 'PACK03' },
        },
      ],
    });
    const parcels = (mock.last().body as { parcels: Array<{ parcels_properties: object }> }).parcels;
    expect(parcels.map(parcel => parcel.parcels_properties)).toEqual([
      { packagingPrice: '10', KMAT: 'PACK02' },
      { packagingPrice: '20', KMAT: 'PACK03' },
    ]);
  });

  it('calculates with packaging in the structure of section 6.2', async () => {
    const { mock, client } = setup();
    await client.pricing.calculate({
      addressFrom: { postcode: '04071' },
      addressTo: { postcode: '47743' },
      type: 'EXPRESS',
      deliveryType: 'W2W',
      packagingPaidByRecipient: false,
      parcels: [{ weight: 3000, length: 35, width: 20, height: 20, packagingPrice: 25 }],
    });
    expect(mock.last().body).toMatchObject({
      packagingPaidByRecipient: false,
      parcels: [{ packagingPrice: 25 }],
    });
  });
});

describe('international (international documentation, sections 5 and 9)', () => {
  it('creates an EMS shipment and an international group without leaving the types', async () => {
    const { mock, client } = setup();
    await client.shipments.create({
      type: 'INTERNATIONAL',
      packageType: 'EMS',
      sender: { uuid: 's' },
      recipient: { uuid: 'r' },
      deliveryType: 'W2W',
      parcels: [{ weight: 1000, length: 20, contentsType: 'GOODS' }],
    });
    expect(mock.last().body).toMatchObject({ type: 'INTERNATIONAL', packageType: 'EMS' });
    await client.shipmentGroups.create({ name: 'Group 1', type: 'INTERNATIONAL', packageType: 'PARCEL' });
    expect(mock.last()).toMatchObject({
      method: 'POST',
      path: '/ecom/0.0.1/shipment-groups',
      body: { name: 'Group 1', type: 'INTERNATIONAL', packageType: 'PARCEL' },
    });
  });

  it('asks about the availability of a country', async () => {
    const { mock, client } = setup();
    await client.countries.getDeliveryAvailability({ country: 'BG', product: 'EMS', type: 'AVIA' });
    expect(mock.last()).toMatchObject({
      path: '/ecom/0.0.1/countries/delivery-availability',
      query: { country: 'BG', product: 'EMS', type: 'AVIA', token: 'token' },
    });
    await client.countries.getDeliveryTypesAvailability('BG');
    expect(mock.last()).toMatchObject({
      path: '/ecom/0.0.1/countries/delivery-types-availability',
      query: { country: 'BG' },
    });
  });

  it('reads the international tariffs and forms', async () => {
    const { mock, client } = setup();
    await client.reference.listInternationalParcelTariffs();
    expect(mock.last().path).toBe('/ecom/0.0.1/dictionaries/tariffs/international/parcel');
    await client.reference.getInternationalWrapperTariff(7);
    expect(mock.last().path).toBe('/ecom/0.0.1/dictionaries/tariffs/international/wrapper/7');
    await client.labels.getGroupCn22('G1', { size: 'SIZE_A5' });
    expect(mock.last()).toMatchObject({
      path: '/forms/ecom/0.0.1/shipment-groups/G1/cn22',
      query: { size: 'SIZE_A5', token: 'token' },
    });
    await client.labels.getInternationalSticker('S1', { size: 'SIZE_10X10' });
    expect(mock.last()).toMatchObject({ path: '/forms/ecom/0.0.1/international/shipments/S1/sticker' });
  });

  it('pays international letters with an electronic stamp', async () => {
    const { mock, client } = setup();
    await client.payments.payInternational({
      balance: 21.5,
      edrpou: '3329515568',
      clientUuid: 'c',
      barcodes: ['R1', 'R2'],
    });
    expect(mock.last()).toMatchObject({
      method: 'POST',
      path: '/ecom/0.0.1/payments-bank-account/payment-international',
      body: { balance: 21.5, edrpou: '3329515568', clientUuid: 'c', barcodes: ['R1', 'R2'] },
    });
    await client.payments.payCashless({ type: 'INTERNATIONAL', clientUuid: 'c', amount: 66.67, barcodes: ['R1'] });
    expect(mock.last()).toMatchObject({
      method: 'PUT',
      path: '/ecom/0.0.1/payments/letters/estamp/paid-cashless',
      body: { type: 'INTERNATIONAL', clientUuid: 'c', amount: 66.67, barcodes: ['R1'] },
    });
  });
});

describe('letters (letters documentation, sections 3 to 6)', () => {
  it('reads the letter tariffs', async () => {
    const { mock, client } = setup();
    await client.reference.listLetterTariffs({ priority: 'PRIORITY', weight: 120 });
    expect(mock.last()).toMatchObject({
      path: '/ecom/0.0.1/dictionaries/letter-tariffs',
      query: { priority: 'PRIORITY', weight: 120 },
    });
    expect(mock.last().query).not.toHaveProperty('token');
    await client.reference.getLetterTariff('3f8bc180');
    expect(mock.last().path).toBe('/ecom/0.0.1/dictionaries/letter-tariffs/3f8bc180');
    await client.reference.listLetterSurchargeTariffs();
    expect(mock.last().path).toBe('/ecom/0.0.1/dictionaries/letter-surcharge-tariffs');
  });

  it('prints forms 119e and 20e for letters and for shipments', async () => {
    const { mock, client } = setup();
    const form119e = {
      idcode: 'L1',
      deliveredType: 'FAMILY_MEMBER' as const,
      deliveredDate: '20.11.2024',
      recipientName: 'Dmytro Kochubei',
    };
    await client.letters.getForm119e(form119e, 1);
    expect(mock.last()).toMatchObject({
      method: 'POST',
      path: '/forms/ecom/0.0.1/letters/domestic/form119e',
      query: { frmOption: 1, token: 'token' },
      body: form119e,
    });
    expect(mock.last().request.responseType).toBe('binary');
    const form20e = {
      idcode: '0500113014256',
      deliveredStates: [{ stateDeliveredType: 'storage' as const, properties: { ReasonStorage: 'EXPIRY' as const } }],
    };
    await client.letters.getForm20e(form20e, 0);
    expect(mock.last()).toMatchObject({
      path: '/forms/ecom/0.0.1/letters/domestic/form20e',
      query: { frmOption: 0 },
      body: form20e,
    });
    await client.labels.getForm119e(form119e, 1);
    expect(mock.last()).toMatchObject({ method: 'POST', path: '/forms/ecom/0.0.1/shipments/form119e' });
    await client.labels.getForm20e(form20e, 1);
    expect(mock.last()).toMatchObject({ method: 'POST', path: '/forms/ecom/0.0.1/shipments/form20e' });
  });

  it('pays letters with an electronic stamp', async () => {
    const { mock, client } = setup();
    await client.payments.pay({ amount: 21.5, edrpou: '3329515568', clientUuid: 'c', barcodes: ['R1', 'R2'] });
    expect(mock.last()).toMatchObject({
      method: 'POST',
      path: '/ecom/0.0.1/payments/payments-bank-account/payment',
      body: { amount: 21.5, edrpou: '3329515568', clientUuid: 'c', barcodes: ['R1', 'R2'] },
    });
    await client.payments.payLetterGroup({ letterGroupUuid: 'G1' });
    expect(mock.last()).toMatchObject({
      path: '/ecom/0.0.1/payments/payments-bank-account/by-letter-group',
      body: { letterGroupUuid: 'G1' },
    });
  });

  it('manages a letter after it is created', async () => {
    const { mock, client } = setup();
    await client.letters.createInGroupAsync('G1', [{ weight: 1000 }]);
    expect(mock.last()).toMatchObject({ method: 'POST', path: '/ecom/0.0.1/letters/domestic/groups/G1/letters/async' });
    await client.letters.forward('L1', 77);
    expect(mock.last()).toMatchObject({ method: 'PUT', path: '/ecom/0.0.1/letters/domestic/L1/forward/77' });
    await client.letters.setReturnAfterStorageDays('L1', 14);
    expect(mock.last().path).toBe('/ecom/0.0.1/letters/domestic/L1/return-after-storage-days/14');
    await client.letters.setSms('L1', true);
    expect(mock.last().path).toBe('/ecom/0.0.1/letters/domestic/L1/sms/true');
    await client.letters.changeRecipient('L1', 'C2');
    expect(mock.last().path).toBe('/ecom/0.0.1/letters/domestic/management/L1/recipient/C2');
    await client.letters.getForm107('L1');
    expect(mock.last().path).toBe('/forms/ecom/0.0.1/letters/domestic/L1/form107');
  });

  it('fetches signed delivery notifications as an archive or as JSON', async () => {
    const { mock, client } = setup();
    await client.deliveryNotifications.getSignedNotifications('C1', { dateFrom: '2026-09-06', dateTo: '2026-10-06' });
    expect(mock.last()).toMatchObject({
      method: 'POST',
      path: '/ecom/0.0.1/signed-notifications/C1/batch',
      body: { dateFrom: '2026-09-06', dateTo: '2026-10-06' },
    });
    expect(mock.last().request.responseType).toBe('binary');
    await client.deliveryNotifications.getSignedNotifications('C1', {
      dateFrom: '2026-07-08',
      dateTo: '2026-10-06',
      barcodes: ['7780900000120'],
      dispatchType: 'LETTER',
      responseType: 'JSON',
    });
    expect(mock.last().request.responseType).toBeUndefined();
  });
});

describe('eCom operations only the current documentation lists', () => {
  it('reads bonus shipments by type', async () => {
    const { mock, client } = setup();
    await client.clients.getFreeShipments('C1', 'LOYALTY_PROGRAM');
    expect(mock.last().path).toBe('/ecom/0.0.1/clients/C1/free-shipments/LOYALTY_PROGRAM');
  });

  it('creates delivery notifications for a list of barcodes and reads the parent shipment', async () => {
    const { mock, client } = setup();
    await client.deliveryNotifications.createForShipments(['5011800000440', '5011800000475']);
    expect(mock.last()).toMatchObject({
      method: 'POST',
      path: '/ecom/0.0.1/shipments/delivery-notification',
      body: ['5011800000440', '5011800000475'],
    });
    await client.deliveryNotifications.getParent('N1');
    expect(mock.last().path).toBe('/ecom/0.0.1/delivery-notifications/N1/parent');
    await client.deliveryNotifications.getGroupDeliveryNotificationJson('G1');
    expect(mock.last().path).toBe('/ecom/0.0.1/shipment-groups/G1/document-delivery-notification/json');
  });

  it('prints the stickers of documents back and form 107', async () => {
    const { mock, client } = setup();
    const forms = '/forms/ecom/0.0.1';
    await client.labels.getDocumentBackSticker('D1');
    expect(mock.last().path).toBe(`${forms}/document-back/D1/sticker`);
    await client.labels.getDocumentBackStickerByShipment('S1');
    expect(mock.last().path).toBe(`${forms}/document-back/by/shipment/S1/sticker`);
    await client.labels.getGroupDocumentBackStickers('G1');
    expect(mock.last().path).toBe(`${forms}/shipment-groups/G1/document-back/sticker`);
    await client.labels.getWithDocumentBackSticker('S1');
    expect(mock.last().path).toBe(`${forms}/shipments/S1/with-document-back/sticker`);
    await client.labels.getWithShipmentSticker('D1');
    expect(mock.last().path).toBe(`${forms}/document-back/D1/with-shipment/sticker`);
    await client.labels.getGroupWithDocumentBackStickers('G1');
    expect(mock.last().path).toBe(`${forms}/shipment-groups/G1/shipment-with-document-back/sticker`);
    await client.labels.getForm107('S1');
    expect(mock.last().path).toBe(`${forms}/shipments/S1/form107`);
    await client.labels.getGroupForm107('G1');
    expect(mock.last().path).toBe(`${forms}/shipment-groups/G1/form107`);
    await client.labels.getNotificationForm119('N1');
    expect(mock.last().path).toBe(`${forms}/shipments/delivery-notifications/N1/form119`);
  });

  it('forwards a shipment with PUT (section 4.11.4)', async () => {
    const { mock, client } = setup();
    await client.management.forward('S1', { recipient: { uuid: 'C2' }, deliveryType: 'W2W' });
    expect(mock.last()).toMatchObject({
      method: 'PUT',
      path: '/ecom/0.0.1/shipments/management/S1/forward',
      body: { recipient: { uuid: 'C2' }, deliveryType: 'W2W' },
    });
  });

  it('creates a registered letter (type VALUABLE_LETTER, section 4.12)', async () => {
    const { mock, client } = setup();
    await client.shipments.create({
      type: 'VALUABLE_LETTER',
      sender: { uuid: 's' },
      recipient: { uuid: 'r' },
      deliveryType: 'W2W',
      listOfEnclosedItems: true,
      parcels: [{ weight: 500, length: 30 }],
    });
    await client.shipmentGroups.create({ name: 'Letters', type: 'VALUABLE_LETTER' });
    expect(mock.last().body).toEqual({ name: 'Letters', type: 'VALUABLE_LETTER' });
  });
});
