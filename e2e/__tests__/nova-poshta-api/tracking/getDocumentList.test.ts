import { client } from '../../../setup/client.setup';

describe('TrackingService - getDocumentList', () => {
  // TODO: Requires valid API key with associated waybills
  it.skip('should get list of documents for a date range', async () => {
    const response = await client.tracking.getDocumentList({
      DateTimeFrom: '01.01.2024',
      DateTimeTo: '31.01.2024',
      Page: 1,
      GetFullList: '0',
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
  });

  // TODO: Requires valid API key with associated waybills
  it.skip('should get full document list', async () => {
    const response = await client.tracking.getDocumentList({
      DateTimeFrom: '01.01.2024',
      DateTimeTo: '31.01.2024',
      GetFullList: '1',
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
  });

  // TODO: Requires valid API key with associated waybills
  it.skip('should get documents by specific date', async () => {
    const response = await client.tracking.getDocumentList({
      DateTime: '15.01.2024',
      Page: 1,
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
  });
});
