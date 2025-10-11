import { spec } from 'pactum';
import { getApiKey } from '../../../setup/pactum.setup';

describe('WaybillService - getDeliveryDate', () => {
  it('should calculate delivery date', async () => {
    await spec()
      .post('/')
      .withJson({
        apiKey: getApiKey(),
        modelName: 'InternetDocument',
        calledMethod: 'getDocumentDeliveryDate',
        methodProperties: {
          CitySender: '8d5a980d-391c-11dd-90d9-001a92567626', // Kyiv
          CityRecipient: 'db5c88e0-391c-11dd-90d9-001a92567626', // Dnipro
          ServiceType: 'WarehouseWarehouse',
        },
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .inspect()
      .toss();
  });
});
