import { spec } from 'pactum';

describe('ReferenceService - getTimeIntervals', () => {
  it('should get available time intervals for delivery', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Common',
        calledMethod: 'getTimeIntervals',
        methodProperties: {
          RecipientCityRef: '8d5a980d-391c-11dd-90d9-001a92567626', // Kyiv
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

  it('should get time intervals for specific city and date', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Common',
        calledMethod: 'getTimeIntervals',
        methodProperties: {
          RecipientCityRef: 'db5c88e0-391c-11dd-90d9-001a92567626', // Dnipro
          DateTime: '26.12.2024',
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
