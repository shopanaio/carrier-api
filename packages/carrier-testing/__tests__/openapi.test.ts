import { contractFromOpenApi, defineContract } from '../src';
import type { OpenApiDocument } from '../src';

const doc: OpenApiDocument = {
  openapi: '3.0.1',
  info: { title: 'ukrposhta-ecom', version: '0.0.1' },
  servers: [{ url: 'https://dev.ukrposhta.ua/ecom/0.0.1' }],
  paths: {
    '/shipments/{uuid}': {
      parameters: [{ $ref: '#/components/parameters/Uuid' } as never, { name: 'token', in: 'query', required: true, schema: { type: 'string' } }],
      get: {
        operationId: 'getShipment',
        parameters: [{ name: 'X-Trace', in: 'header', schema: { type: 'string' } }],
        responses: { '200': { $ref: '#/components/responses/Shipment' }, '404': { description: 'nf' } },
      },
      delete: { responses: { '200': { content: { 'application/pdf': {} } } } },
    },
    '/shipments': {
      post: {
        operationId: 'createShipment',
        requestBody: { $ref: '#/components/requestBodies/NewShipment' },
        responses: { '200': { content: { 'application/json': { schema: { $ref: '#/components/schemas/Shipment' } } } } },
      },
    },
    '/form': { post: { operationId: 'form', requestBody: { content: { 'application/x-www-form-urlencoded': { schema: { type: 'object' } } } } } },
    '/xml': { post: { operationId: 'xml', requestBody: { content: { 'text/xml': {} } } } },
    '/upload': { put: { operationId: 'upload', requestBody: { content: { 'application/octet-stream': {} } } } },
    '/empty': { post: { operationId: 'empty', requestBody: {} } },
  },
  components: {
    schemas: { Shipment: { type: 'object', required: ['uuid'], properties: { uuid: { type: 'string' } } } },
    parameters: { Uuid: { name: 'uuid', in: 'path', schema: { type: 'string', format: 'uuid' } } },
    requestBodies: { NewShipment: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Shipment' } } } } },
    responses: { Shipment: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Shipment' } } } } },
  },
};

describe('contractFromOpenApi', () => {
  const contract = contractFromOpenApi(doc, { meta: { createShipment: { counterpartyToken: true } } });
  const byId = Object.fromEntries(contract.operations.map(o => [o.id, o]));

  it('takes name, base URL and component schemas from the document', () => {
    expect(contract.name).toBe('ukrposhta-ecom');
    expect(contract.baseUrl).toBe('https://dev.ukrposhta.ua/ecom/0.0.1');
    expect(contract.components!.schemas!.Shipment).toBeDefined();
    expect(contractFromOpenApi(doc, { name: 'x', baseUrl: 'https://y' })).toMatchObject({ name: 'x', baseUrl: 'https://y' });
  });

  it('merges path-level and operation parameters into object schemas', () => {
    expect(byId.getShipment!.params).toEqual({
      path: { type: 'object', properties: { uuid: { type: 'string', format: 'uuid' } }, required: ['uuid'] },
      query: { type: 'object', properties: { token: { type: 'string' } }, required: ['token'] },
      headers: { type: 'object', properties: { 'x-trace': { type: 'string' } } },
    });
  });

  it('resolves request bodies and responses, and picks body kinds by media type', () => {
    expect(byId.createShipment!.requestBody).toEqual({ kind: 'json', required: true, schema: { $ref: '#/components/schemas/Shipment' } });
    expect(byId.createShipment!.meta).toEqual({ counterpartyToken: true });
    expect(byId.getShipment!.responses!['200']).toEqual({ contentType: 'application/json', schema: { $ref: '#/components/schemas/Shipment' } });
    expect(byId.getShipment!.responses!['404']).toEqual({});
    expect(byId['DELETE /shipments/{uuid}']!.responses!['200']).toEqual({ contentType: 'application/pdf' });
    expect(byId.form!.requestBody!.kind).toBe('form');
    expect(byId.xml!.requestBody!.kind).toBe('text');
    expect(byId.upload!.requestBody!.kind).toBe('binary');
    expect(byId.empty!.requestBody).toEqual({ kind: 'json', required: false });
  });

  it('rejects non-local and circular refs', () => {
    const remote = { paths: { '/a': { get: { parameters: [{ $ref: 'other.yaml#/x' }] } } } } as unknown as OpenApiDocument;
    expect(() => contractFromOpenApi(remote)).toThrow('Only local $ref');
    const missing = { paths: { '/a': { get: { parameters: [{ $ref: '#/components/parameters/Nope' }] } } } } as unknown as OpenApiDocument;
    expect(() => contractFromOpenApi(missing)).toThrow('Unresolvable $ref');
    const circular = {
      paths: { '/a': { get: { parameters: [{ $ref: '#/components/parameters/A' }] } } },
      components: { parameters: { A: { $ref: '#/components/parameters/B' }, B: { $ref: '#/components/parameters/A' } } },
    } as unknown as OpenApiDocument;
    expect(() => contractFromOpenApi(circular)).toThrow('Circular $ref');
  });
});

describe('defineContract', () => {
  it('rejects duplicate ids and routes', () => {
    expect(() => defineContract({ name: 'x', operations: [{ id: 'a', method: 'GET', path: '/a' }, { id: 'a', method: 'GET', path: '/b' }] })).toThrow('Duplicate operation id');
    expect(() => defineContract({ name: 'x', operations: [{ id: 'a', method: 'GET', path: '/a/{x}' }, { id: 'b', method: 'GET', path: '/a/{y}' }] })).toThrow('Duplicate route');
  });
});
