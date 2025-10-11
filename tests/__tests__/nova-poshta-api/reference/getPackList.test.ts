import { spec } from 'pactum';

describe('ReferenceService - getPackList', () => {
  it('should get list of packaging types', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Common',
        calledMethod: 'getPackList',
        methodProperties: {},
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .inspect()
      .toss();
  });

  it('should get pack list with dimensions filter', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Common',
        calledMethod: 'getPackList',
        methodProperties: {
          Length: '100',
          Width: '50',
          Height: '30',
        },
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .inspect()
      .toss();
  });
});
