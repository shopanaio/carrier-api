import { client } from '../../../setup/client.setup';
import { ServiceType, CargoType } from '@shopana/novaposhta-api-client';

describe('WaybillService - canDeliverToPostomat', () => {
  it('should check if postomat delivery is available', async () => {
    // Testing with valid postomat parameters
    const canDeliver = client.waybill.canDeliverToPostomat({
      citySender: '8d5a980d-391c-11dd-90d9-001a92567626',
      cityRecipient: 'db5c88e0-391c-11dd-90d9-001a92567626',
      weight: 1,
      serviceType: ServiceType.WarehouseWarehouse,
      cost: 500, // Under 10000 limit for postomat
      cargoType: CargoType.Parcel,
      seatsAmount: 1,
    });

    expect(typeof canDeliver).toBe('boolean');
    expect(canDeliver).toBe(true);
  });

  it('should fail for postomat with cargo over limit', async () => {
    // Testing with over-limit cost
    const canDeliver = client.waybill.canDeliverToPostomat({
      citySender: '8d5a980d-391c-11dd-90d9-001a92567626',
      cityRecipient: 'db5c88e0-391c-11dd-90d9-001a92567626',
      weight: 1,
      serviceType: ServiceType.WarehouseWarehouse,
      cost: 15000, // Over 10000 limit
      cargoType: CargoType.Parcel,
      seatsAmount: 1,
    });

    expect(typeof canDeliver).toBe('boolean');
    expect(canDeliver).toBe(false);
  });
});
