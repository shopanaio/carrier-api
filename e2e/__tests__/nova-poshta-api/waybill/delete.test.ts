import { client } from '../../../setup/client.setup';

describe('WaybillService - delete', () => {
  it('should delete waybills', async () => {
    // Note: You need valid document refs to delete
    const documentRefs = ['document-ref-1', 'document-ref-2'];

    const response = await client.waybill.delete({ DocumentRefs: documentRefs } as any);

    expect(response).toBeDefined();
  });
});
