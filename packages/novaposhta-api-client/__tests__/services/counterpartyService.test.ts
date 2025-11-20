import { createClient } from '../../src/core/client';
import { CounterpartyService } from '../../src/services/counterpartyService';
import { createMockTransport } from '../mocks/transport';

describe('CounterpartyService', () => {
  const baseUrl = 'https://api.novaposhta.ua/v2.0/json/';
  const apiKey = 'test-api-key';

  describe('getCounterparties', () => {
    it('should call API with mapped filters', async () => {
      const mockData = [
        {
          Ref: 'counterparty-ref',
          Description: 'Test Sender',
          City: 'city-ref',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new CounterpartyService());

      const result = await client.counterparty.getCounterparties({
        CounterpartyProperty: 'Sender',
        Page: 2,
        FindByString: 'shop',
        CityRef: 'city-ref',
      });

      expect(calls[0].body).toMatchObject({
        modelName: 'CounterpartyGeneral',
        calledMethod: 'getCounterparties',
        methodProperties: {
          CounterpartyProperty: 'Sender',
          Page: 2,
          FindByString: 'shop',
          CityRef: 'city-ref',
        },
      });
      expect(result.data).toEqual(mockData);
    });
  });

  describe('getCounterpartyAddresses', () => {
    it('should request addresses for provided counterparty', async () => {
      const mockData = [
        {
          Ref: 'address-ref',
          Description: 'Kyiv, Khreshchatyk 1',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new CounterpartyService());

      const result = await client.counterparty.getCounterpartyAddresses({
        Ref: 'counterparty-ref',
        CounterpartyProperty: 'Recipient',
        Page: 1,
      });

      expect(calls[0].body).toMatchObject({
        modelName: 'CounterpartyGeneral',
        calledMethod: 'getCounterpartyAddresses',
        methodProperties: {
          Ref: 'counterparty-ref',
          CounterpartyProperty: 'Recipient',
          Page: 1,
        },
      });
      expect(result.data).toEqual(mockData);
    });
  });

  describe('getCounterpartyContactPersons', () => {
    it('should request contact persons list', async () => {
      const mockData = [
        {
          Ref: 'contact-ref',
          Description: 'John Doe',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new CounterpartyService());

      const result = await client.counterparty.getCounterpartyContactPersons({
        Ref: 'counterparty-ref',
        Page: 3,
      });

      expect(calls[0].body).toMatchObject({
        modelName: 'CounterpartyGeneral',
        calledMethod: 'getCounterpartyContactPersons',
        methodProperties: {
          Ref: 'counterparty-ref',
          Page: 3,
        },
      });
      expect(result.data).toEqual(mockData);
    });
  });

  describe('save', () => {
    it('should create private person counterparty', async () => {
      const mockData = [
        {
          Ref: 'counterparty-ref',
          Description: 'Ivan Petrenko',
          ContactPerson: {
            data: [
              {
                Ref: 'contact-ref',
                Description: 'Ivan Petrenko',
              },
            ],
          },
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new CounterpartyService());

      const result = await client.counterparty.save({
        CounterpartyType: 'PrivatePerson',
        CounterpartyProperty: 'Recipient',
        FirstName: 'Іван',
        MiddleName: 'Іванович',
        LastName: 'Петренко',
        Phone: '380501234567',
        Email: 'ivan@example.com',
        CityRef: 'city-ref',
      });

      expect(calls[0].body).toMatchObject({
        modelName: 'CounterpartyGeneral',
        calledMethod: 'save',
        methodProperties: {
          CounterpartyType: 'PrivatePerson',
          CounterpartyProperty: 'Recipient',
          FirstName: 'Іван',
          MiddleName: 'Іванович',
          LastName: 'Петренко',
          Phone: '380501234567',
          Email: 'ivan@example.com',
          CityRef: 'city-ref',
        },
      });
      expect(result.data).toEqual(mockData);
    });

    it('should create organization counterparty', async () => {
      const mockData = [
        {
          Ref: 'counterparty-org-ref',
          Description: 'Test LLC',
          ContactPerson: {
            data: [
              {
                Ref: 'contact-ref',
                Description: 'Maria Kovalenko',
              },
            ],
          },
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new CounterpartyService());

      const result = await client.counterparty.save({
        CounterpartyType: 'Organization',
        CounterpartyProperty: 'Sender',
        FirstName: 'Марія',
        LastName: 'Коваленко',
        Phone: '380671234567',
        Email: 'contact@testllc.com',
        OwnershipForm: 'ТОВ',
        EDRPOU: '12345678',
        CityRef: 'city-ref',
      });

      expect(calls[0].body).toMatchObject({
        modelName: 'CounterpartyGeneral',
        calledMethod: 'save',
        methodProperties: {
          CounterpartyType: 'Organization',
          CounterpartyProperty: 'Sender',
          FirstName: 'Марія',
          LastName: 'Коваленко',
          Phone: '380671234567',
          Email: 'contact@testllc.com',
          OwnershipForm: 'ТОВ',
          EDRPOU: '12345678',
          CityRef: 'city-ref',
        },
      });
      expect(result.data).toEqual(mockData);
    });

    it('should create organization without contact person', async () => {
      const mockData = [
        {
          Ref: 'counterparty-org-ref',
          Description: 'Test LLC',
          ContactPerson: {
            data: [],
          },
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new CounterpartyService());

      const result = await client.counterparty.save({
        CounterpartyType: 'Organization',
        CounterpartyProperty: 'Sender',
        Phone: '380671234567',
        OwnershipForm: 'ТОВ',
        EDRPOU: '12345678',
      });

      expect(calls[0].body).toMatchObject({
        modelName: 'CounterpartyGeneral',
        calledMethod: 'save',
        methodProperties: {
          CounterpartyType: 'Organization',
          CounterpartyProperty: 'Sender',
          Phone: '380671234567',
          OwnershipForm: 'ТОВ',
          EDRPOU: '12345678',
        },
      });
      // Should not include FirstName, LastName if not provided
      expect(calls[0].body.methodProperties).not.toHaveProperty('FirstName');
      expect(calls[0].body.methodProperties).not.toHaveProperty('LastName');
      expect(result.data).toEqual(mockData);
    });
  });

  describe('update', () => {
    it('should send only provided fields', async () => {
      const mockData = [
        {
          Ref: 'counterparty-ref',
          Description: 'Updated name',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new CounterpartyService());

      const result = await client.counterparty.update({
        Ref: 'counterparty-ref',
        CounterpartyProperty: 'Sender',
        Phone: '380671112233',
      });

      expect(calls[0].body).toMatchObject({
        modelName: 'CounterpartyGeneral',
        calledMethod: 'update',
        methodProperties: {
          Ref: 'counterparty-ref',
          CounterpartyProperty: 'Sender',
          Phone: '380671112233',
        },
      });
      expect(result.data).toEqual(mockData);
    });
  });

  describe('delete', () => {
    it('should call delete with Ref', async () => {
      const mockData = [
        {
          Ref: 'counterparty-ref',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new CounterpartyService());

      const result = await client.counterparty.delete({ Ref: 'counterparty-ref' });

      expect(calls[0].body).toMatchObject({
        modelName: 'CounterpartyGeneral',
        calledMethod: 'delete',
        methodProperties: { Ref: 'counterparty-ref' },
      });
      expect(result.data).toEqual(mockData);
    });
  });

  describe('getCounterpartyOptions', () => {
    it('should fetch options for counterparty', async () => {
      const mockData = [
        {
          CanPayTheThirdPerson: '1',
          DebtorParams: {
            DayDelay: '0',
            DebtCurrency: 'UAH',
            Debt: '0',
            OverdueDebt: '0',
          },
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new CounterpartyService());

      const result = await client.counterparty.getCounterpartyOptions({ Ref: 'counterparty-ref' });

      expect(calls[0].body).toMatchObject({
        modelName: 'CounterpartyGeneral',
        calledMethod: 'getCounterpartyOptions',
        methodProperties: { Ref: 'counterparty-ref' },
      });
      expect(result.data).toEqual(mockData);
    });
  });
});
