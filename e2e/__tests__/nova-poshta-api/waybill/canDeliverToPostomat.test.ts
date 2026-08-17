import { client } from '../../../setup/client.setup';
import { ServiceType, CargoType } from '@shopana/novaposhta-api-client';

describe('WaybillService - canDeliverToPostomat', () => {
  const createRequest = (ServiceType: ServiceType, Cost = 500) => ({
    CitySender: '8d5a980d-391c-11dd-90d9-001a92567626',
    CityRecipient: 'db5c88e0-391c-11dd-90d9-001a92567626',
    Weight: 1,
    ServiceType,
    Cost,
    CargoType: CargoType.Parcel,
    SeatsAmount: 1,
  });

  it.each([ServiceType.WarehousePostomat, ServiceType.DoorsPostomat])(
    'allows delivery with the explicit %s direction',
    serviceType => {
      expect(client.waybill.canDeliverToPostomat(createRequest(serviceType))).toBe(true);
    },
  );

  it.each([ServiceType.WarehouseWarehouse, ServiceType.DoorsWarehouse])(
    'rejects the non-postomat %s direction',
    serviceType => {
      expect(client.waybill.canDeliverToPostomat(createRequest(serviceType))).toBe(false);
    },
  );

  it('rejects postomat delivery with declared value over the limit', () => {
    const canDeliver = client.waybill.canDeliverToPostomat({
      ...createRequest(ServiceType.WarehousePostomat),
      Cost: 10001,
    });

    expect(canDeliver).toBe(false);
  });

  it('rejects unsupported cargo types', () => {
    const canDeliver = client.waybill.canDeliverToPostomat({
      ...createRequest(ServiceType.WarehousePostomat),
      CargoType: CargoType.Cargo,
    });

    expect(canDeliver).toBe(false);
  });

  it('does not allow a postomat to be used as SenderAddress', () => {
    expect(client.waybill.canUsePostomatAsSenderAddress()).toBe(false);
  });
});
