import { client } from '../../../setup/client.setup';
import { DeliveryStatus } from '@shopana/novaposhta-api-client';

describe('TrackingService - filterTrackingResults', () => {
  it('should track documents for filtering by status', async () => {
    const response = await client.tracking.trackDocuments({
      documents: [
        { documentNumber: '20450123456789', phone: '' },
        { documentNumber: '20450987654321', phone: '' },
      ],
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();

    // Results can be filtered on client side based on status, dates, cities
    if (response.data.length > 0) {
      const filtered = client.tracking.filterTrackingResults(response.data, {
        status: [DeliveryStatus.Received, DeliveryStatus.InTransitToRecipientCity],
      });
      expect(Array.isArray(filtered)).toBe(true);
    }
  });

  // TODO: Requires valid API key with associated waybills
  it.skip('should get document list for date range filtering', async () => {
    const response = await client.tracking.getDocumentList({
      dateTimeFrom: '01.01.2024',
      dateTimeTo: '31.01.2024',
      page: 1,
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
  });
});
