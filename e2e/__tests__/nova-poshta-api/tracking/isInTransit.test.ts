import { client } from '../../../setup/client.setup';

describe('TrackingService - isInTransit', () => {
  it('should check if document is in transit', async () => {
    const response = await client.tracking.trackDocument('20450123456789');

    // Check response.statusCode to determine if in transit
    // In transit statuses: 3 (InTransitToRecipientCity), 6 (OnTheWayToRecipient), 107 (BeingPacked)
    expect(response).toBeDefined();

    if (response) {
      const isInTransit = client.tracking.isInTransit(response);
      expect(typeof isInTransit).toBe('boolean');
    }
  });

  it('should track multiple documents and check transit status', async () => {
    const response = await client.tracking.trackDocuments({
      Documents: [
        { DocumentNumber: '20450123456789', Phone: '' },
        { DocumentNumber: '20450987654321', Phone: '' },
      ],
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();

    if (response.data.length > 0) {
      response.data.forEach(status => {
        if (status) {
          const isInTransit = client.tracking.isInTransit(status);
          expect(typeof isInTransit).toBe('boolean');
        }
      });
    }
  });
});
