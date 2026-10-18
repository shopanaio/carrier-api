// Field-by-field pins: bodies copied from the official documentation (eCom 02.09.2026, letters 07.10.2026,
// international 16.10.2026) are assigned to the library types, so a field the types lack fails `tsc -p
// tsconfig.tests.json` (excess property check), and sent or returned through the client unchanged.
import { createUkrposhtaContractClient } from '../src';
import type {
  Client,
  DeliveryPriceRequest,
  LetterInGroupCreation,
  PostPayDivideShare,
  ProhibitedPhone,
  ReturnOrderRequest,
  Shipment,
  UkrposhtaErrorResponse,
} from '../src';
import type {
  DocumentBackDto,
  LetterDto,
  LetterGroup,
  LetterStickerPdf,
  Form119Pdf,
  MessageAnswer,
} from '../src/contract/generated/types';
import { createMockTransport, ok } from './helpers/mock';

function setup(answer: unknown = {}) {
  const mock = createMockTransport([
    { method: 'GET', path: '*', respond: ok(answer) },
    { method: 'POST', path: '*', respond: ok(answer) },
    { method: 'PUT', path: '*', respond: ok(answer) },
    { method: 'DELETE', path: '*', respond: ok(answer) },
  ]);
  const client = createUkrposhtaContractClient({
    transport: mock.transport,
    bearer: 'bearer',
    counterpartyToken: 'token',
    retry: false,
  });
  return { mock, client };
}

const clientExample: Client = {
  uuid: '3d5e7a3a-1d3f-4e0c-8b5a-0d7a6f2c9b11',
  name: 'Ivan Ivanov',
  firstName: 'Ivan',
  middleName: 'Ivanovich',
  lastName: 'Ivanov',
  latinName: 'Ivan Ivanov',
  postId: null,
  externalId: null,
  uniqueRegistrationNumber: null,
  counterpartyUuid: '28072997-11c1-41e8-ab48-438996808e8f',
  addressId: 7594528,
  addresses: [],
  phoneNumber: '+380671231234',
  phones: [
    { uuid: 'a31d461b', phoneId: 24645, phoneNumber: '+380671231234', type: 'PERSONAL', main: true, confirmed: false },
  ],
  email: 'ivan@example.com',
  emails: [{ uuid: 'cd043c5f', email: 'ivan@example.com', main: true }],
  bankAccount: 'UA163220010000026008310039274',
  tin: '3289500378',
  postPayPaymentType: 'POSTPAY_PAYMENT_CASH_ONLY',
  type: 'PRIVATE_ENTREPRENEUR',
  accountType: { type: 'CORPORATE', assignmentDate: '2021-03-01' },
  crmUuid: null,
  counterpartyDogId: null,
  clientDogId: null,
  contactPersonName: null,
  resident: true,
  GDPRRead: false,
  GDPRAccept: false,
  personalDataApproved: false,
  checkOnDeliveryAllowed: true,
  freeStorageAvailable: false,
  returnDaysSettingAvailable: false,
};

describe('clients', () => {
  it('returns every documented client field untouched', async () => {
    const { client } = setup(clientExample);
    expect(await client.clients.get('3d5e7a3a')).toEqual(clientExample);
  });

  it('sends nameEn of the documented update example', async () => {
    const { mock, client } = setup(clientExample);
    await client.clients.update('3d5e7a3a', { nameEn: 'Vema123 LTD', phoneNumber: '0671231235' });
    expect(mock.last().body).toEqual({ nameEn: 'Vema123 LTD', phoneNumber: '0671231235' });
  });

  it('returns both prohibited-phone shapes', async () => {
    const worldwide: ProhibitedPhone = { phone: '1234567', fromDate: '2018-12-05', worldwide: true };
    const { client } = setup(worldwide);
    expect(await client.clients.getProhibitedPhone('1234567')).toEqual(worldwide);
  });
});

describe('shipments', () => {
  const shipmentExample: Shipment = {
    uuid: 'f26d4ff3',
    type: 'STANDARD',
    sender: clientExample,
    recipient: clientExample,
    senderAddressId: 1,
    recipientAddressId: 2,
    returnAddressId: 1,
    shipmentGroupUuid: null,
    externalId: null,
    deliveryType: 'W2W',
    onFailReceiveType: 'RETURN',
    barcode: '0500000145397',
    weight: 1200,
    length: 20,
    declaredPrice: 500,
    deliveryPrice: 80,
    postPay: null,
    discounts: [],
    lastModified: '2025-09-24T23:14:58',
    description: null,
    parcels: [],
    lifecycle: { status: 'CREATED', statusDate: '2025-09-24T23:14:58' },
    paidByRecipient: false,
    ownerId: '4dc05cc2-6d45-4309-b6e3-f06bd6248abd',
    isAutomated: true,
    placeNumberAsep: '01930',
    deleted: false,
    freeStorage: false,
    administrativeService: false,
    packageType: 'EMS',
    internationalData: {},
    currencyCode: 'USD',
  };

  it('returns the owner, international and AS EP fields', async () => {
    const { client } = setup(shipmentExample);
    expect(await client.shipments.get('f26d4ff3')).toEqual(shipmentExample);
  });

  it('returns the shares of a divided cash on delivery with the recipient details', async () => {
    const shares: PostPayDivideShare[] = [
      {
        uuid: 'a25fd053',
        recipient: {
          uuid: 'beaff1a9',
          name: 'FOP Petrenko',
          type: 'PRIVATE_ENTREPRENEUR',
          counterpartyUuid: '28072997',
          postPayPaymentType: 'POSTPAY_PAYMENT_CASH_AND_CASHLESS',
          bankAccount: 'UA433052991260041053420040000',
          tin: '4201030327',
          personalDataApproved: true,
        },
        dividedSum: 1400,
        created: '2020-11-11T10:52:47',
        postPayDeliveryDividePrice: 14,
      },
      {
        uuid: 'eeec35a7',
        recipient: {
          uuid: '3a9ef481',
          name: 'FOP Ivanenko',
          type: 'COMPANY',
          counterpartyUuid: '28072997',
          postPayPaymentType: 'POSTPAY_PAYMENT_CASHLESS_ONLY',
          edrpou: '20053145',
          bankAccount: 'UA433052991260041053420040000',
          personalDataApproved: true,
        },
        dividedSum: 100,
        created: '2020-11-11T10:52:47',
        postPayDeliveryDividePrice: 5,
      },
    ];
    const { client } = setup(shares);
    expect(await client.shipments.getPostPayDivide('0500000145397')).toEqual(shares);
  });

  it('sends the return order with the sender token of the example', async () => {
    const { mock, client } = setup({ response: { orders: [] }, status: { code: 0 } });
    const request: ReturnOrderRequest = {
      barcode: '0500000145397',
      senderToken: '{ProdCounterPartyToken}',
      returnAddressId: '7656280',
    };
    await client.management.createReturnOrder(request);
    expect(mock.last().body).toEqual(request);
  });
});

describe('delivery price', () => {
  it('sends every field of the documented request', async () => {
    const request: DeliveryPriceRequest = {
      validate: true,
      addressFrom: { postcode: '04071', conglomerationPostcode: null },
      addressTo: { postcode: '47743', conglomerationPostcode: null },
      type: 'EXPRESS',
      deliveryType: 'W2W',
      weight: 3000,
      length: 35,
      width: 20,
      height: 20,
      documentBackDeliveryType: 'D2W',
      returnDeliveryPrice: 15,
      declaredPrice: 150,
      postPay: 150,
      transferPostPayToCard: false,
      declaredPriceSurcharge: 0,
      discounts: [{ description: 'Discount 20%', rate: 20 }],
      tariffToken: null,
      surchargeTariffToken: null,
      lengthOverpayRatio: null,
      returnDeliveryPriceRatio: null,
      returnDeliveryPriceValue: null,
      ascentToTheFloor: false,
      lift: false,
      floor: 0,
      recalculation: false,
      w2wVariation: 'COUNTRY',
      isMobilePostOfficeDelivery: null,
      measurablesTotalWeight: 3000,
      measurablesMaxLength: 35,
      measurablesMaxWidth: 20,
      measurablesMaxHeight: 20,
      volume: 14000,
      specialTariff: false,
      sms: true,
      documentBack: true,
      withDeliveryNotification: false,
      withEmailDeliveryNotification: false,
      listOfEnclosedItems: false,
    };
    const { mock, client } = setup({});
    await client.pricing.calculate(request);
    expect(mock.last().body).toEqual(request);
  });
});

describe('document back', () => {
  it('sends height and width of the example', async () => {
    const body: DocumentBackDto = {
      recipientAddressId: 1384286,
      deliveryType: 'W2W',
      weight: 250,
      length: 40,
      height: 20,
      width: 20,
    };
    const { mock, client } = setup({});
    await client.documentBack.createDocumentBackForShipment({ uuidOrBarcode: 'x', body });
    expect(mock.last().body).toEqual(body);
  });
});

describe('letters', () => {
  const letter: LetterDto = {
    uuid: '5ca83f36',
    barcode: '5007300000226',
    description: 'Letter description',
    properties: { postIndexBlocked: 'false' },
    deliveryDate: '2025-10-26T14:40:00',
    deliveryDateDescription: 'Delivery date is not relevant',
    forwardingPrice: 0,
    subpoena: false,
    withDeliveryNotification: true,
    withEmailNotification: false,
    personalHanding: true,
    sms: true,
    paidByDigitalStamp: false,
    paymentType: 'DIGITAL_POSTAGE_STAMP',
    deleted: false,
  };

  it('creates a letter with a digital stamp and the properties object', async () => {
    const { mock, client } = setup(letter);
    expect(await client.letters.createLetter({ body: letter })).toEqual(letter);
    expect(mock.last().body).toEqual(letter);
  });

  it('sends the body of a letter created in a group, single and as an array', async () => {
    const { mock, client } = setup(letter);
    await client.letters.createLetterAndAddToLetterGroup('group', letter);
    expect(mock.last()).toMatchObject({ method: 'POST', body: letter });
    await client.letters.createLetterAndAddToLetterGroup('group', [letter, letter]);
    expect(mock.last().body).toEqual([letter, letter]);
  });

  it('returns the per-letter result of the asynchronous creation', async () => {
    const results: LetterInGroupCreation[] = [
      { letter, result: { status: 'SUCCESS', details: 'Letter 5ca83f36 successfully created and assigned' } },
      { letter, result: { status: 'FAILURE', details: 'Sender is not set' } },
    ];
    const { client } = setup(results);
    expect(await client.letters.createInGroupAsync('group', [letter, letter])).toEqual(results);
  });

  it('returns the message answers of delete, add and remove', async () => {
    const answer: MessageAnswer = { message: 'Letter 0300300000014 has been deleted' };
    const { client } = setup(answer);
    expect(await client.letters.removeLetter({ uuidOrBarcode: 'x' })).toEqual(answer);
    expect(await client.letters.addLetterToLetterGroup({ letterGroupUuid: 'g', letterUuidOrBarcode: 'x' })).toEqual(
      answer,
    );
    expect(await client.letters.removeLetterFromLetterGroup({ letterUuidOrBarcode: 'x' })).toEqual(answer);
  });

  it('returns the documented letter group', async () => {
    const group: LetterGroup = {
      uuid: 'b9889599',
      name: 'PostagePaidImprintNotRecommendedGroup',
      paymentType: 'POSTAGE_STAMP',
      senderUuid: 'a2d8e502',
      letterContractUuid: 'cbf1c74e',
      closed: false,
      valuable: false,
      submissionDate: '2019-12-25',
      recommended: true,
    };
    const { client } = setup(group);
    expect(await client.letters.getLetterGroup({ uuid: 'b9889599' })).toEqual(group);
  });

  it('returns the JSON stickers with the sms and recommended fields', async () => {
    const sticker: LetterStickerPdf = { barcode: '5000400000032', sms: false, priority: 'priority' };
    const form: Form119Pdf = { barcode: '5000400000067', parentBarcode: '5000400000059', recommended: true };
    const first = setup(sticker);
    expect(await first.client.letters.getJsonStickerLetter({ uuidOrBarcode: 'x' })).toEqual(sticker);
    const second = setup(form);
    expect(await second.client.letters.getJsonStickerWithForm119ByLetter({ uuidOrBarcode: 'x' })).toEqual(form);
  });

  it('prints the envelope of a digital stamp with the documented query', async () => {
    const { mock, client } = setup('pdf');
    await client.letters.getEnvelopeWithDigitalStamp('letter', { size: 'LETTER_110_X_220', frmOption: 0 });
    expect(mock.last()).toMatchObject({
      method: 'GET',
      path: '/forms/ecom/0.0.1/letters/domestic/letter/e-stamp',
      query: { token: 'token', size: 'LETTER_110_X_220', frmOption: 0 },
    });
  });
});

describe('barcodes', () => {
  it('leaves the size of the list to the service', async () => {
    const { mock, client } = setup([]);
    await client.barcodes.getMany(Array.from({ length: 101 }, (_, i) => `B${i}`));
    expect(mock.calls).toHaveLength(1);
  });
});

describe('error body', () => {
  it('has the documented validationProblems', () => {
    const body: UkrposhtaErrorResponse = {
      code: 'UPE10002',
      message: 'Failed to validate parcel item descriptions with customs provider.: [...]',
      validationProblems: [
        {
          description: 'Shirt',
          status: 'INCOMPLETE',
          clarifications: ['Specify gender of the shirt', 'Specify material composition'],
        },
      ],
    };
    expect(body.validationProblems?.[0].clarifications).toHaveLength(2);
  });
});
