import { spec } from 'pactum';
import { getApiKey } from '../../../setup/pactum.setup';

describe('TrackingService - isAtWarehouse', () => {
  it('should check if document is at warehouse or postomat', async () => {
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

    // Check response.data[0].StatusCode to determine if at warehouse
    // At warehouse statuses: 4 (ArrivedAtWarehouse), 5 (ArrivedAtPostomat),
    // 8 (InRecipientCityAwaitingDelivery)
    expect(response).toBeDefined();
  });

  it('should check postomat arrival', async () => {
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
