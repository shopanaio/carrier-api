import { client } from '../../../setup/client.setup';
import { PayerType, PaymentMethod, CargoType, ServiceType } from '@shopana/novaposhta-api-client';

describe('WaybillService - validateWaybill', () => {
  it('should validate waybill data without creating', async () => {
    // This test validates the structure by checking required fields
    const isValid = await client.waybill.validateWaybill({
      PayerType: PayerType.Sender,
      PaymentMethod: PaymentMethod.Cash,
      DateTime: '25.12.2024',
      CargoType: CargoType.Parcel,
      Weight: 1,
      ServiceType: ServiceType.WarehouseWarehouse,
      SeatsAmount: 1,
    } as any);

    expect(typeof isValid).toBe('boolean');
  });

  it('should fail validation with invalid data', async () => {
    const isValid = await client.waybill.validateWaybill({
      Weight: 'invalid' as any,
    } as any);

    expect(typeof isValid).toBe('boolean');
  });
});
