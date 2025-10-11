import { spec } from 'pactum';

describe('ReferenceService - getPickupTimeIntervals', () => {
  it('should get available time intervals for pickup', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Common',
        calledMethod: 'getTimeIntervals',
        methodProperties: {
          RecipientCityRef: '8d5a980d-391c-11dd-90d9-001a92567626',
          DateTime: '25.12.2024',
        },
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .inspect()
      .toss();
  });

  it('should get pickup intervals for warehouse', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Common',
        calledMethod: 'getTimeIntervals',
        methodProperties: {
          RecipientCityRef: '8d5a980d-391c-11dd-90d9-001a92567626',
          DateTime: '25.12.2024',
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
