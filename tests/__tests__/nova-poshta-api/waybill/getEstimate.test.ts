import { spec } from 'pactum';
import { getApiKey } from '../../../setup/pactum.setup';

describe('WaybillService - getEstimate', () => {
  it('should get both price and delivery date estimation', async () => {
    // Get price
    const priceResponse = await spec()
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

    // Get delivery date
    const dateResponse = await spec()
      .post('/')
      .withJson({
        apiKey: getApiKey(),
        modelName: 'InternetDocument',
        calledMethod: 'getDocumentDeliveryDate',
        methodProperties: {
          CitySender: '8d5a980d-391c-11dd-90d9-001a92567626',
          CityRecipient: 'db5c88e0-391c-11dd-90d9-001a92567626',
          ServiceType: 'WarehouseWarehouse',
        },
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .inspect()
      .toss();

    expect(priceResponse).toBeDefined();
    expect(dateResponse).toBeDefined();
  });
});
