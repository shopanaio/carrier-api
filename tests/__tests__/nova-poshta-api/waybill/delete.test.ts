import { spec } from 'pactum';
import { getApiKey } from '../../../setup/pactum.setup';

describe('WaybillService - delete', () => {
  it('should delete waybills', async () => {
    // Note: You need valid document refs to delete
    const documentRefs = 'document-ref-1,document-ref-2';

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
