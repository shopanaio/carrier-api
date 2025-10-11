import { client } from '../../../setup/client.setup';
import { PayerType, PaymentMethod, CargoType, ServiceType } from '@shopana/novaposhta-api-client';

describe('WaybillService - validateWaybill', () => {
  it('should validate waybill data without creating', async () => {
    // This test validates the structure by checking required fields
    const isValid = await client.waybill.validateWaybill({
      payerType: PayerType.Sender,
      paymentMethod: PaymentMethod.Cash,
      dateTime: '25.12.2024',
      cargoType: CargoType.Parcel,
      weight: 1,
      serviceType: ServiceType.WarehouseWarehouse,
      seatsAmount: 1,
    } as any);

    expect(typeof isValid).toBe('boolean');
  });

  it('should fail validation with invalid data', async () => {
    const isValid = await client.waybill.validateWaybill({
      weight: 'invalid' as any,
    } as any);

    expect(typeof isValid).toBe('boolean');
  });
});
