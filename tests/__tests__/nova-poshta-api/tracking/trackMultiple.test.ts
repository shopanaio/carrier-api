import { spec } from 'pactum';
import { getApiKey } from '../../../setup/pactum.setup';

describe('TrackingService - trackMultiple', () => {
  it('should track multiple documents and organize results', async () => {
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

    expect(response).toBeDefined();
  });

  it('should handle mix of valid and invalid documents', async () => {
    await spec()
      .post('/')
      .withJson({
        apiKey: getApiKey(),
        modelName: 'TrackingDocument',
        calledMethod: 'getStatusDocuments',
        methodProperties: {
          Documents: [
            { DocumentNumber: '20450123456789', Phone: '' },
            { DocumentNumber: 'invalid-doc', Phone: '' },
            { DocumentNumber: '20450987654321', Phone: '' },
          ],
        },
      })
      .expectStatus(200)
      .inspect()
      .toss();
  });
});
