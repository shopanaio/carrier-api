import { spec } from 'pactum';

describe('ReferenceService - getBackwardDeliveryCargoTypes', () => {
  it('should get list of backward delivery cargo types', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Common',
        calledMethod: 'getBackwardDeliveryCargoTypes',
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
