import { client } from '../../../setup/client.setup';

describe('AddressService - getStreet', () => {
  // TODO: City UUID may be outdated or API requires additional parameters
  it.skip('should get streets in a city', async () => {
    const response = await client.address.getStreet({
      cityRef: '8d5a980d-391c-11dd-90d9-001a92567626', // Kyiv
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
  });

  // TODO: City UUID may be outdated or API requires additional parameters
  it.skip('should search streets by name', async () => {
    const response = await client.address.getStreet({
      cityRef: '8d5a980d-391c-11dd-90d9-001a92567626',
      findByString: 'Хрещатик',
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
  });

  // TODO: API pagination doesn't work as expected
  it.skip('should search streets with pagination', async () => {
    const response = await client.address.getStreet({
      cityRef: '8d5a980d-391c-11dd-90d9-001a92567626',
      findByString: 'вул',
      page: 1,
      limit: 20,
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
    if (response.data.length > 0) {
      expect(response.data.length).toBeLessThanOrEqual(20);
    }
  });
});
