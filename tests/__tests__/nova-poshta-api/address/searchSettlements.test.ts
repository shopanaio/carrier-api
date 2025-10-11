import { spec } from 'pactum';

describe('AddressService - searchSettlements', () => {
  it('should search settlements online', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Address',
        calledMethod: 'searchSettlements',
        methodProperties: {
          CityName: 'Київ',
          Limit: '5',
        },
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .inspect()
      .toss();
  });

  it('should search settlements with pagination', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Address',
        calledMethod: 'searchSettlements',
        methodProperties: {
          CityName: 'Дніпр',
          Page: '1',
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

  it('should search settlements by partial name', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Address',
        calledMethod: 'searchSettlements',
        methodProperties: {
          CityName: 'Хар',
          Page: '1',
          Limit: '15',
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
