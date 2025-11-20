import { createClient } from '../../src/core/client';
import { AddressService } from '../../src/services/addressService';
import { createMockTransport } from '../mocks/transport';

describe('AddressService', () => {
  const baseUrl = 'https://api.novaposhta.ua/v2.0/json/';
  const apiKey = 'test-api-key';

  describe('getCities', () => {
    it('should call transport with correct parameters', async () => {
      const mockData = [
        {
          Ref: 'city-ref-1',
          Description: 'Kyiv',
          DescriptionRu: 'Киев',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new AddressService());

      const result = await client.address.getCities({ FindByString: 'Kyiv' });

      expect(calls).toHaveLength(1);
      expect(calls[0].url).toBe(baseUrl);
      expect(calls[0].body).toMatchObject({
        modelName: 'AddressGeneral',
        calledMethod: 'getCities',
        methodProperties: { FindByString: 'Kyiv' },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });

    it('should transform page and limit parameters correctly', async () => {
      const mockData = [
        {
          Ref: 'city-ref-1',
          Description: 'Kyiv',
          DescriptionRu: 'Киев',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new AddressService());

      const result = await client.address.getCities({ FindByString: 'Kyiv', Page: 1, Limit: 10 });

      expect(calls).toHaveLength(1);
      expect(calls[0].body).toMatchObject({
        modelName: 'AddressGeneral',
        calledMethod: 'getCities',
        methodProperties: { FindByString: 'Kyiv', Page: 1, Limit: 10 },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('getSettlements', () => {
    it('should call transport with correct parameters', async () => {
      const mockData = [
        {
          Ref: 'settlement-ref-1',
          Description: 'Kyiv Oblast',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new AddressService());

      const result = await client.address.getSettlements({ Ref: 'area-ref-1' });

      expect(calls).toHaveLength(1);
      expect(calls[0].body).toMatchObject({
        modelName: 'AddressGeneral',
        calledMethod: 'getSettlementAreas',
        methodProperties: { Ref: 'area-ref-1' },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('searchSettlements', () => {
    it('should call transport with correct parameters', async () => {
      const mockData = [
        {
          Present: 'Kyiv, Ukraine',
          MainDescription: 'Kyiv',
          Area: 'Kyiv Oblast',
          Region: 'Kyiv Region',
          SettlementTypeCode: 'City',
          Ref: 'settlement-ref-1',
          DeliveryCity: 'city-ref-1',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new AddressService());

      const result = await client.address.searchSettlements({ CityName: 'Kyiv', Page: 1, Limit: 10 });

      expect(calls).toHaveLength(1);
      expect(calls[0].body).toMatchObject({
        modelName: 'AddressGeneral',
        calledMethod: 'searchSettlements',
        methodProperties: { CityName: 'Kyiv', Page: 1, Limit: 10 },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('searchSettlementStreets', () => {
    it('should call transport with correct parameters', async () => {
      const mockData = [
        {
          Present: 'Khreshchatyk St.',
          Ref: 'street-ref-1',
          StreetsType: 'Street',
          StreetsTypeDescription: 'Street',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new AddressService());

      const result = await client.address.searchSettlementStreets({
        StreetName: 'Khreshchatyk',
        SettlementRef: 'settlement-ref-1',
        Limit: 10,
      });

      expect(calls).toHaveLength(1);
      expect(calls[0].body).toMatchObject({
        modelName: 'AddressGeneral',
        calledMethod: 'searchSettlementStreets',
        methodProperties: {
          StreetName: 'Khreshchatyk',
          SettlementRef: 'settlement-ref-1',
          Limit: 10,
        },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('getStreet', () => {
    it('should call transport with correct parameters', async () => {
      const mockData = [
        {
          Ref: 'street-ref-1',
          Description: 'Khreshchatyk',
          StreetsType: 'Street',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new AddressService());

      const result = await client.address.getStreet({ CityRef: 'city-ref-1', FindByString: 'Khreshchatyk' });

      expect(calls).toHaveLength(1);
      expect(calls[0].body).toMatchObject({
        modelName: 'AddressGeneral',
        calledMethod: 'getStreet',
        methodProperties: {
          CityRef: 'city-ref-1',
          FindByString: 'Khreshchatyk',
        },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('getSettlementCountryRegion', () => {
    it('should call transport with correct parameters', async () => {
      const mockData = [
        {
          Ref: 'region-ref-1',
          Description: 'Kyiv Region',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new AddressService());

      const result = await client.address.getSettlementCountryRegion({ AreaRef: 'area-ref-1' });

      expect(calls).toHaveLength(1);
      expect(calls[0].body).toMatchObject({
        modelName: 'AddressGeneral',
        calledMethod: 'getSettlementCountryRegion',
        methodProperties: { AreaRef: 'area-ref-1' },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('save', () => {
    it('should map request fields to PascalCase', async () => {
      const mockData = [
        {
          Ref: 'address-ref',
          Description: 'Kyiv, Khreshchatyk 1',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new AddressService());

      const result = await client.address.save({
        CounterpartyRef: 'counterparty-ref',
        StreetRef: 'street-ref',
        BuildingNumber: '1',
        Flat: '5',
        Note: 'Door code 123',
      });

      expect(calls).toHaveLength(1);
      expect(calls[0].body).toMatchObject({
        modelName: 'AddressGeneral',
        calledMethod: 'save',
        methodProperties: {
          CounterpartyRef: 'counterparty-ref',
          StreetRef: 'street-ref',
          BuildingNumber: '1',
          Flat: '5',
          Note: 'Door code 123',
        },
      });
      expect(result.data).toEqual(mockData);
    });
  });

  describe('update', () => {
    it('should forward address reference and other fields', async () => {
      const mockData = [
        {
          Ref: 'address-ref',
          Description: 'Updated address',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new AddressService());

      const result = await client.address.update({
        Ref: 'address-ref',
        CounterpartyRef: 'counterparty-ref',
        StreetRef: 'street-ref',
        BuildingNumber: '10',
        Note: 'updated note',
      });

      expect(calls[0].body).toMatchObject({
        modelName: 'AddressGeneral',
        calledMethod: 'update',
        methodProperties: {
          Ref: 'address-ref',
          CounterpartyRef: 'counterparty-ref',
          StreetRef: 'street-ref',
          BuildingNumber: '10',
          Note: 'updated note',
        },
      });
      expect(result.data).toEqual(mockData);
    });
  });

  describe('delete', () => {
    it('should call delete with address reference', async () => {
      const mockData = [
        {
          Ref: 'address-ref',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new AddressService());

      const result = await client.address.delete({ Ref: 'address-ref' });

      expect(calls[0].body).toMatchObject({
        modelName: 'AddressGeneral',
        calledMethod: 'delete',
        methodProperties: { Ref: 'address-ref' },
      });
      expect(result.data).toEqual(mockData);
    });
  });
});
