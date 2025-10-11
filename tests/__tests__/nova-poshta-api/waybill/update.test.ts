import { client } from '../../../setup/client.setup';
import { PayerType, PaymentMethod, CargoType, ServiceType } from '@shopana/novaposhta-api-client';

describe('WaybillService - update', () => {
  it('should update an existing waybill', async () => {
    // Note: You need a valid document ref to update
    const documentRef = 'existing-document-ref';

    const response = await client.waybill.update({
      ref: documentRef,
      payerType: PayerType.Sender,
      paymentMethod: PaymentMethod.Cash,
      dateTime: '26.12.2024',
      cargoType: CargoType.Parcel,
      weight: 2, // Updated weight
      serviceType: ServiceType.WarehouseWarehouse,
      seatsAmount: 1,
      description: 'Updated test package',
      cost: 1500, // Updated cost
    } as any);

    expect(response).toBeDefined();
  });
});
