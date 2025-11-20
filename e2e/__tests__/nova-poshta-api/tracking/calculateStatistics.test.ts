import { client } from '../../../setup/client.setup';

describe('TrackingService - calculateStatistics', () => {
  it('should get tracking data for statistics calculation', async () => {
    const response = await client.tracking.trackMultiple([
      '20450123456789',
      '20450987654321',
      '20451122334455',
    ]);

    // Statistics (delivered, in transit, at warehouse, failed, unknown)
    // are calculated and returned
    expect(response).toBeDefined();
    expect(response.statistics).toBeDefined();
    expect(response.statistics.totalTracked).toBeGreaterThanOrEqual(0);
    expect(response.statistics.delivered).toBeGreaterThanOrEqual(0);
    expect(response.statistics.inTransit).toBeGreaterThanOrEqual(0);
    expect(response.statistics.atWarehouse).toBeGreaterThanOrEqual(0);
    expect(response.statistics.failed).toBeGreaterThanOrEqual(0);
    expect(response.statistics.unknown).toBeGreaterThanOrEqual(0);
  });

  // TODO: Requires valid API key with associated waybills
  it.skip('should track documents for comprehensive statistics', async () => {
    const response = await client.tracking.getDocumentList({
      DateTimeFrom: '01.01.2024',
      DateTimeTo: '31.01.2024',
      Page: 1,
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
  });
});
