import { client } from '../../../setup/client.setup';

describe('AddressService - getCities', () => {
  it('should get list of cities', async () => {
    const response = await client.address.getCities();

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('should search cities by string', async () => {
    const response = await client.address.getCities({
      FindByString: 'Київ',
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
  });

  // TODO: API pagination doesn't work as expected - returns all results regardless of limit
  it.skip('should search cities with pagination', async () => {
    const response = await client.address.getCities({
      FindByString: 'Дніпр',
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

  it('should get city by ref', async () => {
    const response = await client.address.getCities({
      Ref: '8d5a980d-391c-11dd-90d9-001a92567626', // Kyiv
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
  });
});
