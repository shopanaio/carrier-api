import { createClient } from '../../src/core/client';
import { WaybillService } from '../../src/services/waybillService';
import { createMockTransport } from '../mocks/transport';
import { PayerType, PaymentMethod, CargoType, ServiceType } from '../../src/types/enums';

describe('WaybillService', () => {
  const baseUrl = 'https://api.novaposhta.ua/v2.0/json/';
  const apiKey = 'test-api-key';

  describe('create', () => {
    it('should call transport with correct parameters and return expected response', async () => {
      const mockData = [
        {
          Ref: 'waybill-ref-1',
          IntDocNumber: '20400048799000',
          CostOnSite: '50',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new WaybillService());

      const waybillData = {
        payerType: PayerType.Sender,
        paymentMethod: PaymentMethod.Cash,
        dateTime: '01.01.2024',
        cargoType: CargoType.Parcel,
        weight: 1.5,
        serviceType: ServiceType.WarehouseWarehouse,
        seatsAmount: 1,
        description: 'Test Package',
        cost: 1000,
        citySender: 'city-sender-ref',
        sender: 'sender-ref',
        senderAddress: 'sender-address-ref',
        contactSender: 'contact-sender-ref',
        sendersPhone: '380501234567',
        cityRecipient: 'city-recipient-ref',
        recipient: 'recipient-ref',
        recipientAddress: 'recipient-address-ref',
        contactRecipient: 'contact-recipient-ref',
        recipientsPhone: '380507654321',
      };

      const result = await client.waybill.create(waybillData);

      expect(calls).toHaveLength(1);
      expect(calls[0].url).toBe(baseUrl);
      expect(calls[0].body).toMatchObject({
        modelName: 'InternetDocumentGeneral',
        calledMethod: 'save',
        methodProperties: {
          PayerType: 'Sender',
          PaymentMethod: 'Cash',
          DateTime: '01.01.2024',
          CargoType: 'Parcel',
          Weight: 1.5,
          ServiceType: 'WarehouseWarehouse',
          SeatsAmount: 1,
          Description: 'Test Package',
          Cost: 1000,
          CitySender: 'city-sender-ref',
          Sender: 'sender-ref',
          SenderAddress: 'sender-address-ref',
          ContactSender: 'contact-sender-ref',
          SendersPhone: '380501234567',
          CityRecipient: 'city-recipient-ref',
          Recipient: 'recipient-ref',
          RecipientAddress: 'recipient-address-ref',
          ContactRecipient: 'contact-recipient-ref',
          RecipientsPhone: '380507654321',
        },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('update', () => {
    it('should call transport with correct parameters and return expected response', async () => {
      const mockData = [
        {
          Ref: 'waybill-ref-1',
          IntDocNumber: '20400048799000',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new WaybillService());

      const updateData = {
        ref: 'waybill-ref-1',
        payerType: PayerType.Sender,
        paymentMethod: PaymentMethod.Cash,
        dateTime: '01.01.2024',
        cargoType: CargoType.Parcel,
        weight: 2.0,
        serviceType: ServiceType.WarehouseWarehouse,
        seatsAmount: 1,
        description: 'Updated Package',
        cost: 1500,
        citySender: 'city-sender-ref',
        sender: 'sender-ref',
        senderAddress: 'sender-address-ref',
        contactSender: 'contact-sender-ref',
        sendersPhone: '380501234567',
        cityRecipient: 'city-recipient-ref',
        recipient: 'recipient-ref',
        recipientAddress: 'recipient-address-ref',
        contactRecipient: 'contact-recipient-ref',
        recipientsPhone: '380507654321',
      };

      const result = await client.waybill.update(updateData);

      expect(calls).toHaveLength(1);
      expect(calls[0].body).toMatchObject({
        modelName: 'InternetDocumentGeneral',
        calledMethod: 'update',
        methodProperties: {
          Ref: 'waybill-ref-1',
          PayerType: 'Sender',
          Weight: 2.0,
          Description: 'Updated Package',
          Cost: 1500,
        },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('delete', () => {
    it('should call transport with correct parameters and return expected response', async () => {
      const mockData = [
        {
          Ref: 'waybill-ref-1',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new WaybillService());

      const result = await client.waybill.delete({ documentRefs: ['waybill-ref-1'] });

      expect(calls).toHaveLength(1);
      expect(calls[0].body).toMatchObject({
        modelName: 'InternetDocumentGeneral',
        calledMethod: 'delete',
        methodProperties: {
          DocumentRefs: 'waybill-ref-1',
        },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('validateWaybill', () => {
    it('should validate waybill data and return boolean', async () => {
      const client = createClient({ transport: createMockTransport().transport, baseUrl, apiKey }).use(
        new WaybillService(),
      );

      const waybillData = {
        payerType: PayerType.Sender,
        paymentMethod: PaymentMethod.Cash,
        dateTime: '01.01.2024',
        cargoType: CargoType.Parcel,
        weight: 1.5,
        serviceType: ServiceType.WarehouseWarehouse,
        seatsAmount: 1,
        description: 'Test Package',
        cost: 1000,
        citySender: 'city-sender-ref',
        sender: 'sender-ref',
        senderAddress: 'sender-address-ref',
        contactSender: 'contact-sender-ref',
        sendersPhone: '380501234567',
        cityRecipient: 'city-recipient-ref',
        recipient: 'recipient-ref',
        recipientAddress: 'recipient-address-ref',
        contactRecipient: 'contact-recipient-ref',
        recipientsPhone: '380507654321',
      };

      const result = await client.waybill.validateWaybill(waybillData);

      expect(typeof result).toBe('boolean');
      expect(result).toBe(true);
    });
  });

  describe('createWithOptions', () => {
    it('should call transport with correct parameters', async () => {
      const mockData = [
        {
          Ref: 'waybill-ref-1',
          IntDocNumber: '20400048799000',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new WaybillService());

      const result = await client.waybill.createWithOptions({
        payerType: PayerType.Sender,
        paymentMethod: PaymentMethod.Cash,
        dateTime: '01.01.2024',
        cargoType: CargoType.Parcel,
        weight: 1.5,
        serviceType: ServiceType.WarehouseWarehouse,
        seatsAmount: 1,
        description: 'Test Package',
        cost: 1000,
        citySender: 'city-sender-ref',
        sender: 'sender-ref',
        senderAddress: 'sender-address-ref',
        contactSender: 'contact-sender-ref',
        sendersPhone: '380501234567',
        cityRecipient: 'city-recipient-ref',
        recipient: 'recipient-ref',
        recipientAddress: 'recipient-address-ref',
        contactRecipient: 'contact-recipient-ref',
        recipientsPhone: '380507654321',
        backwardDeliveryData: [],
      });

      expect(calls).toHaveLength(1);
      expect(calls[0].body.modelName).toBe('InternetDocumentGeneral');
      expect(calls[0].body.calledMethod).toBe('save');
      expect(result.success).toBe(true);
    });
  });

  describe('createForPostomat', () => {
    it('should call transport with correct parameters', async () => {
      const mockData = [
        {
          Ref: 'waybill-ref-1',
          IntDocNumber: '20400048799000',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new WaybillService());

      const result = await client.waybill.createForPostomat({
        payerType: PayerType.Sender,
        paymentMethod: PaymentMethod.Cash,
        dateTime: '01.01.2024',
        cargoType: CargoType.Parcel,
        weight: 1.5,
        serviceType: ServiceType.WarehouseWarehouse,
        seatsAmount: 1,
        description: 'Test Package',
        cost: 1000,
        citySender: 'city-sender-ref',
        sender: 'sender-ref',
        senderAddress: 'sender-address-ref',
        contactSender: 'contact-sender-ref',
        sendersPhone: '380501234567',
        cityRecipient: 'city-recipient-ref',
        recipient: 'recipient-ref',
        recipientAddress: 'recipient-address-ref',
        contactRecipient: 'contact-recipient-ref',
        recipientsPhone: '380507654321',
      });

      expect(calls).toHaveLength(1);
      expect(result.success).toBe(true);
    });
  });

  describe('getDeliveryDate', () => {
    it('should call transport with correct parameters', async () => {
      const mockData = [
        {
          DeliveryDate: '05.01.2024',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new WaybillService());

      const result = await client.waybill.getDeliveryDate({
        citySender: 'city-sender-ref',
        cityRecipient: 'city-recipient-ref',
        serviceType: ServiceType.WarehouseWarehouse,
      });

      expect(calls).toHaveLength(1);
      expect(calls[0].body).toMatchObject({
        modelName: 'InternetDocumentGeneral',
        calledMethod: 'getDocumentDeliveryDate',
        methodProperties: {
          CitySender: 'city-sender-ref',
          CityRecipient: 'city-recipient-ref',
          ServiceType: 'WarehouseWarehouse',
        },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('getPrice', () => {
    it('should call transport with correct parameters', async () => {
      const mockData = [
        {
          Cost: '50',
          CostRedelivery: '30',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new WaybillService());

      const result = await client.waybill.getPrice({
        citySender: 'city-sender-ref',
        cityRecipient: 'city-recipient-ref',
        weight: 1.5,
        serviceType: ServiceType.WarehouseWarehouse,
        cost: 1000,
        cargoType: CargoType.Parcel,
        seatsAmount: 1,
      });

      expect(calls).toHaveLength(1);
      expect(calls[0].body).toMatchObject({
        modelName: 'InternetDocumentGeneral',
        calledMethod: 'getDocumentPrice',
        methodProperties: {
          CitySender: 'city-sender-ref',
          CityRecipient: 'city-recipient-ref',
          Weight: 1.5,
          ServiceType: 'WarehouseWarehouse',
          Cost: 1000,
          CargoType: 'Parcel',
          SeatsAmount: 1,
        },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('createBatch', () => {
    it('should create multiple waybills', async () => {
      const mockData = [
        {
          Ref: 'waybill-ref-1',
          IntDocNumber: '20400048799000',
        },
      ];
      const { transport, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new WaybillService());

      const waybills = [
        {
          payerType: PayerType.Sender,
          paymentMethod: PaymentMethod.Cash,
          dateTime: '01.01.2024',
          cargoType: CargoType.Parcel,
          weight: 1.5,
          serviceType: ServiceType.WarehouseWarehouse,
          seatsAmount: 1,
          description: 'Test Package 1',
          cost: 1000,
          citySender: 'city-sender-ref',
          sender: 'sender-ref',
          senderAddress: 'sender-address-ref',
          contactSender: 'contact-sender-ref',
          sendersPhone: '380501234567',
          cityRecipient: 'city-recipient-ref',
          recipient: 'recipient-ref',
          recipientAddress: 'recipient-address-ref',
          contactRecipient: 'contact-recipient-ref',
          recipientsPhone: '380507654321',
        },
        {
          payerType: PayerType.Sender,
          paymentMethod: PaymentMethod.Cash,
          dateTime: '01.01.2024',
          cargoType: CargoType.Parcel,
          weight: 2.0,
          serviceType: ServiceType.WarehouseWarehouse,
          seatsAmount: 1,
          description: 'Test Package 2',
          cost: 1500,
          citySender: 'city-sender-ref',
          sender: 'sender-ref',
          senderAddress: 'sender-address-ref',
          contactSender: 'contact-sender-ref',
          sendersPhone: '380501234567',
          cityRecipient: 'city-recipient-ref',
          recipient: 'recipient-ref',
          recipientAddress: 'recipient-address-ref',
          contactRecipient: 'contact-recipient-ref',
          recipientsPhone: '380507654321',
        },
      ];

      const results = await client.waybill.createBatch(waybills);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
    });

    it('should handle errors in batch creation', async () => {
      let callCount = 0;
      const transport = async () => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Network error');
        }
        return {
          status: 200,
          data: { success: true, data: [{ Ref: 'waybill-ref-2' }] },
        };
      };

      const client = createClient({ transport, baseUrl, apiKey }).use(new WaybillService());

      const waybills = [
        {
          payerType: PayerType.Sender,
          paymentMethod: PaymentMethod.Cash,
          dateTime: '01.01.2024',
          cargoType: CargoType.Parcel,
          weight: 1.5,
          serviceType: ServiceType.WarehouseWarehouse,
          seatsAmount: 1,
          description: 'Test Package 1',
          cost: 1000,
          citySender: 'city-sender-ref',
          sender: 'sender-ref',
          senderAddress: 'sender-address-ref',
          contactSender: 'contact-sender-ref',
          sendersPhone: '380501234567',
          cityRecipient: 'city-recipient-ref',
          recipient: 'recipient-ref',
          recipientAddress: 'recipient-address-ref',
          contactRecipient: 'contact-recipient-ref',
          recipientsPhone: '380507654321',
        },
        {
          payerType: PayerType.Sender,
          paymentMethod: PaymentMethod.Cash,
          dateTime: '01.01.2024',
          cargoType: CargoType.Parcel,
          weight: 2.0,
          serviceType: ServiceType.WarehouseWarehouse,
          seatsAmount: 1,
          description: 'Test Package 2',
          cost: 1500,
          citySender: 'city-sender-ref',
          sender: 'sender-ref',
          senderAddress: 'sender-address-ref',
          contactSender: 'contact-sender-ref',
          sendersPhone: '380501234567',
          cityRecipient: 'city-recipient-ref',
          recipient: 'recipient-ref',
          recipientAddress: 'recipient-address-ref',
          contactRecipient: 'contact-recipient-ref',
          recipientsPhone: '380507654321',
        },
      ];

      const results = await client.waybill.createBatch(waybills);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(false);
      expect(results[1].success).toBe(true);
    });
  });

  describe('deleteBatch', () => {
    it('should delete multiple waybills', async () => {
      const mockData = [
        {
          Ref: 'waybill-ref-1',
        },
        {
          Ref: 'waybill-ref-2',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new WaybillService());

      const result = await client.waybill.deleteBatch(['waybill-ref-1', 'waybill-ref-2']);

      expect(calls).toHaveLength(1);
      expect(calls[0].body).toMatchObject({
        modelName: 'InternetDocumentGeneral',
        calledMethod: 'delete',
        methodProperties: {
          DocumentRefs: 'waybill-ref-1,waybill-ref-2',
        },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('getEstimate', () => {
    it('should get price and delivery date', async () => {
      const mockPriceData = [
        {
          Cost: '50',
        },
      ];
      const mockDateData = [
        {
          DeliveryDate: '05.01.2024',
        },
      ];
      const { transport, setResponse } = createMockTransport();
      let callCount = 0;

      const client = createClient({
        transport: async args => {
          callCount++;
          return {
            status: 200,
            data: callCount === 1 ? { success: true, data: mockPriceData } : { success: true, data: mockDateData },
          };
        },
        baseUrl,
        apiKey,
      }).use(new WaybillService());

      const result = await client.waybill.getEstimate({
        citySender: 'city-sender-ref',
        cityRecipient: 'city-recipient-ref',
        weight: 1.5,
        serviceType: ServiceType.WarehouseWarehouse,
        cost: 1000,
        cargoType: CargoType.Parcel,
        seatsAmount: 1,
      });

      expect(result.price.success).toBe(true);
      expect(result.deliveryDate.success).toBe(true);
    });
  });

  describe('canDeliverToPostomat', () => {
    it('should return true for valid postomat delivery', () => {
      const client = createClient({ transport: createMockTransport().transport, baseUrl, apiKey }).use(
        new WaybillService(),
      );

      const result = client.waybill.canDeliverToPostomat({
        cargoType: CargoType.Parcel,
        serviceType: ServiceType.WarehouseWarehouse,
        cost: 5000,
      });

      expect(result).toBe(true);
    });

    it('should return false for invalid postomat delivery (high cost)', () => {
      const client = createClient({ transport: createMockTransport().transport, baseUrl, apiKey }).use(
        new WaybillService(),
      );

      const result = client.waybill.canDeliverToPostomat({
        cargoType: CargoType.Parcel,
        serviceType: ServiceType.WarehouseWarehouse,
        cost: 15000,
      });

      expect(result).toBe(false);
    });

    it('should return false for invalid cargo type', () => {
      const client = createClient({ transport: createMockTransport().transport, baseUrl, apiKey }).use(
        new WaybillService(),
      );

      const result = client.waybill.canDeliverToPostomat({
        cargoType: 'Pallet' as any,
        serviceType: ServiceType.WarehouseWarehouse,
        cost: 5000,
      });

      expect(result).toBe(false);
    });
  });
});
