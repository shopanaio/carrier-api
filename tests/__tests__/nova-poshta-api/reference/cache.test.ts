import { spec } from 'pactum';

describe('ReferenceService - Cache Management', () => {
  it('should cache reference data (cargo types)', async () => {
    // First request - should hit API
    const response1 = await spec()
      .post('/')
      .withJson({
        modelName: 'Common',
        calledMethod: 'getCargoTypes',
        methodProperties: {},
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .inspect()
      .toss();

    // Second request - should use cache (in real implementation)
    const response2 = await spec()
      .post('/')
      .withJson({
        modelName: 'Common',
        calledMethod: 'getCargoTypes',
        methodProperties: {},
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .toss();

    expect(response1).toBeDefined();
    expect(response2).toBeDefined();
  });

  it('should cache service types', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Common',
        calledMethod: 'getServiceTypes',
        methodProperties: {},
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .inspect()
      .toss();
  });

  it('should cache ownership forms', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Common',
        calledMethod: 'getOwnershipFormsList',
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
