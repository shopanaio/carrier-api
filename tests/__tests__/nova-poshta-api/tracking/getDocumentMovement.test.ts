import { spec } from 'pactum';
import { getApiKey } from '../../../setup/pactum.setup';

describe('TrackingService - getDocumentMovement', () => {
  it('should get document movement history', async () => {
    await spec()
      .post('/')
      .withJson({
        apiKey: getApiKey(),
        modelName: 'TrackingDocument',
        calledMethod: 'getDocumentsEWMovement',
        methodProperties: {
          Documents: [
            {
              DocumentNumber: '20450123456789',
              Phone: '',
            },
          ],
          ShowDeliveryDetails: '1',
        },
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .inspect()
      .toss();
  });

  it('should get movement without delivery details', async () => {
    await spec()
      .post('/')
      .withJson({
        apiKey: getApiKey(),
        modelName: 'TrackingDocument',
        calledMethod: 'getDocumentsEWMovement',
        methodProperties: {
          Documents: [
            {
              DocumentNumber: '20450123456789',
              Phone: '',
            },
          ],
          ShowDeliveryDetails: '0',
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
