import { createHttpClient } from '@shopana/carrier-core';
import type { HttpRequest } from '@shopana/carrier-core';
import { binary, contractFromOpenApi, createSimulator, defineContract, httpError, json, minimalPdf, SimClock, SimulatorError } from '../src';
import type { OpenApiDocument } from '../src';

const contract = defineContract({
  name: 'fidelity',
  baseUrl: 'https://api.test',
  operations: [
    { id: 'label', method: 'GET', path: '/label' },
    { id: 'jsonOk', method: 'GET', path: '/json' },
    {
      id: 'strict',
      method: 'GET',
      path: '/strict/{id}',
      responses: { '200': { schema: { type: 'object', required: ['id'] } }, '404': { schema: { type: 'object', required: ['code'] } } },
    },
  ],
});

const req = (path: string, extra: Partial<HttpRequest> = {}): HttpRequest => ({ method: 'GET', url: `https://api.test${path}`, ...extra });

function makeSim(overrides: Partial<Parameters<typeof createSimulator>[0]> = {}) {
  return createSimulator({
    contract,
    handlers: {
      label: () => binary('application/pdf', minimalPdf()),
      jsonOk: () => json({ ok: true }),
      strict: ctx => {
        if (ctx.params.id === 'gone') throw httpError(404, { message: 'no code field' });
        if (ctx.params.id === 'teapot') return json({ id: 1 }, 418);
        return json({ id: ctx.params.id });
      },
    },
    ...overrides,
  });
}

describe('simulator decodes bodies like the fetch transport', () => {
  it('returns a PDF as text when the client did not ask for binary, as fetch would', async () => {
    const sim = makeSim();
    const asText = await sim.transport(req('/label'));
    expect(typeof asText.data).toBe('string');
    expect(asText.data as string).toMatch(/^%PDF/);
    const asBinary = await sim.transport(req('/label', { responseType: 'binary' }));
    expect(asBinary.data).toMatchObject({ contentType: 'application/pdf' });
    expect((asBinary.data as { data: Uint8Array }).data).toBeInstanceOf(Uint8Array);
  });

  it('returns a 2xx JSON body as bytes for responseType binary, and a 4xx JSON error parsed', async () => {
    const sim = makeSim();
    const bytes = await sim.transport(req('/json', { responseType: 'binary' }));
    expect(new TextDecoder().decode((bytes.data as { data: Uint8Array }).data)).toBe('{"ok":true}');
    sim.fail({ operation: 'label', status: 400, body: { message: 'bad size' } });
    expect((await sim.transport(req('/label', { responseType: 'binary' }))).data).toEqual({ message: 'bad size' });
  });

  it('returns JSON as a string for responseType text', async () => {
    expect((await makeSim().transport(req('/json', { responseType: 'text' }))).data).toBe('{"ok":true}');
  });
});

describe('simulator validates every carrier-shaped answer', () => {
  it('checks SimHttpError bodies against the declared status', async () => {
    await expect(makeSim().transport(req('/strict/gone'))).rejects.toThrow(/strict answered with a 404 body|404 body that breaks the contract/);
  });

  it('checks auth answers', async () => {
    const sim = makeSim({ auth: ctx => (ctx.operation.id === 'strict' ? { status: 404, body: {} } : undefined) });
    await expect(sim.transport(req('/strict/1'))).rejects.toThrow(SimulatorError);
  });

  it('flags undeclared statuses unless strictResponses is false', async () => {
    expect((await makeSim({ strictResponses: false }).transport(req('/strict/teapot'))).status).toBe(418);
    await expect(makeSim().transport(req('/strict/teapot'))).rejects.toThrow(/answered 418, which the contract does not declare/);
  });

  it('surfaces a contract violation through the client as the SimulatorError itself, without retries', async () => {
    const sim = makeSim();
    const http = createHttpClient({ carrier: 'fidelity', baseUrl: 'https://api.test', transport: sim.transport, retry: { baseDelayMs: 0 } });
    await expect(http.request({ method: 'GET', path: '/strict/gone' })).rejects.toBeInstanceOf(SimulatorError);
    expect(sim.calls).toHaveLength(1);
  });
});

describe('SimClock.sleep', () => {
  it('rejects when already aborted', async () => {
    const clock = new SimClock(0);
    const controller = new AbortController();
    controller.abort(new Error('stop'));
    await expect(clock.sleep(10, controller.signal)).rejects.toThrow('stop');
    expect(clock.now()).toBe(0);
  });
});

describe('contractFromOpenApi with Swagger 2.0', () => {
  const swagger: OpenApiDocument = {
    swagger: '2.0',
    info: { title: 'ecom', version: '0.0.1' },
    host: 'dev.ukrposhta.ua',
    basePath: '/ecom/0.0.1',
    schemes: ['https'],
    paths: {
      '/addresses/{id}': {
        parameters: [{ $ref: '#/parameters/Id' } as never],
        get: {
          operationId: 'getAddress',
          parameters: [{ name: 'token', in: 'query', required: true, type: 'string' }],
          responses: { '200': { schema: { $ref: '#/definitions/Address' } }, '404': { description: 'nf' } as never },
        },
      },
      '/addresses': {
        post: {
          operationId: 'createAddress',
          parameters: [{ name: 'body', in: 'body', required: true, schema: { $ref: '#/definitions/Address' } }],
          responses: { '200': { schema: { $ref: '#/definitions/Address' } } },
        },
      },
      '/login': {
        post: {
          operationId: 'login',
          consumes: ['application/x-www-form-urlencoded'],
          parameters: [
            { name: 'user', in: 'formData', required: true, type: 'string' },
            { name: 'age', in: 'formData', type: 'integer', minimum: 0 },
          ],
        },
      },
    },
    definitions: { Address: { type: 'object', required: ['postcode'], properties: { postcode: { type: 'string', pattern: '^\\d{5}$' }, id: { type: 'integer' } } } },
    parameters: { Id: { name: 'id', in: 'path', required: true, type: 'integer' } },
  };
  const converted = contractFromOpenApi(swagger);
  const byId = Object.fromEntries(converted.operations.map(o => [o.id, o]));

  it('builds the base URL, parameters, bodies and responses', () => {
    expect(converted.baseUrl).toBe('https://dev.ukrposhta.ua/ecom/0.0.1');
    expect(byId.getAddress!.params).toEqual({
      path: { type: 'object', properties: { id: { type: 'integer' } }, required: ['id'] },
      query: { type: 'object', properties: { token: { type: 'string' } }, required: ['token'] },
    });
    expect(byId.createAddress!.requestBody).toEqual({ kind: 'json', required: true, schema: { $ref: '#/components/schemas/Address' } });
    expect(byId.login!.requestBody).toMatchObject({ kind: 'form', required: true, schema: { required: ['user'], properties: { age: { type: 'integer', minimum: 0 } } } });
    expect(byId.getAddress!.responses).toEqual({ '200': { contentType: 'application/json', schema: { $ref: '#/components/schemas/Address' } }, '404': {} });
    expect(converted.components?.schemas?.Address).toBeDefined();
  });

  it('validates requests and responses through #/definitions refs', async () => {
    const sim = createSimulator({
      contract: converted,
      handlers: { createAddress: ctx => json({ ...(ctx.body as object), id: 1 }), getAddress: () => json({ postcode: 'x' }) },
    });
    const ok = await sim.transport({ method: 'POST', url: 'https://dev.ukrposhta.ua/ecom/0.0.1/addresses', body: { kind: 'json', value: { postcode: '01001' } } });
    expect(ok.data).toEqual({ postcode: '01001', id: 1 });
    const bad = await sim.transport({ method: 'POST', url: 'https://dev.ukrposhta.ua/ecom/0.0.1/addresses', body: { kind: 'json', value: { postcode: '1' } } });
    expect(bad.status).toBe(400);
    await expect(sim.transport({ method: 'GET', url: 'https://dev.ukrposhta.ua/ecom/0.0.1/addresses/5?token=t' })).rejects.toThrow(/must match pattern/);
  });
});
