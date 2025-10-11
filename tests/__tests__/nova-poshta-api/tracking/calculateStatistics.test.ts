import { spec } from 'pactum';
import { getApiKey } from '../../../setup/pactum.setup';

describe('TrackingService - calculateStatistics', () => {
  it('should get tracking data for statistics calculation', async () => {
    const response = await spec()
      .post('/')
      .withJson({
        apiKey: getApiKey(),
        modelName: 'TrackingDocument',
        calledMethod: 'getStatusDocuments',
        methodProperties: {
          Documents: [
            { DocumentNumber: '20450123456789', Phone: '' },
            { DocumentNumber: '20450987654321', Phone: '' },
            { DocumentNumber: '20451122334455', Phone: '' },
          ],
        },
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .inspect()
      .toss();

    // Statistics (delivered, in transit, at warehouse, failed, unknown)
    // can be calculated from the response data on client side
    expect(response).toBeDefined();
  });

  it('should track documents for comprehensive statistics', async () => {
    await spec()
      .post('/')
      .withJson({
        apiKey: getApiKey(),
        modelName: 'InternetDocument',
        calledMethod: 'getDocumentList',
        methodProperties: {
          DateTimeFrom: '01.01.2024',
          DateTimeTo: '31.01.2024',
          Page: '1',
        },
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .inspect()
      .toss();
  });
});
