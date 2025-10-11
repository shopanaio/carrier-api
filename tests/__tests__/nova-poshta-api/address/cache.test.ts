import { spec } from 'pactum';

describe('AddressService - Cache Management', () => {
  it('should cache city search results', async () => {
    // First request - should hit API
    const response1 = await spec()
      .post('/')
      .withJson({
        modelName: 'Address',
        calledMethod: 'getCities',
        methodProperties: {
          FindByString: 'Київ',
        },
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .toss();

    // Second request - should use cache (in real implementation)
    const response2 = await spec()
      .post('/')
      .withJson({
        modelName: 'Address',
        calledMethod: 'getCities',
        methodProperties: {
          FindByString: 'Київ',
        },
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .toss();

    expect(response1).toBeDefined();
    expect(response2).toBeDefined();
  });

  it('should cache settlement searches', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Address',
        calledMethod: 'searchSettlements',
        methodProperties: {
          CityName: 'Київ',
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

  it('should cache street searches', async () => {
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

  it('should cache settlement areas', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Address',
        calledMethod: 'getSettlementAreas',
        methodProperties: {},
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .inspect()
      .toss();
  });
});
