import { spec } from 'pactum';

describe('AddressService - getSettlements', () => {
  it('should get list of settlement areas', async () => {
    await spec()
      .post('/')
      .withJson({
        modelName: 'Address',
        calledMethod: 'getSettlementAreas',
        methodProperties: {},
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .expectJsonSchema({
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'array' },
        },
      })
      .inspect()
      .toss();
  });

  it('should return settlements with references', async () => {
    const response = await spec()
      .post('/')
      .withJson({
        modelName: 'Address',
        calledMethod: 'getSettlementAreas',
        methodProperties: {},
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .inspect()
      .toss();

    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
  });
});
