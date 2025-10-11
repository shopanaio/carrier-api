import { spec } from 'pactum';

describe('ReferenceService - getServiceTypes', () => {
  it('should get list of delivery service types', async () => {
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
});
