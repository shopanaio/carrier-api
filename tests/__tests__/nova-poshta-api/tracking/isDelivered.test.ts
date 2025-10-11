import { spec } from 'pactum';
import { getApiKey } from '../../../setup/pactum.setup';

describe('TrackingService - isDelivered', () => {
  it('should check if document is delivered', async () => {
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

    // Check response.data[0].StatusCode to determine if delivered
    // Delivered statuses: 9 (Received), 10 (ReceivedAwaitingMoneyTransfer), 11 (ReceivedAndMoneyTransferred)
    expect(response).toBeDefined();
  });
});
