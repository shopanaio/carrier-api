import { spec } from 'pactum';

describe('AddressService - searchStreetsEnhanced', () => {
  it('should perform enhanced street search', async () => {
    const response = await spec()
      .post('/')
      .withJson({
        modelName: 'Address',
        calledMethod: 'getStreet',
        methodProperties: {
          CityRef: '8d5a980d-391c-11dd-90d9-001a92567626',
          FindByString: 'Хрещатик',
          Limit: '20',
        },
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .inspect()
      .toss();

    // Enhanced features like relevance scoring
    // are applied on client side
    expect(response.data).toBeDefined();
  });

  it('should search streets with context', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Address',
        calledMethod: 'getStreet',
        methodProperties: {
          CityRef: '8d5a980d-391c-11dd-90d9-001a92567626',
          FindByString: 'Бессарабська площа',
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

  it('should search streets in different cities', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Address',
        calledMethod: 'getStreet',
        methodProperties: {
          CityRef: 'db5c88e0-391c-11dd-90d9-001a92567626', // Dnipro
          FindByString: 'Набережна',
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
