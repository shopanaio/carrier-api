import { spec } from 'pactum';

describe('AddressService - getSettlementCountryRegion', () => {
  it('should get settlement regions for a specific area', async () => {
    // Using a valid area ref (Kyiv region)
    await spec()
      .post('/')
      .withJson({
        modelName: 'Address',
        calledMethod: 'getSettlementCountryRegion',
        methodProperties: {
          AreaRef: '71508128-9b87-11de-822f-000c2965ae0e',
        },
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .inspect()
      .toss();
  });

  it('should return regions with proper structure', async () => {
    const response = await spec()
      .post('/')
      .withJson({
        modelName: 'Address',
        calledMethod: 'getSettlementCountryRegion',
        methodProperties: {
          AreaRef: '71508128-9b87-11de-822f-000c2965ae0e',
        },
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .inspect()
      .toss();

    expect(response.data).toBeDefined();
  });
});
