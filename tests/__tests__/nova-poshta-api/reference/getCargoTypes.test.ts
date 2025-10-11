import { spec } from 'pactum';

describe('ReferenceService - getCargoTypes', () => {
  it('should get list of cargo types', async () => {
    await spec()
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
      .expectJsonSchema({
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'array' },
        },
      })
      .inspect()
      .toss();
  });

  it('should return cargo types with descriptions', async () => {
    const response = await spec()
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

    expect(response.data).toBeDefined();
  });
});
