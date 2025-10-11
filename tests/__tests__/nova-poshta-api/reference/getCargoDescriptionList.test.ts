import { spec } from 'pactum';

describe('ReferenceService - getCargoDescriptionList', () => {
  it('should get list of cargo descriptions', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Common',
        calledMethod: 'getCargoDescriptionList',
        methodProperties: {},
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .inspect()
      .toss();
  });

  it('should search cargo descriptions', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Common',
        calledMethod: 'getCargoDescriptionList',
        methodProperties: {
          FindByString: 'одяг',
        },
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .inspect()
      .toss();
  });

  it('should get cargo descriptions with pagination', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Common',
        calledMethod: 'getCargoDescriptionList',
        methodProperties: {
          Page: '1',
          Limit: '50',
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
