import { spec } from 'pactum';

describe('AddressService - searchCitiesBatch', () => {
  it('should search multiple cities in batch', async () => {
    // First city
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

    // Second city
    const response2 = await spec()
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

    // Third city
    const response3 = await spec()
      .post('/')
      .withJson({
        modelName: 'Address',
        calledMethod: 'getCities',
        methodProperties: {
          FindByString: 'Одеса',
        },
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .toss();

    expect(response1).toBeDefined();
    expect(response2).toBeDefined();
    expect(response3).toBeDefined();
  });

  it('should handle parallel city searches', async () => {
    const cities = ['Львів', 'Харків', 'Запоріжжя'];

    const promises = cities.map(city =>
      spec()
        .post('/')
        .withJson({
          modelName: 'Address',
          calledMethod: 'getCities',
          methodProperties: {
            FindByString: city,
          },
        })
        .expectStatus(200)
        .toss()
    );

    const results = await Promise.all(promises);
    expect(results).toHaveLength(3);
  });
});
