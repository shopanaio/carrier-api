import { client } from '../../../setup/client.setup';
import { itWithApiKey } from '../../../setup/testHelpers';

describe('ReferenceService - getPickupTimeIntervals', () => {
  itWithApiKey('should get available time intervals for pickup', async () => {
    const response = await client.reference.getPickupTimeIntervals({
      senderCityRef: '8d5a980d-391c-11dd-90d9-001a92567626',
      dateTime: '25.12.2024',
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
  });

  itWithApiKey('should get pickup intervals for warehouse', async () => {
    const response = await client.reference.getPickupTimeIntervals({
      senderCityRef: '8d5a980d-391c-11dd-90d9-001a92567626',
      dateTime: '25.12.2024',
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
  });
});
