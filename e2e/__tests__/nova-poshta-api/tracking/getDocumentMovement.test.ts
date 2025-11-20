import { client } from '../../../setup/client.setup';

describe('TrackingService - getDocumentMovement', () => {
  // TODO: Replace with valid document number from real waybill
  it.skip('should get document movement history', async () => {
    const response = await client.tracking.getDocumentMovement({
      Documents: [{ DocumentNumber: '20450123456789', Phone: '' }],
      ShowDeliveryDetails: true,
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
  });

  // TODO: Replace with valid document number from real waybill
  it.skip('should get movement without delivery details', async () => {
    const response = await client.tracking.getDocumentMovement({
      Documents: [{ DocumentNumber: '20450123456789', Phone: '' }],
      ShowDeliveryDetails: false,
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
  });
});
