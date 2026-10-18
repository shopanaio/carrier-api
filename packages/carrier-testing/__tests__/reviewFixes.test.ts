import { createHttpClient } from '@shopana/carrier-core';
import type { HttpRequest } from '@shopana/carrier-core';
import { contractFromOpenApi, createSimulator, defineContract, json, normalizeSchemas, SimulatorError } from '../src';
import type { OpenApiDocument } from '../src';

const contract = defineContract({
  name: 'review',
  baseUrl: 'https://api.test',
  operations: [
    {
      id: 'echo',
      method: 'POST',
      path: '/echo',
      requestBody: { kind: 'json', schema: { type: 'object', properties: { at: { type: 'string', format: 'date-time' } } } },
    },
    {
      id: 'form',
      method: 'POST',
      path: '/form',
      requestBody: { kind: 'form', schema: { type: 'object', properties: { n: { type: 'integer' } } } },
    },
    { id: 'broken', method: 'GET', path: '/broken' },
  ],
});

const post = (path: string, body: HttpRequest['body']): HttpRequest => ({ method: 'POST', url: `https://api.test${path}`, body });

describe('simulator wraps unexpected exceptions in SimulatorError', () => {
  it('wraps a handler bug and keeps the cause', async () => {
    const bug = new TypeError("Cannot read properties of undefined (reading 'x')");
    const sim = createSimulator({
      contract,
      handlers: {
        broken: () => {
          throw bug;
        },
      },
    });
    const error = await sim.transport({ method: 'GET', url: 'https://api.test/broken' }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(SimulatorError);
    expect((error as SimulatorError).message).toMatch(/broken threw TypeError/);
    expect((error as { cause?: unknown }).cause).toBe(bug);

    // Through the client: the fatal SimulatorError reaches the test once, never as a network error.
    const http = createHttpClient({ carrier: 'review', baseUrl: 'https://api.test', transport: sim.transport, retry: { baseDelayMs: 0 } });
    await expect(http.request({ method: 'GET', path: '/broken' })).rejects.toBeInstanceOf(SimulatorError);
    expect(sim.callsTo('broken')).toHaveLength(2);
  });

  it('wraps exceptions from auth and from validation', async () => {
    const authBug = createSimulator({
      contract,
      handlers: { broken: () => json({}) },
      auth: () => {
        throw new Error('auth bug');
      },
    });
    await expect(authBug.transport({ method: 'GET', url: 'https://api.test/broken' })).rejects.toThrow(SimulatorError);

    const badSchema = defineContract({
      name: 'bad',
      baseUrl: 'https://api.test',
      operations: [{ id: 'x', method: 'POST', path: '/x', requestBody: { kind: 'json', schema: { type: 'no-such-type' } } }],
    });
    const sim = createSimulator({ contract: badSchema, handlers: { x: () => json({}) } });
    await expect(sim.transport(post('/x', { kind: 'json', value: {} }))).rejects.toThrow(SimulatorError);
  });

  it('reports a body that cannot be serialised as SimulatorError', async () => {
    const sim = createSimulator({ contract, handlers: { echo: () => json({}) } });
    await expect(sim.transport(post('/echo', { kind: 'json', value: { n: BigInt(1) } }))).rejects.toThrow(/not JSON-serialisable/);
  });
});

describe('simulator sees request bodies as they travel over the wire', () => {
  it('round-trips JSON bodies: Date becomes an ISO string and nothing is shared with the client', async () => {
    const seen: unknown[] = [];
    const sim = createSimulator({
      contract,
      handlers: {
        echo: ctx => {
          seen.push(ctx.body);
          (ctx.body as { mutated?: boolean }).mutated = true;
          return json({});
        },
      },
    });
    const value = { at: new Date('2026-01-02T03:04:05.000Z'), nested: { a: 1 } };
    expect((await sim.transport(post('/echo', { kind: 'json', value }))).status).toBe(200);
    expect(seen[0]).toEqual({ at: '2026-01-02T03:04:05.000Z', nested: { a: 1 }, mutated: true });
    expect(value).not.toHaveProperty('mutated');
    expect(sim.calls[0]!.body).not.toBe(value);
  });

  it('copies form bodies before Ajv coerces them', async () => {
    const seen: unknown[] = [];
    const sim = createSimulator({ contract, handlers: { form: ctx => (seen.push(ctx.body), json({})) } });
    const value = { n: '5' };
    await sim.transport(post('/form', { kind: 'form', value }));
    expect(seen[0]).toEqual({ n: 5 });
    expect(value).toEqual({ n: '5' });
  });
});

describe('contractFromOpenApi normalises legacy schema keywords', () => {
  it('converts draft-04 boolean exclusive bounds and x-nullable, leaving examples alone', () => {
    expect(
      normalizeSchemas({
        type: 'object',
        properties: {
          weight: { type: 'number', minimum: 0, exclusiveMinimum: true, maximum: 30, exclusiveMaximum: false },
          cap: { type: 'number', maximum: 10, exclusiveMaximum: true },
          note: { type: 'string', 'x-nullable': true },
          odd: { type: 'number', exclusiveMinimum: true },
        },
        example: { weight: 1, 'x-nullable': true, exclusiveMinimum: true },
        enum: [{ exclusiveMinimum: true }],
        default: { 'x-nullable': false },
      }),
    ).toEqual({
      type: 'object',
      properties: {
        weight: { type: 'number', exclusiveMinimum: 0, maximum: 30 },
        cap: { type: 'number', exclusiveMaximum: 10 },
        note: { type: 'string', nullable: true },
        odd: { type: 'number' },
      },
      example: { weight: 1, 'x-nullable': true, exclusiveMinimum: true },
      enum: [{ exclusiveMinimum: true }],
      default: { 'x-nullable': false },
    });
  });

  it('validates a Swagger 2 document with draft-04 bounds and x-nullable through the simulator', async () => {
    const doc: OpenApiDocument = {
      swagger: '2.0',
      host: 'api.test',
      paths: {
        '/parcels': {
          post: {
            operationId: 'createParcel',
            parameters: [
              {
                name: 'body',
                in: 'body',
                required: true,
                schema: {
                  type: 'object',
                  properties: { weight: { type: 'number', minimum: 0, exclusiveMinimum: true }, comment: { type: 'string', 'x-nullable': true } },
                },
              },
              { name: 'limit', in: 'query', type: 'integer', minimum: 1, exclusiveMinimum: true },
            ],
            responses: { '200': { schema: { type: 'object' } } },
          },
        },
      },
    } as never;
    const parsed = contractFromOpenApi(doc);
    const sim = createSimulator({ contract: parsed, handlers: { createParcel: () => json({}) } });
    const send = (value: unknown, query = {}) => sim.transport({ ...post('/parcels', { kind: 'json', value }), query });
    expect((await send({ weight: 1, comment: null })).status).toBe(200);
    expect((await send({ weight: 0 })).status).toBe(400);
    expect((await send({ weight: 1 }, { limit: 1 })).status).toBe(400);
    expect((await send({ weight: 1 }, { limit: 2 })).status).toBe(200);
  });
});
