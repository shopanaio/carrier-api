import { client } from '../../../setup/client.setup';
import { PayerType, PaymentMethod, CargoType, ServiceType } from '@shopana/novaposhta-api-client';

describe('WaybillService - createWithOptions', () => {
  it('should create a waybill with additional options', async () => {
    const response = await client.waybill.createWithOptions({
      payerType: PayerType.Sender,
      paymentMethod: PaymentMethod.Cash,
      dateTime: '25.12.2024',
      cargoType: CargoType.Parcel,
      weight: 1,
      serviceType: ServiceType.WarehouseWarehouse,
      seatsAmount: 1,
      description: 'Test package',
      cost: 1000,
      citySender: '8d5a980d-391c-11dd-90d9-001a92567626',
      sender: '8d5a980d-391c-11dd-90d9-001a92567626',
      senderAddress: '8d5a980d-391c-11dd-90d9-001a92567626',
      contactSender: '8d5a980d-391c-11dd-90d9-001a92567626',
      sendersPhone: '380501234567',
      cityRecipient: '8d5a980d-391c-11dd-90d9-001a92567626',
      recipient: '8d5a980d-391c-11dd-90d9-001a92567626',
      recipientAddress: '8d5a980d-391c-11dd-90d9-001a92567626',
      contactRecipient: '8d5a980d-391c-11dd-90d9-001a92567626',
      recipientsPhone: '380507654321',
      optionsSeat: [
        {
          volumetricVolume: 0.01,
          volumetricWidth: 10,
          volumetricLength: 10,
          volumetricHeight: 10,
          weight: 1,
        },
      ],
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
  });
});
