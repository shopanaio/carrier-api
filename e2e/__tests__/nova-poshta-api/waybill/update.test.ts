import { client } from '../../../setup/client.setup';
import { PayerType, PaymentMethod, CargoType, ServiceType } from '@shopana/novaposhta-api-client';

describe('WaybillService - update', () => {
  it('should update an existing waybill', async () => {
    // Note: You need a valid document ref to update
    const documentRef = 'existing-document-ref';

    const response = await client.waybill.update({
      Ref: documentRef,
      PayerType: PayerType.Sender,
      PaymentMethod: PaymentMethod.Cash,
      DateTime: '26.12.2024',
      CargoType: CargoType.Parcel,
      Weight: 2, // Updated weight
      ServiceType: ServiceType.WarehouseWarehouse,
      SeatsAmount: 1,
      Description: 'Updated test package',
      Cost: 1500, // Updated cost
    } as any);

    expect(response).toBeDefined();
  });
});
