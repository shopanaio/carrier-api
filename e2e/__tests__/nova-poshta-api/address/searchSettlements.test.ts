import { client } from '../../../setup/client.setup';

describe('AddressService - searchSettlements', () => {
  it('should search settlements online', async () => {
    const response = await client.address.searchSettlements({
      CityName: 'Київ',
      Page: 1,
      Limit: 5,
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('should search settlements with pagination', async () => {
    const response = await client.address.searchSettlements({
      CityName: 'Дніпр',
      Page: 1,
      Limit: 10,
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
    if (response.data.length > 0) {
      expect(response.data.length).toBeLessThanOrEqual(10);
    }
  });

  it('should search settlements by partial name', async () => {
    const response = await client.address.searchSettlements({
      CityName: 'Хар',
      Page: 1,
      Limit: 15,
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
  });
});
