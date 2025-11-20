import { client } from '../../../setup/client.setup';

describe('ReferenceService - getCargoDescriptionList', () => {
  it('should get list of cargo descriptions', async () => {
    const response = await client.reference.getCargoDescriptionList();

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('should search cargo descriptions', async () => {
    const response = await client.reference.getCargoDescriptionList({
      FindByString: 'одяг',
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('should get cargo descriptions with pagination', async () => {
    const response = await client.reference.getCargoDescriptionList({
      Page: 1,
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
  });
});
