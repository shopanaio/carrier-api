import { createHttpClient } from '@shopana/carrier-core';
import { contractFromOpenApi, createSimulator, defineContract, json, normalizeSchemas } from '../src';
import type { OpenApiDocument } from '../src';

const get = (path: string) => ({ method: 'GET' as const, url: `https://api.test${path}` });

describe('nullable schemas', () => {
  it('turns nullable without a type into an explicit null alternative and adds null to an enum', () => {
    expect(normalizeSchemas({ $ref: '#/components/schemas/A', 'x-nullable': true })).toEqual({
      anyOf: [{ $ref: '#/components/schemas/A' }, { type: 'null' }],
    });
    expect(normalizeSchemas({ type: 'string', enum: ['x'], nullable: true })).toEqual({
      type: 'string',
      enum: ['x', null],
      nullable: true,
    });
    expect(normalizeSchemas({ type: 'string', nullable: false })).toEqual({ type: 'string' });
  });

  it('normalises properties named like data keywords', () => {
    expect(
      normalizeSchemas({ type: 'object', properties: { default: { type: 'string', 'x-nullable': true } } }),
    ).toEqual({
      type: 'object',
      properties: { default: { type: 'string', nullable: true } },
    });
  });

  it('accepts null for $ref, allOf and enum fields of an imported Swagger 2 / OpenAPI 3.0 document', async () => {
    const swagger: OpenApiDocument = {
      swagger: '2.0',
      host: 'api.test',
      definitions: { Addr: { type: 'object', properties: { city: { type: 'string' } } } },
      paths: {
        '/a': {
          get: {
            operationId: 'getA',
            responses: {
              '200': {
                schema: {
                  type: 'object',
                  properties: {
                    addr: { $ref: '#/definitions/Addr', 'x-nullable': true },
                    kind: { type: 'string', enum: ['x', 'y'], 'x-nullable': true },
                    wrapped: { allOf: [{ $ref: '#/definitions/Addr' }], 'x-nullable': true },
                  },
                },
              },
            },
          },
        },
      },
    } as never;
    let body: unknown = { addr: null, kind: null, wrapped: null };
    const sim = createSimulator({ contract: contractFromOpenApi(swagger), handlers: { getA: () => json(body) } });
    expect((await sim.transport(get('/a'))).data).toEqual(body);
    body = { addr: { city: 'Kyiv' }, kind: 'x', wrapped: { city: 'Lviv' } };
    expect((await sim.transport(get('/a'))).data).toEqual(body);
    body = { kind: 'z' };
    await expect(sim.transport(get('/a'))).rejects.toThrow('breaks the contract');
  });

  it('applies the same normalisation to hand-written contracts', async () => {
    const contract = defineContract({
      name: 'manual',
      baseUrl: 'https://api.test',
      components: { schemas: { Addr: { type: 'object' } } },
      operations: [
        {
          id: 'getA',
          method: 'GET',
          path: '/a',
          responses: {
            '200': {
              schema: { type: 'object', properties: { addr: { $ref: '#/components/schemas/Addr', nullable: true } } },
            },
          },
        },
      ],
    });
    const sim = createSimulator({ contract, handlers: { getA: () => json({ addr: null }) } });
    expect((await sim.transport(get('/a'))).status).toBe(200);
  });
});

describe('aborts inside a handler', () => {
  it('reports the caller abort as ABORTED, not as a SimulatorError', async () => {
    const contract = defineContract({
      name: 'slow',
      baseUrl: 'https://api.test',
      operations: [{ id: 'slow', method: 'GET', path: '/slow' }],
    });
    const sim = createSimulator({
      contract,
      handlers: {
        slow: ctx =>
          new Promise((_, reject) => {
            ctx.request.signal?.addEventListener('abort', () => reject(ctx.request.signal?.reason));
          }),
      },
    });
    const http = createHttpClient({
      carrier: 'slow',
      baseUrl: 'https://api.test',
      transport: sim.transport,
      retry: false,
    });
    const controller = new AbortController();
    const pending = http.request({ method: 'GET', path: '/slow', signal: controller.signal });
    setTimeout(() => controller.abort(), 0);
    await expect(pending).rejects.toMatchObject({ code: 'ABORTED' });
  });
});
