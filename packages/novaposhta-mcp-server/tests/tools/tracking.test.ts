import { describe, expect, it, vi, beforeEach } from 'vitest';

import { handleTrackingTool, getTrackingTools } from '../../src/tools/tracking.js';
import type { ToolContext } from '../../src/types/mcp.js';

const baseContext: ToolContext = {
  client: {
    tracking: {
      trackDocument: vi.fn(),
      trackDocuments: vi.fn(),
      getDocumentMovement: vi.fn(),
      getDocumentList: vi.fn(),
    },
    address: {} as any,
    reference: {} as any,
    waybill: {} as any,
  },
  config: {
    apiKey: 'test',
    baseUrl: 'https://example.com',
    logLevel: 'debug',
    timeout: 1000,
  },
};

describe('tracking tools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes four tracking tools', () => {
    expect(getTrackingTools()).toHaveLength(4);
  });

  describe('track_document', () => {
    it('successfully tracks a document', async () => {
      vi.mocked(baseContext.client.tracking.trackDocument).mockResolvedValue({
        Number: '20400048799000',
        Status: 'Delivered',
        StatusCode: '9',
        CityRecipient: 'Київ',
        WarehouseRecipient: 'Відділення №1',
        ScheduledDeliveryDate: '19.11.2024',
        ActualDeliveryDate: '19.11.2024',
        RecipientDateTime: '19.11.2024 14:30',
        DocumentWeight: '1.5',
        DocumentCost: '500',
      } as any);

      const result = await handleTrackingTool(
        'track_document',
        { documentNumber: '20400048799000' },
        baseContext,
      );

      expect(result.isError).toBeFalsy();
      expect(result.content[0]?.type).toBe('text');
      const text = (result.content[0] as any).text;
      expect(text).toContain('20400048799000');
      expect(text).toContain('Delivered');
    });

    it('fails validation for invalid tracking number', async () => {
      const result = await handleTrackingTool('track_document', { documentNumber: '123' }, baseContext);

      expect(result.isError).toBe(true);
      expect(result.content[0]?.type).toBe('text');
      const text = (result.content[0] as any).text;
      expect(text).toContain('14-digit');
    });

    it('sanitizes and validates phone numbers', async () => {
      vi.mocked(baseContext.client.tracking.trackDocument).mockResolvedValue({
        Number: '20400048799000',
        Status: 'In Transit',
      } as any);

      const result = await handleTrackingTool(
        'track_document',
        { documentNumber: '20400048799000', phone: '+380501234567' },
        baseContext,
      );

      expect(result.isError).toBeFalsy();
      expect(baseContext.client.tracking.trackDocument).toHaveBeenCalledWith('20400048799000', '380501234567');
    });

    it('returns not found message when document is not found', async () => {
      vi.mocked(baseContext.client.tracking.trackDocument).mockResolvedValue(null);

      const result = await handleTrackingTool(
        'track_document',
        { documentNumber: '20400048799000' },
        baseContext,
      );

      expect(result.isError).toBeFalsy();
      const text = (result.content[0] as any).text;
      expect(text).toContain('not found');
    });
  });

  describe('track_multiple_documents', () => {
    it('successfully tracks multiple documents', async () => {
      vi.mocked(baseContext.client.tracking.trackDocuments).mockResolvedValue({
        success: true,
        data: [
          { Number: '20400048799000', Status: 'Delivered' },
          { Number: '20400048799001', Status: 'In Transit' },
        ] as any,
        errors: [],
        warnings: [],
        info: [],
        messageCodes: [],
        errorCodes: [],
        warningCodes: [],
        infoCodes: [],
      });

      const result = await handleTrackingTool(
        'track_multiple_documents',
        { documentNumbers: ['20400048799000', '20400048799001'] },
        baseContext,
      );

      expect(result.isError).toBeFalsy();
      const text = (result.content[0] as any).text;
      expect(text).toContain('tracked');
      expect(text).toContain('2');
    });

    it('fails when no tracking numbers provided', async () => {
      const result = await handleTrackingTool('track_multiple_documents', { documentNumbers: [] }, baseContext);

      expect(result.isError).toBe(true);
      const text = (result.content[0] as any).text;
      expect(text).toContain('at least one');
    });

    it('validates all tracking numbers', async () => {
      const result = await handleTrackingTool(
        'track_multiple_documents',
        { documentNumbers: ['20400048799000', 'invalid'] },
        baseContext,
      );

      expect(result.isError).toBe(true);
      const text = (result.content[0] as any).text;
      expect(text).toContain('Invalid tracking number');
    });
  });

  describe('get_document_movement', () => {
    it('successfully gets document movement', async () => {
      vi.mocked(baseContext.client.tracking.getDocumentMovement).mockResolvedValue({
        success: true,
        data: [
          {
            Number: '20400048799000',
            DocumentNumber: '20400048799000',
            MovementHistory: [],
          },
        ] as any,
        errors: [],
        warnings: [],
        info: [],
        messageCodes: [],
        errorCodes: [],
        warningCodes: [],
        infoCodes: [],
      });

      const result = await handleTrackingTool(
        'get_document_movement',
        { documentNumbers: ['20400048799000'], showDeliveryDetails: true },
        baseContext,
      );

      expect(result.isError).toBeFalsy();
      expect(baseContext.client.tracking.getDocumentMovement).toHaveBeenCalledWith({
        documents: [{ documentNumber: '20400048799000' }],
        showDeliveryDetails: true,
      });
    });
  });

  describe('get_document_list', () => {
    it('successfully gets document list', async () => {
      vi.mocked(baseContext.client.tracking.getDocumentList).mockResolvedValue({
        success: true,
        data: [{ IntDocNumber: '20400048799000' }] as any,
        errors: [],
        warnings: [],
        info: [],
        messageCodes: [],
        errorCodes: [],
        warningCodes: [],
        infoCodes: [],
      });

      const result = await handleTrackingTool(
        'get_document_list',
        {
          dateTimeFrom: '01.11.2024',
          dateTimeTo: '19.11.2024',
          page: 1,
        },
        baseContext,
      );

      expect(result.isError).toBeFalsy();
    });

    it('validates date format', async () => {
      const result = await handleTrackingTool(
        'get_document_list',
        {
          dateTimeFrom: '2024-11-01',
          dateTimeTo: '19.11.2024',
        },
        baseContext,
      );

      expect(result.isError).toBe(true);
      const text = (result.content[0] as any).text;
      expect(text).toContain('dd.mm.yyyy');
    });

    it('validates date ranges', async () => {
      const result = await handleTrackingTool(
        'get_document_list',
        {
          dateTimeFrom: '32.11.2024',
          dateTimeTo: '19.11.2024',
        },
        baseContext,
      );

      expect(result.isError).toBe(true);
    });
  });
});
