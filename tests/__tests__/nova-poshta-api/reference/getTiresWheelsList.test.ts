import { spec } from 'pactum';

describe('ReferenceService - getTiresWheelsList', () => {
  it('should get list of tires and wheels types', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Common',
        calledMethod: 'getTiresWheelsList',
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
