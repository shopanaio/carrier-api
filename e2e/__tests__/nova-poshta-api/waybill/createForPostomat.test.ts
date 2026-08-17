import {
  CargoType,
  createClient,
  NovaPoshtaMethod,
  NovaPoshtaModel,
  PayerType,
  PaymentMethod,
  ServiceType,
  WaybillService,
  type ClientContext,
  type CreateWaybillRequest,
  type CreateWaybillToPostomatRequest,
  type NovaPoshtaRequest,
  type NovaPoshtaResponse,
} from '@shopana/novaposhta-api-client';

import { client } from '../../../setup/client.setup';

const postomatRequest: CreateWaybillToPostomatRequest = {
  PayerType: PayerType.Sender,
  PaymentMethod: PaymentMethod.Cash,
  DateTime: '25.12.2024',
  CargoType: CargoType.Parcel,
  Weight: 1,
  ServiceType: ServiceType.WarehousePostomat,
  SeatsAmount: 1,
  Description: 'Test package for Postomat',
  Cost: 500,
  CitySender: 'sender-city-ref',
  Sender: 'sender-ref',
  SenderAddress: 'sender-warehouse-ref',
  ContactSender: 'sender-contact-ref',
  SendersPhone: '380501234567',
  CityRecipient: 'recipient-city-ref',
  Recipient: 'recipient-ref',
  RecipientAddress: 'recipient-postomat-ref',
  ContactRecipient: 'recipient-contact-ref',
  RecipientsPhone: '380507654321',
  OptionsSeat: [
    {
      VolumetricVolume: 0.01,
      VolumetricWidth: 10,
      VolumetricLength: 10,
      VolumetricHeight: 10,
      Weight: 1,
    },
  ],
};

const successfulResponse: NovaPoshtaResponse<readonly [{ Ref: string; IntDocNumber: string }]> = {
  success: true,
  data: [{ Ref: 'document-ref', IntDocNumber: '20400048799000' }],
  errors: [],
  warnings: [],
  info: [],
  messageCodes: [],
  errorCodes: [],
  warningCodes: [],
  infoCodes: [],
};

describe('WaybillService - createToPostomat', () => {
  it('sends an explicit recipient-postomat request through the public client', async () => {
    const { testClient, requests } = createTestClient(successfulResponse);

    const response = await testClient.waybill.createToPostomat(postomatRequest);

    expect(response).toEqual(successfulResponse);
    expect(requests).toEqual([
      {
        modelName: NovaPoshtaModel.InternetDocument,
        calledMethod: NovaPoshtaMethod.Save,
        methodProperties: {
          ...postomatRequest,
          OptionsSeat: [
            {
              volumetricVolume: 0.01,
              volumetricWidth: 10,
              volumetricLength: 10,
              volumetricHeight: 10,
              weight: 1,
            },
          ],
        },
      },
    ]);
  });

  it('preserves both postomat compatibility aliases', async () => {
    const { testClient, requests } = createTestClient(successfulResponse);

    await testClient.waybill.createForPostomat(postomatRequest);
    await testClient.waybill.createPoshtomatExpressWaybill(postomatRequest);

    expect(requests).toHaveLength(2);
    expect(requests[0]?.methodProperties).toEqual(requests[1]?.methodProperties);
    expect(requests[0]?.methodProperties.OptionsSeat).toEqual([
      {
        volumetricVolume: 0.01,
        volumetricWidth: 10,
        volumetricLength: 10,
        volumetricHeight: 10,
        weight: 1,
      },
    ]);
  });

  it('creates a waybill with a sender postomat and normalizes OptionsSeat', async () => {
    const { testClient, requests } = createTestClient(successfulResponse);
    const request: CreateWaybillRequest = {
      ...postomatRequest,
      ServiceType: ServiceType.WarehouseWarehouse,
      SenderAddress: 'sender-postomat-ref',
      RecipientAddress: 'recipient-warehouse-ref',
    };

    const response = await testClient.waybill.create(request);

    expect(response.success).toBe(true);
    expect(requests[0]?.methodProperties).toMatchObject({
      ServiceType: ServiceType.WarehouseWarehouse,
      SenderAddress: 'sender-postomat-ref',
      OptionsSeat: [{ weight: 1, volumetricWidth: 10, volumetricLength: 10, volumetricHeight: 10 }],
    });
  });

  const liveRequestJson = process.env.NP_POSTOMAT_WAYBILL_REQUEST;
  const itWithLiveFixture = process.env.NP_API_KEY && liveRequestJson ? it : it.skip;

  itWithLiveFixture('creates a recipient-postomat waybill against the Nova Poshta API', async () => {
    const liveRequest = JSON.parse(liveRequestJson!) as CreateWaybillToPostomatRequest;

    expect([ServiceType.DoorsPostomat, ServiceType.WarehousePostomat]).toContain(liveRequest.ServiceType);
    const response = await client.waybill.createToPostomat(liveRequest);

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
  });

  const liveSenderRequestJson = process.env.NP_POSTOMAT_SENDER_WAYBILL_REQUEST;
  const itWithLiveSenderFixture = process.env.NP_API_KEY && liveSenderRequestJson ? it : it.skip;

  itWithLiveSenderFixture('creates a sender-postomat waybill against the Nova Poshta API', async () => {
    const liveRequest = JSON.parse(liveSenderRequestJson!) as CreateWaybillRequest;

    expect([ServiceType.WarehouseWarehouse, ServiceType.WarehouseDoors]).toContain(liveRequest.ServiceType);
    const response = await client.waybill.create(liveRequest);

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
  });
});

function createTestClient(response: NovaPoshtaResponse<unknown>) {
  const requests: NovaPoshtaRequest[] = [];
  const transport = (async ({ body }: { body: unknown }) => {
    requests.push(body as NovaPoshtaRequest);
    return { status: 200, data: response };
  }) as ClientContext['transport'];

  const testClient = createClient({
    transport,
    baseUrl: 'https://api.novaposhta.ua/v2.0/json/',
  }).use(new WaybillService());

  return { testClient, requests };
}
