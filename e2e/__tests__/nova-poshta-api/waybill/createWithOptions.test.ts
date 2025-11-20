import { client } from '../../../setup/client.setup';
import { PayerType, PaymentMethod, CargoType, ServiceType } from '@shopana/novaposhta-api-client';
import { itWithApiKey } from '../../../setup/testHelpers';

describe('WaybillService - createWithOptions', () => {
  itWithApiKey('should create a waybill with additional options', async () => {
    const response = await client.waybill.createWithOptions({
      PayerType: PayerType.Sender,
      PaymentMethod: PaymentMethod.Cash,
      DateTime: '25.12.2024',
      CargoType: CargoType.Parcel,
      Weight: 1,
      ServiceType: ServiceType.WarehouseWarehouse,
      SeatsAmount: 1,
      Description: 'Test package',
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
      OptionsSeat: [
        {
          VolumetricVolume: 0.01,
          VolumetricWidth: 10,
          VolumetricLength: 10,
          VolumetricHeight: 10,
          Weight: 1,
          weight: 1,
        },
      ],
    });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
  });
});
