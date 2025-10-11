import { spec } from 'pactum';

describe('AddressService - getStreet', () => {
  it('should get streets in a city', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Address',
        calledMethod: 'getStreet',
        methodProperties: {
          CityRef: '8d5a980d-391c-11dd-90d9-001a92567626', // Kyiv
        },
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .inspect()
      .toss();
  });

  it('should search streets by name', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Address',
        calledMethod: 'getStreet',
        methodProperties: {
          CityRef: '8d5a980d-391c-11dd-90d9-001a92567626',
          FindByString: 'Хрещатик',
        },
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .inspect()
      .toss();
  });

  it('should search streets with pagination', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Address',
        calledMethod: 'getStreet',
        methodProperties: {
          CityRef: '8d5a980d-391c-11dd-90d9-001a92567626',
          FindByString: 'вул',
          Page: '1',
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
});
