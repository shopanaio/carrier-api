import { createClient } from '../../src/core/client';
import { TrackingService } from '../../src/services/trackingService';
import { createMockTransport } from '../mocks/transport';

describe('TrackingService', () => {
  const baseUrl = 'https://api.novaposhta.ua/v2.0/json/';
  const apiKey = 'test-api-key';

  describe('trackDocument', () => {
    it('should call transport with correct parameters and return expected response', async () => {
      const mockData = [
        {
          Number: '20400048799000',
          Status: 'Delivered',
          StatusCode: '9',
          DateCreated: '01.01.2024',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new TrackingService());

      const result = await client.tracking.trackDocument('20400048799000');

      expect(calls).toHaveLength(1);
      expect(calls[0].url).toBe(baseUrl);
      expect(calls[0].body).toMatchObject({
        modelName: 'TrackingDocumentGeneral',
        calledMethod: 'getStatusDocuments',
        methodProperties: {
          Documents: [{ DocumentNumber: '20400048799000' }],
        },
      });
      expect(result).toEqual(mockData[0]);
    });

    it('should return null if no tracking data found', async () => {
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: [] });

      const client = createClient({ transport, baseUrl, apiKey }).use(new TrackingService());

      const result = await client.tracking.trackDocument('invalid-number');

      expect(calls).toHaveLength(1);
      expect(result).toBeNull();
    });
  });

  describe('trackDocuments', () => {
    it('should call transport with correct parameters and return expected response', async () => {
      const mockData = [
        {
          Number: '20400048799000',
          Status: 'Delivered',
          StatusCode: '9',
        },
        {
          Number: '20400048799001',
          Status: 'In Transit',
          StatusCode: '5',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new TrackingService());

      const result = await client.tracking.trackDocuments({
        Documents: [{ DocumentNumber: '20400048799000' }, { DocumentNumber: '20400048799001' }],
      });

      expect(calls).toHaveLength(1);
      expect(calls[0].body).toMatchObject({
        modelName: 'TrackingDocumentGeneral',
        calledMethod: 'getStatusDocuments',
        methodProperties: {
          Documents: [{ DocumentNumber: '20400048799000' }, { DocumentNumber: '20400048799001' }],
        },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });

    it('should handle phone number tracking', async () => {
      const mockData = [
        {
          Number: '20400048799000',
          Status: 'Delivered',
          StatusCode: '9',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new TrackingService());

      const result = await client.tracking.trackDocuments({
        Documents: [{ DocumentNumber: '20400048799000', Phone: '380501234567' }],
      });

      expect(calls).toHaveLength(1);
      expect(calls[0].body).toMatchObject({
        modelName: 'TrackingDocumentGeneral',
        calledMethod: 'getStatusDocuments',
        methodProperties: {
          Documents: [{ DocumentNumber: '20400048799000', Phone: '380501234567' }],
        },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('getDocumentList', () => {
    it('should call transport with correct parameters and return expected response', async () => {
      const mockData = [
        {
          Ref: 'doc-ref-1',
          IntDocNumber: '20400048799000',
          DateTime: '01.01.2024',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new TrackingService());

      const result = await client.tracking.getDocumentList({ DateTimeFrom: '01.01.2024', DateTimeTo: '31.01.2024' });

      expect(calls).toHaveLength(1);
      expect(calls[0].body).toMatchObject({
        modelName: 'InternetDocumentGeneral',
        calledMethod: 'getDocumentList',
        methodProperties: {
          DateTimeFrom: '01.01.2024',
          DateTimeTo: '31.01.2024',
        },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('calculateStatistics', () => {
    it('should calculate statistics from tracking data', () => {
      const client = createClient({ transport: createMockTransport().transport, baseUrl, apiKey }).use(
        new TrackingService(),
      );

      const mockTrackingData = [
        { StatusCode: 9, DateCreated: '01.01.2024', CitySender: 'Kyiv', CityRecipient: 'Lviv' } as any,
        { StatusCode: 5, DateCreated: '02.01.2024', CitySender: 'Kyiv', CityRecipient: 'Odesa' } as any,
        { StatusCode: 7, DateCreated: '03.01.2024', CitySender: 'Kharkiv', CityRecipient: 'Dnipro' } as any,
      ];

      const result = client.tracking.calculateStatistics(mockTrackingData);

      expect(result.totalTracked).toBe(3);
      expect(result.delivered).toBe(1);
      expect(result.inTransit).toBe(1);
      expect(result.atWarehouse).toBe(1);
    });

    it('should calculate failed deliveries', () => {
      const client = createClient({ transport: createMockTransport().transport, baseUrl, apiKey }).use(
        new TrackingService(),
      );

      const mockTrackingData = [
        { StatusCode: 102, DateCreated: '01.01.2024', CitySender: 'Kyiv', CityRecipient: 'Lviv' } as any,
        { StatusCode: 103, DateCreated: '02.01.2024', CitySender: 'Kyiv', CityRecipient: 'Odesa' } as any,
      ];

      const result = client.tracking.calculateStatistics(mockTrackingData);

      expect(result.totalTracked).toBe(2);
      expect(result.failed).toBe(2);
    });

    it('should calculate unknown statuses', () => {
      const client = createClient({ transport: createMockTransport().transport, baseUrl, apiKey }).use(
        new TrackingService(),
      );

      const mockTrackingData = [
        { StatusCode: 999, DateCreated: '01.01.2024', CitySender: 'Kyiv', CityRecipient: 'Lviv' } as any,
        { StatusCode: 1000, DateCreated: '02.01.2024', CitySender: 'Kyiv', CityRecipient: 'Odesa' } as any,
      ];

      const result = client.tracking.calculateStatistics(mockTrackingData);

      expect(result.totalTracked).toBe(2);
      expect(result.unknown).toBe(2);
    });
  });

  describe('getDocumentMovement', () => {
    it('should call transport with correct parameters and return expected response', async () => {
      const mockData = [
        {
          Number: '20400048799000',
          DocumentCost: '1000',
          RecipientDateTime: '01.01.2024',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new TrackingService());

      const result = await client.tracking.getDocumentMovement({
        Documents: [{ DocumentNumber: '20400048799000' }],
        ShowDeliveryDetails: true,
      });

      expect(calls).toHaveLength(1);
      expect(calls[0].body).toMatchObject({
        modelName: 'TrackingDocumentGeneral',
        calledMethod: 'getStatusDocuments',
        methodProperties: {
          Documents: [{ DocumentNumber: '20400048799000' }],
        },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('trackMultiple', () => {
    it('should track multiple documents and return organized results', async () => {
      const mockData = [
        {
          Number: '20400048799000',
          Status: 'Delivered',
          StatusCode: '9',
          DateCreated: '01.01.2024',
          CitySender: 'Kyiv',
          CityRecipient: 'Lviv',
        },
        {
          Number: '20400048799001',
          Status: 'In Transit',
          StatusCode: '5',
          DateCreated: '02.01.2024',
          CitySender: 'Kyiv',
          CityRecipient: 'Odesa',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new TrackingService());

      const result = await client.tracking.trackMultiple(['20400048799000', '20400048799001']);

      expect(calls).toHaveLength(1);
      expect(result.successful).toHaveLength(2);
      expect(result.failed).toHaveLength(0);
      expect(result.statistics.totalTracked).toBe(2);
    });

    it('should handle failed tracking request', async () => {
      const { transport, setResponse } = createMockTransport();
      setResponse({ success: false, data: [] });

      const client = createClient({ transport, baseUrl, apiKey }).use(new TrackingService());

      const result = await client.tracking.trackMultiple(['20400048799000', '20400048799001']);

      expect(result.successful).toHaveLength(0);
      expect(result.failed).toHaveLength(2);
      expect(result.statistics.totalTracked).toBe(0);
    });

    it('should handle partial success with some not found documents', async () => {
      const mockData = [
        {
          Number: '20400048799000',
          Status: 'Delivered',
          StatusCode: 9,
          DateCreated: '01.01.2024',
          CitySender: 'Kyiv',
          CityRecipient: 'Lviv',
        },
        null,
      ];
      const { transport, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new TrackingService());

      const result = await client.tracking.trackMultiple(['20400048799000', '20400048799001']);

      expect(result.successful).toHaveLength(1);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0]).toBe('20400048799001');
    });
  });

  describe('filterTrackingResults', () => {
    it('should filter results by status', () => {
      const client = createClient({ transport: createMockTransport().transport, baseUrl, apiKey }).use(
        new TrackingService(),
      );

      const mockResults = [
        { StatusCode: 9, DateCreated: '01.01.2024', CitySender: 'Kyiv', CityRecipient: 'Lviv' } as any,
        { StatusCode: 5, DateCreated: '02.01.2024', CitySender: 'Kyiv', CityRecipient: 'Odesa' } as any,
      ];

      const filtered = client.tracking.filterTrackingResults(mockResults, { status: [9] });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].StatusCode).toBe(9);
    });

    it('should filter results by city', () => {
      const client = createClient({ transport: createMockTransport().transport, baseUrl, apiKey }).use(
        new TrackingService(),
      );

      const mockResults = [
        { StatusCode: 9, DateCreated: '01.01.2024', CitySender: 'Kyiv', CityRecipient: 'Lviv' } as any,
        { StatusCode: 5, DateCreated: '02.01.2024', CitySender: 'Kharkiv', CityRecipient: 'Odesa' } as any,
      ];

      const filtered = client.tracking.filterTrackingResults(mockResults, { citySender: 'Kyiv' });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].CitySender).toBe('Kyiv');
    });

    it('should filter results by date range', () => {
      const client = createClient({ transport: createMockTransport().transport, baseUrl, apiKey }).use(
        new TrackingService(),
      );

      const mockResults = [
        { StatusCode: 9, DateCreated: '2024-01-01', CitySender: 'Kyiv', CityRecipient: 'Lviv' } as any,
        { StatusCode: 5, DateCreated: '2024-01-10', CitySender: 'Kharkiv', CityRecipient: 'Odesa' } as any,
      ];

      const filtered = client.tracking.filterTrackingResults(mockResults, {
        dateFrom: '2024-01-05',
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].StatusCode).toBe(5);
    });

    it('should filter results by recipient city', () => {
      const client = createClient({ transport: createMockTransport().transport, baseUrl, apiKey }).use(
        new TrackingService(),
      );

      const mockResults = [
        { StatusCode: 9, DateCreated: '01.01.2024', CitySender: 'Kyiv', CityRecipient: 'Lviv' } as any,
        { StatusCode: 5, DateCreated: '02.01.2024', CitySender: 'Kharkiv', CityRecipient: 'Odesa' } as any,
      ];

      const filtered = client.tracking.filterTrackingResults(mockResults, { cityRecipient: 'Lviv' });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].CityRecipient).toBe('Lviv');
    });

    it('should return empty array when no results match filter', () => {
      const client = createClient({ transport: createMockTransport().transport, baseUrl, apiKey }).use(
        new TrackingService(),
      );

      const mockResults = [
        { StatusCode: 9, DateCreated: '01.01.2024', CitySender: 'Kyiv', CityRecipient: 'Lviv' } as any,
      ];

      const filtered = client.tracking.filterTrackingResults(mockResults, { status: [5] });

      expect(filtered).toHaveLength(0);
    });
  });

  describe('isDelivered', () => {
    it('should return true for delivered status', () => {
      const client = createClient({ transport: createMockTransport().transport, baseUrl, apiKey }).use(
        new TrackingService(),
      );

      const status = { StatusCode: 9 } as any;
      expect(client.tracking.isDelivered(status)).toBe(true);
    });

    it('should return false for non-delivered status', () => {
      const client = createClient({ transport: createMockTransport().transport, baseUrl, apiKey }).use(
        new TrackingService(),
      );

      const status = { StatusCode: 5 } as any;
      expect(client.tracking.isDelivered(status)).toBe(false);
    });
  });

  describe('isInTransit', () => {
    it('should return true for in-transit status', () => {
      const client = createClient({ transport: createMockTransport().transport, baseUrl, apiKey }).use(
        new TrackingService(),
      );

      const status = { StatusCode: 5 } as any;
      expect(client.tracking.isInTransit(status)).toBe(true);
    });

    it('should return false for non-transit status', () => {
      const client = createClient({ transport: createMockTransport().transport, baseUrl, apiKey }).use(
        new TrackingService(),
      );

      const status = { StatusCode: 9 } as any;
      expect(client.tracking.isInTransit(status)).toBe(false);
    });
  });

  describe('isAtWarehouse', () => {
    it('should return true for warehouse status', () => {
      const client = createClient({ transport: createMockTransport().transport, baseUrl, apiKey }).use(
        new TrackingService(),
      );

      const status = { StatusCode: 7 } as any;
      expect(client.tracking.isAtWarehouse(status)).toBe(true);
    });

    it('should return false for non-warehouse status', () => {
      const client = createClient({ transport: createMockTransport().transport, baseUrl, apiKey }).use(
        new TrackingService(),
      );

      const status = { StatusCode: 9 } as any;
      expect(client.tracking.isAtWarehouse(status)).toBe(false);
    });
  });

  describe('getStatusDescription', () => {
    it('should return status description in Ukrainian', () => {
      const client = createClient({ transport: createMockTransport().transport, baseUrl, apiKey }).use(
        new TrackingService(),
      );

      const description = client.tracking.getStatusDescription(9, 'ua');
      expect(description).toBe('Отримано');
    });

    it('should return status description in English', () => {
      const client = createClient({ transport: createMockTransport().transport, baseUrl, apiKey }).use(
        new TrackingService(),
      );

      const description = client.tracking.getStatusDescription(9, 'en');
      expect(description).toBe('Delivered');
    });

    it('should return unknown status for undefined status', () => {
      const client = createClient({ transport: createMockTransport().transport, baseUrl, apiKey }).use(
        new TrackingService(),
      );

      const description = client.tracking.getStatusDescription(999 as any, 'ua');
      expect(description).toContain('Unknown status');
    });
  });

  describe('monitorDocuments', () => {
    it('should call callback with tracking data', async () => {
      const mockData = [
        {
          Number: '20400048799000',
          Status: 'Delivered',
          StatusCode: '9',
          DateCreated: '01.01.2024',
          CitySender: 'Kyiv',
          CityRecipient: 'Lviv',
        },
      ];
      const { transport, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new TrackingService());

      const callback = jest.fn();
      const stopMonitoring = await client.tracking.monitorDocuments(['20400048799000'], callback, 100);

      expect(callback).toHaveBeenCalledWith(mockData);

      stopMonitoring();
    });
  });
});
