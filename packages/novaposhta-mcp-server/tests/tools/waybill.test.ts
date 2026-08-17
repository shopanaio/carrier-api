import { describe, expect, it, vi, beforeEach } from 'vitest';

import { getWaybillTools, handleWaybillTool } from '../../src/tools/waybill.js';
import type { ToolContext } from '../../src/types/mcp.js';

const createMockContext = (): ToolContext => ({
  client: {
    waybill: {
      getPrice: vi.fn().mockResolvedValue({ success: true, data: [{ Cost: 100 }] }),
      getDeliveryDate: vi.fn().mockResolvedValue({ success: true, data: [{ DeliveryDate: '2024-01-01' }] }),
      getEstimate: vi.fn(),
      create: vi.fn(),
      createWithOptions: vi.fn(),
      createToPostomat: vi.fn(),
      createBatch: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteBatch: vi.fn(),
    },
    tracking: {} as any,
    address: {} as any,
    reference: {} as any,
    counterparty: {} as any,
    contactPerson: {} as any,
  },
  config: {
    apiKey: 'test',
    baseUrl: 'https://example.com',
    logLevel: 'info',
    timeout: 1000,
  },
});

const validPostomatRequest = {
  PayerType: 'Sender',
  PaymentMethod: 'Cash',
  DateTime: '01.01.2024',
  CargoType: 'Parcel',
  Weight: 1,
  ServiceType: 'WarehousePostomat',
  SeatsAmount: 1,
  Description: 'Test',
  Cost: 100,
  CitySender: 'city1',
  Sender: 'sender-ref',
  SenderAddress: 'sender-branch-ref',
  ContactSender: 'contact1',
  SendersPhone: '380501234567',
  CityRecipient: 'city2',
  Recipient: 'recipient-ref',
  RecipientAddress: 'recipient-postomat-ref',
  RecipientWarehouseIndex: '11/1001',
  ContactRecipient: 'contact2',
  RecipientsPhone: '380501234568',
  OptionsSeat: [
    {
      Weight: 1,
      VolumetricWidth: 10,
      VolumetricLength: 20,
      VolumetricHeight: 15,
    },
  ],
};

describe('waybill tools', () => {
  let context: ToolContext;

  beforeEach(() => {
    context = createMockContext();
  });

  it('exposes the canonical postomat tool and its compatibility alias', () => {
    const tools = getWaybillTools();

    expect(tools).toHaveLength(11);
    expect(tools.map(tool => tool.name)).toEqual(
      expect.arrayContaining(['waybill_create_to_postomat', 'waybill_create_for_postomat']),
    );

    const canonicalTool = tools.find(tool => tool.name === 'waybill_create_to_postomat');
    const requestSchema = canonicalTool?.inputSchema.properties?.request as {
      properties?: Record<string, { enum?: string[]; maximum?: number }>;
      required?: string[];
    };
    expect(requestSchema.properties?.ServiceType.enum).toEqual(['DoorsPostomat', 'WarehousePostomat']);
    expect(requestSchema.properties?.CargoType.enum).toEqual(['Parcel', 'Documents']);
    expect(requestSchema.properties?.Cost.maximum).toBe(10000);
    expect(requestSchema.required).toEqual(
      expect.arrayContaining(['SenderAddress', 'RecipientAddress', 'OptionsSeat']),
    );
  });

  it('requires document refs for delete tool', async () => {
    const result = await handleWaybillTool('waybill_delete', { documentRefs: [] }, context);
    expect(result.isError).toBe(true);
  });

  describe('waybill_calculate_cost', () => {
    it('validates required fields in request object', async () => {
      const result = await handleWaybillTool(
        'waybill_calculate_cost',
        {
          request: {
            CitySender: 'city1',
            CityRecipient: 'city2',
            // Missing serviceType
            CargoType: 'Parcel',
            Cost: 100,
            Weight: 1,
            SeatsAmount: 1,
          },
        },
        context,
      );
      expect(result.isError).toBe(true);
      expect(result.content?.[0]?.text).toContain('ServiceType');
    });

    it('validates all required fields when using request object', async () => {
      const result = await handleWaybillTool(
        'waybill_calculate_cost',
        {
          request: {},
        },
        context,
      );
      expect(result.isError).toBe(true);
    });

    it('works with valid request object', async () => {
      const result = await handleWaybillTool(
        'waybill_calculate_cost',
        {
          request: {
            CitySender: 'city1',
            CityRecipient: 'city2',
            ServiceType: 'WarehouseWarehouse',
            CargoType: 'Parcel',
            Cost: 100,
            Weight: 1,
            SeatsAmount: 1,
          },
        },
        context,
      );
      expect(result.isError).toBeUndefined();
    });

    it('works with individual parameters', async () => {
      const result = await handleWaybillTool(
        'waybill_calculate_cost',
        {
          CitySender: 'city1',
          CityRecipient: 'city2',
          ServiceType: 'WarehouseWarehouse',
          CargoType: 'Parcel',
          Cost: 100,
          Weight: 1,
          SeatsAmount: 1,
        },
        context,
      );
      expect(result.isError).toBeUndefined();
    });
  });

  describe('waybill_get_delivery_date', () => {
    it('validates required fields in request object', async () => {
      const result = await handleWaybillTool(
        'waybill_get_delivery_date',
        {
          request: {
            CitySender: 'city1',
            // Missing cityRecipient and serviceType
          },
        },
        context,
      );
      expect(result.isError).toBe(true);
      expect(result.content?.[0]?.text).toContain('CityRecipient');
    });

    it('works with valid request object', async () => {
      const result = await handleWaybillTool(
        'waybill_get_delivery_date',
        {
          request: {
            CitySender: 'city1',
            CityRecipient: 'city2',
            ServiceType: 'WarehouseWarehouse',
          },
        },
        context,
      );
      expect(result.isError).toBeUndefined();
    });
  });

  describe('waybill_get_estimate', () => {
    it('successfully gets estimate with price and delivery date', async () => {
      vi.mocked(context.client.waybill.getEstimate).mockResolvedValue({
        price: {
          success: true,
          data: [{ Cost: 150 }],
          errors: [],
          warnings: [],
          info: [],
          messageCodes: [],
          errorCodes: [],
          warningCodes: [],
          infoCodes: [],
        },
        deliveryDate: {
          success: true,
          data: [{ DeliveryDate: { date: '2024-01-05' } }],
          errors: [],
          warnings: [],
          info: [],
          messageCodes: [],
          errorCodes: [],
          warningCodes: [],
          infoCodes: [],
        },
      });

      const result = await handleWaybillTool(
        'waybill_get_estimate',
        {
          CitySender: 'city1',
          CityRecipient: 'city2',
          ServiceType: 'WarehouseWarehouse',
          CargoType: 'Parcel',
          Cost: 100,
          Weight: 1,
          SeatsAmount: 1,
        },
        context,
      );

      expect(result.isError).toBeUndefined();
      expect(context.client.waybill.getEstimate).toHaveBeenCalled();
    });
  });

  describe('waybill_create_with_options', () => {
    it('successfully creates waybill with options', async () => {
      vi.mocked(context.client.waybill.createWithOptions).mockResolvedValue({
        success: true,
        data: [{ Ref: 'doc-ref-123', IntDocNumber: '20400048799000' }] as any,
        errors: [],
        warnings: [],
        info: [],
        messageCodes: [],
        errorCodes: [],
        warningCodes: [],
        infoCodes: [],
      });

      const result = await handleWaybillTool(
        'waybill_create_with_options',
        {
          request: {
            payerType: 'Sender',
            paymentMethod: 'Cash',
            dateTime: '01.01.2024',
            CargoType: 'Parcel',
            Weight: 1,
            ServiceType: 'WarehouseWarehouse',
            SeatsAmount: 1,
            description: 'Test',
            Cost: 100,
            CitySender: 'city1',
            sender: 'sender-ref',
            senderAddress: 'address1',
            contactSender: 'contact1',
            sendersPhone: '380501234567',
            CityRecipient: 'city2',
            recipient: 'recipient-ref',
            recipientAddress: 'address2',
            contactRecipient: 'contact2',
            recipientsPhone: '380501234568',
            backwardDeliveryData: [],
          },
        },
        context,
      );

      expect(result.isError).toBeUndefined();
      expect(context.client.waybill.createWithOptions).toHaveBeenCalled();
    });

    it('requires request object', async () => {
      const result = await handleWaybillTool('waybill_create_with_options', {}, context);
      expect(result.isError).toBe(true);
    });
  });

  describe('waybill_create_to_postomat', () => {
    it('successfully creates a waybill for delivery to a recipient postomat', async () => {
      vi.mocked(context.client.waybill.createToPostomat).mockResolvedValue({
        success: true,
        data: [{ Ref: 'doc-ref-456', IntDocNumber: '20400048799001' }] as any,
        errors: [],
        warnings: [],
        info: [],
        messageCodes: [],
        errorCodes: [],
        warningCodes: [],
        infoCodes: [],
      });

      const result = await handleWaybillTool(
        'waybill_create_to_postomat',
        {
          request: validPostomatRequest,
        },
        context,
      );

      expect(result.isError).toBeUndefined();
      expect(context.client.waybill.createToPostomat).toHaveBeenCalledWith(
        expect.objectContaining({
          SenderAddress: 'sender-branch-ref',
          RecipientAddress: 'recipient-postomat-ref',
          RecipientWarehouseIndex: '11/1001',
        }),
      );
    });

    it('keeps waybill_create_for_postomat as a compatibility alias', async () => {
      vi.mocked(context.client.waybill.createToPostomat).mockResolvedValue({
        success: true,
        data: [{ Ref: 'doc-ref-compatibility' }] as any,
        errors: [],
        warnings: [],
        info: [],
        messageCodes: [],
        errorCodes: [],
        warningCodes: [],
        infoCodes: [],
      });

      const result = await handleWaybillTool('waybill_create_for_postomat', { request: validPostomatRequest }, context);

      expect(result.isError).toBeUndefined();
      expect(context.client.waybill.createToPostomat).toHaveBeenCalledWith(validPostomatRequest);
    });

    it.each([
      ['ServiceType', 'WarehouseWarehouse', 'DoorsPostomat or WarehousePostomat'],
      ['CargoType', 'Cargo', 'Parcel or Documents'],
      ['Cost', 10001, 'between 0 and 10000'],
    ])('rejects invalid postomat %s before calling the API client', async (field, value, message) => {
      const result = await handleWaybillTool(
        'waybill_create_to_postomat',
        { request: { ...validPostomatRequest, [field]: value } },
        context,
      );

      expect(result.isError).toBe(true);
      expect(result.content[0]).toMatchObject({ type: 'text', text: expect.stringContaining(message) });
      expect(context.client.waybill.createToPostomat).not.toHaveBeenCalled();
    });

    it('rejects postomat seat dimensions above the API client limits', async () => {
      const result = await handleWaybillTool(
        'waybill_create_to_postomat',
        {
          request: {
            ...validPostomatRequest,
            OptionsSeat: [{ ...validPostomatRequest.OptionsSeat[0], VolumetricWidth: 41 }],
          },
        },
        context,
      );

      expect(result.isError).toBe(true);
      expect(result.content[0]).toMatchObject({ type: 'text', text: expect.stringContaining('width 40 cm') });
      expect(context.client.waybill.createToPostomat).not.toHaveBeenCalled();
    });

    it('exposes the API restriction when SenderAddress is a postomat', async () => {
      vi.mocked(context.client.waybill.createToPostomat).mockResolvedValue({
        success: false,
        data: [],
        errors: ['Sending from Postomat is Unavailable'],
        warnings: [],
        info: [],
        messageCodes: [],
        errorCodes: ['20000204037'],
        warningCodes: [],
        infoCodes: [],
      });

      const result = await handleWaybillTool(
        'waybill_create_to_postomat',
        {
          request: { ...validPostomatRequest, SenderAddress: 'sender-postomat-ref' },
        },
        context,
      );

      expect(result.isError).toBe(true);
      expect(result.content[0]).toMatchObject({
        type: 'text',
        text: expect.stringContaining('20000204037'),
      });
      expect(result.structuredContent).toEqual(
        expect.objectContaining({
          response: expect.objectContaining({
            success: false,
            errorCodes: ['20000204037'],
          }),
        }),
      );
    });
  });

  describe('waybill_create_batch', () => {
    it('successfully creates multiple waybills', async () => {
      vi.mocked(context.client.waybill.createBatch).mockResolvedValue([
        {
          success: true,
          data: [{ Ref: 'doc-ref-1' }] as any,
          errors: [],
          warnings: [],
          info: [],
          messageCodes: [],
          errorCodes: [],
          warningCodes: [],
          infoCodes: [],
        },
        {
          success: true,
          data: [{ Ref: 'doc-ref-2' }] as any,
          errors: [],
          warnings: [],
          info: [],
          messageCodes: [],
          errorCodes: [],
          warningCodes: [],
          infoCodes: [],
        },
      ]);

      const result = await handleWaybillTool(
        'waybill_create_batch',
        {
          requests: [
            {
              payerType: 'Sender',
              paymentMethod: 'Cash',
              CargoType: 'Parcel',
              ServiceType: 'WarehouseWarehouse',
            } as any,
            {
              payerType: 'Sender',
              paymentMethod: 'Cash',
              CargoType: 'Parcel',
              ServiceType: 'WarehouseWarehouse',
            } as any,
          ],
        },
        context,
      );

      expect(result.isError).toBeUndefined();
      expect(context.client.waybill.createBatch).toHaveBeenCalled();
    });

    it('requires at least one request', async () => {
      const result = await handleWaybillTool('waybill_create_batch', { requests: [] }, context);
      expect(result.isError).toBe(true);
    });
  });

  describe('waybill_delete_batch', () => {
    it('successfully deletes multiple waybills', async () => {
      vi.mocked(context.client.waybill.deleteBatch).mockResolvedValue({
        success: true,
        data: [{ Ref: 'doc-ref-1' }, { Ref: 'doc-ref-2' }] as any,
        errors: [],
        warnings: [],
        info: [],
        messageCodes: [],
        errorCodes: [],
        warningCodes: [],
        infoCodes: [],
      });

      const result = await handleWaybillTool(
        'waybill_delete_batch',
        { documentRefs: ['doc-ref-1', 'doc-ref-2'] },
        context,
      );

      expect(result.isError).toBeUndefined();
      expect(context.client.waybill.deleteBatch).toHaveBeenCalledWith(['doc-ref-1', 'doc-ref-2']);
    });

    it('requires at least one document ref', async () => {
      const result = await handleWaybillTool('waybill_delete_batch', { documentRefs: [] }, context);
      expect(result.isError).toBe(true);
    });
  });
});
