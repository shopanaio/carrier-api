import { spec } from 'pactum';

describe('ReferenceService - getMessageCodeText', () => {
  it('should get list of error codes and descriptions', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Common',
        calledMethod: 'getMessageCodeText',
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
