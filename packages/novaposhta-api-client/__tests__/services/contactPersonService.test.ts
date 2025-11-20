import { createClient } from '../../src/core/client';
import { ContactPersonService } from '../../src/services/contactPersonService';
import { createMockTransport } from '../mocks/transport';

describe('ContactPersonService', () => {
  const baseUrl = 'https://api.novaposhta.ua/v2.0/json/';
  const apiKey = 'test-api-key';

  describe('save', () => {
    it('should map fields to PascalCase', async () => {
      const mockData = [
        {
          Ref: 'contact-ref',
          Description: 'Марія Коваленко',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new ContactPersonService());

      const result = await client.contactPerson.save({
        CounterpartyRef: 'counterparty-ref',
        FirstName: 'Марія',
        MiddleName: 'Іванівна',
        LastName: 'Коваленко',
        Phone: '380671234567',
        Email: 'maria@example.com',
      });

      expect(calls[0].body).toMatchObject({
        modelName: 'ContactPersonGeneral',
        calledMethod: 'save',
        methodProperties: {
          CounterpartyRef: 'counterparty-ref',
          FirstName: 'Марія',
          MiddleName: 'Іванівна',
          LastName: 'Коваленко',
          Phone: '380671234567',
          Email: 'maria@example.com',
        },
      });
      expect(result.data).toEqual(mockData);
    });
  });

  describe('update', () => {
    it('should send provided fields', async () => {
      const mockData = [
        {
          Ref: 'contact-ref',
          Description: 'Updated contact',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new ContactPersonService());

      const result = await client.contactPerson.update({
        Ref: 'contact-ref',
        CounterpartyRef: 'counterparty-ref',
        Phone: '380501111111',
      });

      expect(calls[0].body).toMatchObject({
        modelName: 'ContactPersonGeneral',
        calledMethod: 'update',
        methodProperties: {
          Ref: 'contact-ref',
          CounterpartyRef: 'counterparty-ref',
          Phone: '380501111111',
        },
      });
      expect(result.data).toEqual(mockData);
    });
  });

  describe('delete', () => {
    it('should pass contact and counterparty references', async () => {
      const mockData = [
        {
          Ref: 'contact-ref',
        },
      ];
      const { transport, calls, setResponse } = createMockTransport();
      setResponse({ success: true, data: mockData });

      const client = createClient({ transport, baseUrl, apiKey }).use(new ContactPersonService());

      const result = await client.contactPerson.delete({
        Ref: 'contact-ref',
        CounterpartyRef: 'counterparty-ref',
      });

      expect(calls[0].body).toMatchObject({
        modelName: 'ContactPersonGeneral',
        calledMethod: 'delete',
        methodProperties: {
          Ref: 'contact-ref',
          CounterpartyRef: 'counterparty-ref',
        },
      });
      expect(result.data).toEqual(mockData);
    });
  });
});
