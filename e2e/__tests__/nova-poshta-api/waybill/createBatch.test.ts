import { client } from '../../../setup/client.setup';
import { PayerType, PaymentMethod, CargoType, ServiceType } from '@shopana/novaposhta-api-client';

describe('WaybillService - createBatch', () => {
  it('should create multiple waybills sequentially', async () => {
    const waybills = [
      {
        PayerType: PayerType.Sender,
        PaymentMethod: PaymentMethod.Cash,
        DateTime: '25.12.2024',
        CargoType: CargoType.Parcel,
        Weight: 1,
        ServiceType: ServiceType.WarehouseWarehouse,
        SeatsAmount: 1,
        Description: 'Batch test package 1',
        Cost: 1000,
        CitySender: '8d5a980d-391c-11dd-90d9-001a92567626',
        Sender: '8d5a980d-391c-11dd-90d9-001a92567626',
        SenderAddress: '8d5a980d-391c-11dd-90d9-001a92567626',
        ContactSender: '8d5a980d-391c-11dd-90d9-001a92567626',
        SendersPhone: '380501234567',
        CityRecipient: '8d5a980d-391c-11dd-90d9-001a92567626',
        Recipient: '8d5a980d-391c-11dd-90d9-001a92567626',
        RecipientAddress: '8d5a980d-391c-11dd-90d9-001a92567626',
        ContactRecipient: '8d5a980d-391c-11dd-90d9-001a92567626',
        RecipientsPhone: '380507654321',
      },
      {
        PayerType: PayerType.Sender,
        PaymentMethod: PaymentMethod.Cash,
        DateTime: '25.12.2024',
        CargoType: CargoType.Parcel,
        Weight: 2,
        ServiceType: ServiceType.WarehouseWarehouse,
        SeatsAmount: 1,
        Description: 'Batch test package 2',
        Cost: 1500,
        CitySender: '8d5a980d-391c-11dd-90d9-001a92567626',
        Sender: '8d5a980d-391c-11dd-90d9-001a92567626',
        SenderAddress: '8d5a980d-391c-11dd-90d9-001a92567626',
        ContactSender: '8d5a980d-391c-11dd-90d9-001a92567626',
        SendersPhone: '380501234567',
        CityRecipient: '8d5a980d-391c-11dd-90d9-001a92567626',
        Recipient: '8d5a980d-391c-11dd-90d9-001a92567626',
        RecipientAddress: '8d5a980d-391c-11dd-90d9-001a92567626',
        ContactRecipient: '8d5a980d-391c-11dd-90d9-001a92567626',
        RecipientsPhone: '380507654321',
      },
    ];

    const responses = await client.waybill.createBatch(waybills as any);

    expect(responses).toBeDefined();
    expect(Array.isArray(responses)).toBe(true);
    expect(responses.length).toBe(2);
  });
});
