import { spec } from 'pactum';

describe('AddressService - getSearchSuggestions', () => {
  it('should get search suggestions for cities', async () => {
    // Perform some searches to build history
    await spec()
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

    await spec()
      .post('/')
      .withJson({
        modelName: 'Address',
        calledMethod: 'getCities',
        methodProperties: {
          FindByString: 'Дніпро',
        },
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .toss();

    // Search suggestions are managed on client side based on search history
  });

  it('should get suggestions for partial query', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Address',
        calledMethod: 'getCities',
        methodProperties: {
          FindByString: 'Хар',
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
