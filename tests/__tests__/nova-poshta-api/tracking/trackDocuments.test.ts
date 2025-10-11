import { spec } from 'pactum';
import { getApiKey } from '../../../setup/pactum.setup';

describe('TrackingService - trackDocuments', () => {
  it('should track multiple documents', async () => {
    await spec()
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
            {
              DocumentNumber: '20450987654321',
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
  });

  it('should track documents with phone number', async () => {
    await spec()
      .post('/')
      .withJson({
        apiKey: getApiKey(),
        modelName: 'TrackingDocument',
        calledMethod: 'getStatusDocuments',
        methodProperties: {
          Documents: [
            {
              DocumentNumber: '20450123456789',
              Phone: '380501234567',
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
  });
});
