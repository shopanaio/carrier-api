import { spec } from 'pactum';
import { getApiKey } from '../../../setup/pactum.setup';

describe('WaybillService - update', () => {
  it('should update an existing waybill', async () => {
    // Note: You need a valid document ref to update
    const documentRef = 'existing-document-ref';

    await spec()
      .post('/')
      .withJson({
        apiKey: getApiKey(),
        modelName: 'InternetDocument',
        calledMethod: 'update',
        methodProperties: {
          Ref: documentRef,
          PayerType: 'Sender',
          PaymentMethod: 'Cash',
          DateTime: '26.12.2024',
          CargoType: 'Parcel',
          Weight: '2', // Updated weight
          ServiceType: 'WarehouseWarehouse',
          SeatsAmount: '1',
          Description: 'Updated test package',
          Cost: '1500', // Updated cost
        },
      })
      .expectStatus(200)
      .inspect()
      .toss();
  });
});
