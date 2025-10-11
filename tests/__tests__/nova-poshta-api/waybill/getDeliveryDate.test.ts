import { client } from '../../../setup/client.setup';
import { ServiceType } from '@shopana/novaposhta-api-client';

describe('WaybillService - getDeliveryDate', () => {
  it('should calculate delivery date', async () => {
    const response = await client.waybill.getDeliveryDate({
      citySender: '8d5a980d-391c-11dd-90d9-001a92567626', // Kyiv
      cityRecipient: 'db5c88e0-391c-11dd-90d9-001a92567626', // Dnipro
      serviceType: ServiceType.WarehouseWarehouse,
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
  });
});
