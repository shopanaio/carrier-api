import { spec } from 'pactum';
import { getApiKey } from '../../../setup/pactum.setup';

describe('WaybillService - deleteBatch', () => {
  it('should delete multiple waybills at once', async () => {
    // Note: You need valid document refs to delete
    const documentRefs = 'ref-1,ref-2,ref-3';

    await spec()
      .post('/')
      .withJson({
        apiKey: getApiKey(),
        modelName: 'InternetDocument',
        calledMethod: 'delete',
        methodProperties: {
          DocumentRefs: documentRefs,
        },
      })
      .expectStatus(200)
      .inspect()
      .toss();
  });
});
