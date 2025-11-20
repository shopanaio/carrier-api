import { createClient } from '../../src/core/client';
import { ReferenceService } from '../../src/services/referenceService';
import { createMockTransport } from '../mocks/transport';

describe('ReferenceService', () => {
  const baseUrl = 'https://api.novaposhta.ua/v2.0/json/';
  const apiKey = 'test-api-key';

  describe('getCargoTypes', () => {
    it('should call transport with correct parameters and return expected response', async () => {
      const mockData = [
        {
          Ref: 'cargo-type-ref-1',
          Description: 'Parcel',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new ReferenceService());

      const result = await client.reference.getCargoTypes();

      expect(calls).toHaveLength(1);
      expect(calls[0].url).toBe(baseUrl);
      expect(calls[0].body).toMatchObject({
        modelName: 'CommonGeneral',
        calledMethod: 'getCargoTypes',
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('getBackwardDeliveryCargoTypes', () => {
    it('should call transport with correct parameters and return expected response', async () => {
      const mockData = [
        {
          Ref: 'backward-cargo-ref-1',
          Description: 'Money',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new ReferenceService());

      const result = await client.reference.getBackwardDeliveryCargoTypes();

      expect(calls).toHaveLength(1);
      expect(calls[0].body).toMatchObject({
        modelName: 'CommonGeneral',
        calledMethod: 'getBackwardDeliveryCargoTypes',
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('getPalletsList', () => {
    it('should call transport with correct parameters and return expected response', async () => {
      const mockData = [
        {
          Ref: 'pallet-ref-1',
          Description: 'Euro Pallet',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new ReferenceService());

      const result = await client.reference.getPalletsList();

      expect(calls).toHaveLength(1);
      expect(calls[0].body).toMatchObject({
        modelName: 'CommonGeneral',
        calledMethod: 'getPalletsList',
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('getPackList', () => {
    it('should call transport with correct parameters and return expected response', async () => {
      const mockData = [
        {
          Ref: 'pack-ref-1',
          Description: 'Box',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new ReferenceService());

      const result = await client.reference.getPackList({ Length: 10, Width: 10, Height: 10 });

      expect(calls).toHaveLength(1);
      expect(calls[0].body).toMatchObject({
        modelName: 'CommonGeneral',
        calledMethod: 'getPackList',
        methodProperties: { Length: 10, Width: 10, Height: 10 },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('getTiresWheelsList', () => {
    it('should call transport with correct parameters and return expected response', async () => {
      const mockData = [
        {
          Ref: 'tire-ref-1',
          Description: 'Tire 205/55 R16',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new ReferenceService());

      const result = await client.reference.getTiresWheelsList();

      expect(calls).toHaveLength(1);
      expect(calls[0].body).toMatchObject({
        modelName: 'CommonGeneral',
        calledMethod: 'getTiresWheelsList',
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('getCargoDescriptionList', () => {
    it('should call transport with correct parameters and return expected response', async () => {
      const mockData = [
        {
          Ref: 'cargo-desc-ref-1',
          Description: 'Electronics',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new ReferenceService());

      const result = await client.reference.getCargoDescriptionList({ FindByString: 'Electronics' });

      expect(calls).toHaveLength(1);
      expect(calls[0].body).toMatchObject({
        modelName: 'CommonGeneral',
        calledMethod: 'getCargoDescriptionList',
        methodProperties: { FindByString: 'Electronics' },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('getMessageCodeText', () => {
    it('should call transport with correct parameters and return expected response', async () => {
      const mockData = [
        {
          MessageCode: '20000100140101',
          MessageText: 'Success',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new ReferenceService());

      const result = await client.reference.getMessageCodeText();

      expect(calls).toHaveLength(1);
      expect(calls[0].body).toMatchObject({
        modelName: 'CommonGeneral',
        calledMethod: 'getMessageCodeText',
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('getServiceTypes', () => {
    it('should call transport with correct parameters and return expected response', async () => {
      const mockData = [
        {
          Ref: 'service-type-ref-1',
          Description: 'Warehouse-Warehouse',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new ReferenceService());

      const result = await client.reference.getServiceTypes();

      expect(calls).toHaveLength(1);
      expect(calls[0].body).toMatchObject({
        modelName: 'CommonGeneral',
        calledMethod: 'getServiceTypes',
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('getOwnershipFormsList', () => {
    it('should call transport with correct parameters and return expected response', async () => {
      const mockData = [
        {
          Ref: 'ownership-ref-1',
          Description: 'Private Person',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new ReferenceService());

      const result = await client.reference.getOwnershipFormsList();

      expect(calls).toHaveLength(1);
      expect(calls[0].body).toMatchObject({
        modelName: 'CommonGeneral',
        calledMethod: 'getOwnershipFormsList',
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('getTimeIntervals', () => {
    it('should call transport with correct parameters and return expected response', async () => {
      const mockData = [
        {
          Number: '1',
          Start: '09:00',
          End: '12:00',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new ReferenceService());

      const result = await client.reference.getTimeIntervals({
        RecipientCityRef: 'city-ref-1',
        DateTime: '01.01.2024',
      });

      expect(calls).toHaveLength(1);
      expect(calls[0].body).toMatchObject({
        modelName: 'CommonGeneral',
        calledMethod: 'getTimeIntervals',
        methodProperties: {
          RecipientCityRef: 'city-ref-1',
          DateTime: '01.01.2024',
        },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });

    it('should map camelCase to PascalCase for API request', async () => {
      const mockData = [{ Number: '1', Start: '10:00', End: '14:00' }];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new ReferenceService());

      await client.reference.getTimeIntervals({
        RecipientCityRef: 'test-city-ref',
      });

      expect(calls[0].body.methodProperties).toHaveProperty('RecipientCityRef', 'test-city-ref');
      expect(calls[0].body.methodProperties).not.toHaveProperty('recipientCityRef');
      expect(calls[0].body.methodProperties).not.toHaveProperty('DateTime');
    });
  });

  describe('getTypesOfPayersForRedelivery', () => {
    it('should call transport with correct parameters and return expected response', async () => {
      const mockData = [
        {
          Ref: 'payer-ref-1',
          Description: 'Sender',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new ReferenceService());

      const result = await client.reference.getTypesOfPayersForRedelivery();

      expect(calls).toHaveLength(1);
      expect(calls[0].body).toMatchObject({
        modelName: 'CommonGeneral',
        calledMethod: 'getTypesOfPayersForRedelivery',
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('getPickupTimeIntervals', () => {
    it('should call transport with correct parameters and return expected response', async () => {
      const mockData = [
        {
          Number: '1',
          Start: '09:00',
          End: '12:00',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new ReferenceService());

      const result = await client.reference.getPickupTimeIntervals({ SenderCityRef: 'city-ref-1', DateTime: '01.01.2024' });

      expect(calls).toHaveLength(1);
      expect(calls[0].body).toMatchObject({
        modelName: 'CommonGeneral',
        calledMethod: 'getPickupTimeIntervals',
        methodProperties: {
          SenderCityRef: 'city-ref-1',
          DateTime: '01.01.2024',
        },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('getTypesOfPayers', () => {
    it('should call transport with correct parameters', async () => {
      const mockData = [
        {
          Ref: 'payer-sender',
          Description: 'Sender',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new ReferenceService());

      const result = await client.reference.getTypesOfPayers({ Language: 'ua' });

      expect(calls).toHaveLength(1);
      expect(calls[0].body).toMatchObject({
        modelName: 'CommonGeneral',
        calledMethod: 'getTypesOfPayers',
        methodProperties: { Language: 'ua' },
      });
      expect(result.data).toEqual(mockData);
    });
  });

  describe('getPaymentForms', () => {
    it('should call transport with correct parameters', async () => {
      const mockData = [
        {
          Ref: 'cash',
          Description: 'Готівка',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new ReferenceService());

      const result = await client.reference.getPaymentForms();

      expect(calls).toHaveLength(1);
      expect(calls[0].body).toMatchObject({
        modelName: 'CommonGeneral',
        calledMethod: 'getPaymentForms',
      });
      expect(result.data).toEqual(mockData);
    });
  });

  describe('getTypesOfCounterparties', () => {
    it('should call transport with correct parameters', async () => {
      const mockData = [
        {
          Ref: 'PrivatePerson',
          Description: 'Фізична особа',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new ReferenceService());

      const result = await client.reference.getTypesOfCounterparties();

      expect(calls).toHaveLength(1);
      expect(calls[0].body).toMatchObject({
        modelName: 'CommonGeneral',
        calledMethod: 'getTypesOfCounterparties',
      });
      expect(result.data).toEqual(mockData);
    });
  });
});
