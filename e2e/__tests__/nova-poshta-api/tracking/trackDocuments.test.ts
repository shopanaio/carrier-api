import { client } from '../../../setup/client.setup';

describe('TrackingService - trackDocuments', () => {
  it('should track multiple documents', async () => {
    const response = await client.tracking.trackDocuments({
      Documents: [
        { DocumentNumber: '20450123456789', Phone: '' },
        { DocumentNumber: '20450987654321', Phone: '' },
      ],
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
  });

  it('should track documents with phone number', async () => {
    const response = await client.tracking.trackDocuments({
      Documents: [{ DocumentNumber: '20450123456789', Phone: '380501234567' }],
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
  });
});
