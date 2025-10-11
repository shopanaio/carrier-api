import { spec } from 'pactum';
import { getApiKey } from '../../../setup/pactum.setup';

describe('WaybillService - getPrice', () => {
  it('should calculate delivery price', async () => {
    await spec()
      .post('/')
      .withJson({
        apiKey: getApiKey(),
        modelName: 'InternetDocument',
        calledMethod: 'getDocumentPrice',
        methodProperties: {
          CitySender: '8d5a980d-391c-11dd-90d9-001a92567626', // Kyiv
          CityRecipient: 'db5c88e0-391c-11dd-90d9-001a92567626', // Dnipro
          Weight: '1',
          ServiceType: 'WarehouseWarehouse',
          Cost: '1000',
          CargoType: 'Parcel',
          SeatsAmount: '1',
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
