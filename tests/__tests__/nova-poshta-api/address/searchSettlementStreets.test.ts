import { spec } from 'pactum';

describe('AddressService - searchSettlementStreets', () => {
  it('should search streets in a settlement', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Address',
        calledMethod: 'searchSettlementStreets',
        methodProperties: {
          StreetName: 'Хрещатик',
          SettlementRef: '8d5a980d-391c-11dd-90d9-001a92567626', // Kyiv
          Limit: '10',
        },
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .inspect()
      .toss();
  });

  it('should search streets by partial name', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Address',
        calledMethod: 'searchSettlementStreets',
        methodProperties: {
          StreetName: 'вул',
          SettlementRef: '8d5a980d-391c-11dd-90d9-001a92567626',
          Limit: '20',
        },
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .inspect()
      .toss();
  });

  it('should search streets in different city', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Address',
        calledMethod: 'searchSettlementStreets',
        methodProperties: {
          StreetName: 'Гоголя',
          SettlementRef: 'db5c88e0-391c-11dd-90d9-001a92567626', // Dnipro
          Limit: '10',
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
