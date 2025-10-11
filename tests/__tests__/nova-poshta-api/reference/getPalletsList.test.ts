import { spec } from 'pactum';

describe('ReferenceService - getPalletsList', () => {
  it('should get list of available pallets', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Common',
        calledMethod: 'getPalletsList',
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
