import { client } from '../../../setup/client.setup';
import { ServiceType } from '@shopana/novaposhta-api-client';
import { itWithApiKey } from '../../../setup/testHelpers';

describe('WaybillService - getDeliveryDate', () => {
  itWithApiKey('should calculate delivery date', async () => {
    const response = await client.waybill.getDeliveryDate({
      CitySender: '8d5a980d-391c-11dd-90d9-001a92567626', // Kyiv
      CityRecipient: 'db5c88e0-391c-11dd-90d9-001a92567626', // Dnipro
      ServiceType: ServiceType.WarehouseWarehouse,
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
  });
});
