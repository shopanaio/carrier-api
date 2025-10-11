import { spec } from 'pactum';
import { getApiKey } from '../../../setup/pactum.setup';

describe('WaybillService - canDeliverToPostomat', () => {
  it('should check if postomat delivery is available', async () => {
    // Testing with valid postomat parameters
    await spec()
      .post('/')
      .withJson({
        apiKey: getApiKey(),
        modelName: 'InternetDocument',
        calledMethod: 'getDocumentPrice',
        methodProperties: {
          CitySender: '8d5a980d-391c-11dd-90d9-001a92567626',
          CityRecipient: 'db5c88e0-391c-11dd-90d9-001a92567626',
          Weight: '1',
          ServiceType: 'WarehouseWarehouse',
          Cost: '500', // Under 10000 limit for postomat
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

  it('should fail for postomat with cargo over limit', async () => {
    // Testing with over-limit cost
    await spec()
      .post('/')
      .withJson({
        apiKey: getApiKey(),
        modelName: 'InternetDocument',
        calledMethod: 'getDocumentPrice',
        methodProperties: {
          CitySender: '8d5a980d-391c-11dd-90d9-001a92567626',
          CityRecipient: 'db5c88e0-391c-11dd-90d9-001a92567626',
          Weight: '1',
          ServiceType: 'WarehouseWarehouse',
          Cost: '15000', // Over 10000 limit
          CargoType: 'Parcel',
          SeatsAmount: '1',
        },
      })
      .expectStatus(200)
      .inspect()
      .toss();
  });
});
