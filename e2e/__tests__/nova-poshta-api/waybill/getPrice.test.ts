import { client } from '../../../setup/client.setup';
import { ServiceType, CargoType } from '@shopana/novaposhta-api-client';
import { itWithApiKey } from '../../../setup/testHelpers';

describe('WaybillService - getPrice', () => {
  itWithApiKey('should calculate delivery price', async () => {
    const response = await client.waybill.getPrice({
      CitySender: '8d5a980d-391c-11dd-90d9-001a92567626', // Kyiv
      CityRecipient: 'db5c88e0-391c-11dd-90d9-001a92567626', // Dnipro
      Weight: 1,
      ServiceType: ServiceType.WarehouseWarehouse,
      Cost: 1000,
      CargoType: CargoType.Parcel,
      SeatsAmount: 1,
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
  });
});
