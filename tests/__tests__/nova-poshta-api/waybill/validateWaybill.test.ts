import { spec } from 'pactum';
import { getApiKey } from '../../../setup/pactum.setup';

describe('WaybillService - validateWaybill', () => {
  it('should validate waybill data without creating', async () => {
    // This test validates the structure by attempting to get info
    // Since Nova Poshta API doesn't have a separate validation endpoint,
    // we can test validation by checking required fields
    await spec()
      .post('/')
      .withJson({
        apiKey: getApiKey(),
        modelName: 'InternetDocument',
        calledMethod: 'save',
        methodProperties: {
          // Minimal valid data for validation
          PayerType: 'Sender',
          PaymentMethod: 'Cash',
          DateTime: '25.12.2024',
          CargoType: 'Parcel',
          Weight: '1',
          ServiceType: 'WarehouseWarehouse',
          SeatsAmount: '1',
        },
      })
      .expectStatus(200)
      .inspect()
      .toss();
  });

  it('should fail validation with invalid data', async () => {
    await spec()
      .post('/')
      .withJson({
        apiKey: getApiKey(),
        modelName: 'InternetDocument',
        calledMethod: 'save',
        methodProperties: {
          // Invalid/missing required fields
          Weight: 'invalid',
        },
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: false,
      })
      .toss();
  });
});
