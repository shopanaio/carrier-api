import { client } from '../../../setup/client.setup';
import { itWithApiKey } from '../../../setup/testHelpers';

describe('ReferenceService - getTimeIntervals', () => {
  itWithApiKey('should get available time intervals for delivery', async () => {
    const response = await client.reference.getTimeIntervals({
      RecipientCityRef: '8d5a980d-391c-11dd-90d9-001a92567626', // Kyiv
      DateTime: '25.12.2024',
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
  });

  itWithApiKey('should get time intervals for specific city and date', async () => {
    const response = await client.reference.getTimeIntervals({
      RecipientCityRef: 'db5c88e0-391c-11dd-90d9-001a92567626', // Dnipro
      DateTime: '26.12.2024',
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
  });
});
