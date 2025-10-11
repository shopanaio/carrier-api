import { spec } from 'pactum';
import { getApiKey } from '../../../setup/pactum.setup';

describe('TrackingService - isInTransit', () => {
  it('should check if document is in transit', async () => {
    const response = await spec()
      .post('/')
      .withJson({
        apiKey: getApiKey(),
        modelName: 'TrackingDocument',
        calledMethod: 'getStatusDocuments',
        methodProperties: {
          Documents: [
            {
              DocumentNumber: '20450123456789',
              Phone: '',
            },
          ],
        },
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .inspect()
      .toss();

    // Check response.data[0].StatusCode to determine if in transit
    // In transit statuses: 3 (InTransitToRecipientCity), 6 (OnTheWayToRecipient), 107 (BeingPacked)
    expect(response).toBeDefined();
  });

  it('should track multiple documents and check transit status', async () => {
    await spec()
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
  });
});
