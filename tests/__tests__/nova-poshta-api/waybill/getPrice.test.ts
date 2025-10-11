import { client } from '../../../setup/client.setup';
import { ServiceType, CargoType } from '@shopana/novaposhta-api-client';

describe('WaybillService - getPrice', () => {
  it('should calculate delivery price', async () => {
    const response = await client.waybill.getPrice({
      citySender: '8d5a980d-391c-11dd-90d9-001a92567626', // Kyiv
      cityRecipient: 'db5c88e0-391c-11dd-90d9-001a92567626', // Dnipro
      weight: 1,
      serviceType: ServiceType.WarehouseWarehouse,
      cost: 1000,
      cargoType: CargoType.Parcel,
      seatsAmount: 1,
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
  });
});
