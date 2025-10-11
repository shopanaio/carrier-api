import { spec } from 'pactum';
import { getApiKey } from '../../../setup/pactum.setup';

describe('WaybillService - create', () => {
  it('should create a standard waybill', async () => {
    await spec()
      .post('/')
      .withJson({
        apiKey: getApiKey(),
        modelName: 'InternetDocument',
        calledMethod: 'save',
        methodProperties: {
          PayerType: 'Sender',
          PaymentMethod: 'Cash',
          DateTime: '25.12.2024',
          CargoType: 'Parcel',
          Weight: '1',
          ServiceType: 'WarehouseWarehouse',
          SeatsAmount: '1',
          Description: 'Test package',
          Cost: '1000',
          CitySender: '8d5a980d-391c-11dd-90d9-001a92567626', // Kyiv
          Sender: '8d5a980d-391c-11dd-90d9-001a92567626',
          SenderAddress: '8d5a980d-391c-11dd-90d9-001a92567626',
          ContactSender: '8d5a980d-391c-11dd-90d9-001a92567626',
          SendersPhone: '380501234567',
          CityRecipient: '8d5a980d-391c-11dd-90d9-001a92567626',
          Recipient: '8d5a980d-391c-11dd-90d9-001a92567626',
          RecipientAddress: '8d5a980d-391c-11dd-90d9-001a92567626',
          ContactRecipient: '8d5a980d-391c-11dd-90d9-001a92567626',
          RecipientsPhone: '380507654321',
        },
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .inspect()
      .toss();
  });

  it('should fail with invalid data', async () => {
    await spec()
      .post('/')
      .withJson({
        apiKey: getApiKey(),
        modelName: 'InternetDocument',
        calledMethod: 'save',
        methodProperties: {
          // Missing required fields
        },
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: false,
      })
      .toss();
  });
});
