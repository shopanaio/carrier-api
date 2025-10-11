import { spec } from 'pactum';
import { getApiKey } from '../../../setup/pactum.setup';

describe('TrackingService - monitorDocuments', () => {
  it('should track documents for monitoring', async () => {
    // First check
    const response1 = await spec()
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

    expect(response1).toBeDefined();

    // Simulate periodic monitoring - second check
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response2 = await spec()
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

    expect(response2).toBeDefined();
  });

  it('should monitor single document with periodic updates', async () => {
    await spec()
      .post('/')
      .withJson({
        apiKey: getApiKey(),
        modelName: 'TrackingDocument',
        calledMethod: 'getStatusDocuments',
        methodProperties: {
          Documents: [
            { DocumentNumber: '20450123456789', Phone: '' },
          ],
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
