import { spec } from 'pactum';

describe('ReferenceService - getOwnershipFormsList', () => {
  it('should get list of ownership forms', async () => {
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
