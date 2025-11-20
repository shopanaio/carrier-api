import { client } from '../../../setup/client.setup';

describe('AddressService - getSettlementCountryRegion', () => {
  // TODO: Area UUID may be outdated or invalid
  it.skip('should get settlement regions for a specific area', async () => {
    // Using a valid area ref (Kyiv region)
    const response = await client.address.getSettlementCountryRegion({
      AreaRef: '71508128-9b87-11de-822f-000c2965ae0e',
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
  });

  // TODO: Area UUID may be outdated or invalid
  it.skip('should return regions with proper structure', async () => {
    const response = await client.address.getSettlementCountryRegion({
      AreaRef: '71508128-9b87-11de-822f-000c2965ae0e',
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
  });
});
