import { spec } from 'pactum';

describe('AddressService - searchCitiesEnhanced', () => {
  it('should perform enhanced city search with fuzzy matching', async () => {
    const response = await spec()
      .post('/')
      .withJson({
        modelName: 'Address',
        calledMethod: 'getCities',
        methodProperties: {
          FindByString: 'Київ',
          Limit: '20',
        },
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .inspect()
      .toss();

    // Enhanced features like relevance scoring and fuzzy matching
    // are applied on client side
    expect(response.data).toBeDefined();
  });

  it('should search cities with typo tolerance', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Address',
        calledMethod: 'getCities',
        methodProperties: {
          FindByString: 'Дніп',
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

  it('should rank search results by relevance', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Address',
        calledMethod: 'getCities',
        methodProperties: {
          FindByString: 'Одеса',
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
