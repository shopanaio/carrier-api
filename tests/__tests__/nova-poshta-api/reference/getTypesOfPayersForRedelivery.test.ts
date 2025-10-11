import { spec } from 'pactum';

describe('ReferenceService - getTypesOfPayersForRedelivery', () => {
  it('should get list of payer types for redelivery', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Common',
        calledMethod: 'getTypesOfPayersForRedelivery',
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
