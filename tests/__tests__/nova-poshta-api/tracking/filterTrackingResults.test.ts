import { spec } from 'pactum';
import { getApiKey } from '../../../setup/pactum.setup';

describe('TrackingService - filterTrackingResults', () => {
  it('should track documents for filtering by status', async () => {
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
          ],
        },
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .inspect()
      .toss();

    // Results can be filtered on client side based on status, dates, cities
    expect(response).toBeDefined();
  });

  it('should get document list for date range filtering', async () => {
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
