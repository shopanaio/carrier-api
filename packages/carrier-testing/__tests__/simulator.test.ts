import { createHttpClient } from '@shopana/carrier-core';
import type { HttpRequest } from '@shopana/carrier-core';
import { combineSimulators, createSimulator, defineContract, httpError, json, noContent, SimClock, SimulatorError } from '../src';

const contract = defineContract({
  name: 'test',
  baseUrl: 'https://api.test/v1/',
  operations: [
    { id: 'byBarcode', method: 'GET', path: '/shipments/barcode/{barcode}' },
    {
      id: 'getShipment',
      method: 'GET',
      path: '/shipments/{id}',
      params: { path: { type: 'object', properties: { id: { type: 'integer' } } }, query: { type: 'object', properties: { tags: { type: 'array', items: { type: 'string' } }, page: { type: 'integer' } } } },
      responses: { '200': { schema: { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } } }, '4XX': { schema: { type: 'object', required: ['message'] } } },
    },
    { id: 'form', method: 'POST', path: '/form', requestBody: { kind: 'form', required: true, schema: { type: 'object', required: ['n'], properties: { n: { type: 'integer' } } } } },
    { id: 'text', method: 'POST', path: '/text', requestBody: { kind: 'text', required: true } },
    { id: 'headers', method: 'GET', path: '/headers', params: { headers: { type: 'object', required: ['x-api-key'] } } },
    { id: 'nohandler', method: 'GET', path: '/nohandler' },
    { id: 'empty', method: 'DELETE', path: '/' },
  ],
});

const req = (method: HttpRequest['method'], path: string, extra: Partial<HttpRequest> = {}): HttpRequest => ({ method, url: `https://api.test/v1${path}`, ...extra });

function makeSim(overrides: Partial<Parameters<typeof createSimulator>[0]> = {}) {
  return createSimulator({
    contract,
    handlers: {
      byBarcode: ctx => json({ barcode: ctx.params.barcode }),
      getShipment: ctx => (ctx.params.id === 404 ? Promise.reject(httpError(404, { message: 'nf' })) : json({ id: ctx.params.id, query: ctx.query })),
      form: ctx => json({ n: (ctx.body as { n: number }).n }),
      text: ctx => json({ len: (ctx.body as string).length }),
      headers: () => json({ ok: true }),
      empty: () => noContent(),
    },
    ...overrides,
  });
}

describe('Simulator routing and parsing', () => {
  it('prefers static segments and coerces path and query params', async () => {
    const sim = makeSim();
    expect((await sim.transport(req('GET', '/shipments/barcode/0501'))).data).toEqual({ barcode: '0501' });
    const res = await sim.transport(req('GET', '/shipments/42?tags=a', { query: { tags: ['b'], page: '2' } }));
    expect(res).toMatchObject({ status: 200, headers: { 'content-type': 'application/json' }, data: { id: 42, query: { tags: ['a', 'b'], page: 2 } } });
    expect(sim.calls[1]).toMatchObject({ operationId: 'getShipment', path: '/shipments/42', status: 200, outcome: 'handled' });
  });

  it('matches the base URL root and trailing slashes', async () => {
    const sim = makeSim();
    expect((await sim.transport({ method: 'DELETE', url: 'https://api.test/v1' })).status).toBe(204);
    expect((await sim.transport(req('GET', '/shipments/barcode/1/'))).status).toBe(200);
  });

  it('rejects URLs outside the base URL and unknown routes', async () => {
    const sim = makeSim();
    await expect(sim.transport({ method: 'GET', url: 'https://other.test/x' })).rejects.toThrow(SimulatorError);
    await expect(sim.transport(req('GET', '/unknown'))).rejects.toThrow('no operation for GET /unknown');
    const lenient = makeSim({ strictRoutes: false });
    expect(await lenient.transport(req('GET', '/unknown'))).toMatchObject({ status: 404 });
    expect(lenient.calls[0]!.outcome).toBe('not_found');
  });

  it('fails loudly when an operation has no handler', async () => {
    await expect(makeSim().transport(req('GET', '/nohandler'))).rejects.toThrow('no handler for operation nohandler');
  });

  it('needs a base URL', () => {
    expect(() => createSimulator({ contract: { name: 'x', operations: [] }, handlers: {} })).toThrow('needs a baseUrl');
  });
});

describe('Simulator validation', () => {
  it('validates params, headers and bodies with a default 400', async () => {
    const sim = makeSim();
    const bad = await sim.transport(req('GET', '/shipments/abc'));
    expect(bad.status).toBe(400);
    expect((bad.data as { issues: string[] }).issues[0]).toMatch(/path\/id must be integer/);
    expect(sim.calls[0]!.issues![0]).toMatchObject({ location: 'path', field: 'id' });

    expect((await sim.transport(req('GET', '/headers'))).status).toBe(400);
    expect((await sim.transport(req('GET', '/headers', { headers: { 'X-API-Key': 'k' } }))).status).toBe(200);
    expect((await sim.transport(req('POST', '/form', { body: { kind: 'form', value: { n: '5' } } }))).data).toEqual({ n: 5 });
    expect((await sim.transport(req('POST', '/form', { body: { kind: 'form', value: {} } }))).status).toBe(400);
    expect((await sim.transport(req('POST', '/form'))).data).toEqual({ error: 'ValidationError', issues: ['body is required'] });
    expect((await sim.transport(req('POST', '/form', { body: { kind: 'json', value: { n: 1 } } }))).data).toEqual({
      error: 'ValidationError',
      issues: ['body must be form, got json'],
    });
    expect((await sim.transport(req('POST', '/text', { body: { kind: 'text', value: '<a/>', contentType: 'text/xml' } }))).data).toEqual({ len: 4 });
  });

  it('uses the carrier-shaped invalidRequest answer', async () => {
    const sim = makeSim({ invalidRequest: issues => ({ status: 400, body: { code: 'UPE01002', message: 'bad', field: issues[0]!.field } }) });
    expect((await sim.transport(req('GET', '/shipments/x'))).data).toEqual({ code: 'UPE01002', message: 'bad', field: 'id' });
  });

  it('throws when a handler breaks the response schema, but lets declared error bodies through', async () => {
    const sim = makeSim({ handlers: { getShipment: () => json({ nope: true }) } });
    await expect(sim.transport(req('GET', '/shipments/1'))).rejects.toThrow(/returned a 200 body that breaks the contract:\n {2}- response must have required property 'id'/);
    const ok404 = makeSim();
    expect(await ok404.transport(req('GET', '/shipments/404'))).toMatchObject({ status: 404, data: { message: 'nf' } });
  });

  it('turns SimHttpError thrown from auth into a response', async () => {
    const sim = makeSim({ auth: () => { throw httpError(403, { message: 'forbidden' }); } });
    expect(await sim.transport(req('GET', '/shipments/1'))).toMatchObject({ status: 403 });
  });

  it('rethrows unexpected handler errors', async () => {
    const sim = makeSim({ handlers: { byBarcode: () => { throw new Error('bug in handler'); } } });
    await expect(sim.transport(req('GET', '/shipments/barcode/1'))).rejects.toThrow('bug in handler');
  });
});

describe('Simulator responses', () => {
  it('returns text when the client asked for text and passes strings through', async () => {
    const sim = makeSim({ handlers: { byBarcode: () => json({ a: 1 }), headers: () => ({ body: 'plain' }) } });
    expect((await sim.transport(req('GET', '/shipments/barcode/1', { responseType: 'text' }))).data).toBe('{"a":1}');
    expect(await sim.transport(req('GET', '/headers', { headers: { 'x-api-key': '1' } }))).toMatchObject({ data: 'plain', headers: { 'content-type': 'text/plain' } });
  });
});

describe('fault injection', () => {
  it('fails N matching requests by operation id or route, then recovers', async () => {
    const sim = makeSim();
    const fault = sim.fail({ operation: 'GET /shipments/{id}', status: 503, times: 2, headers: { 'Retry-After': '1' } });
    sim.fail({ operation: 'byBarcode', status: 500, body: { message: 'x' } });
    expect((await sim.transport(req('GET', '/shipments/1'))).status).toBe(503);
    expect((await sim.transport(req('GET', '/shipments/1'))).headers['retry-after']).toBe('1');
    expect((await sim.transport(req('GET', '/shipments/1'))).status).toBe(200);
    expect(fault).toMatchObject({ hits: 2, remaining: 0 });
    expect((await sim.transport(req('GET', '/shipments/barcode/1'))).data).toEqual({ message: 'x' });
    expect(sim.calls.map(c => c.outcome)).toEqual(['fault', 'fault', 'handled', 'fault']);
  });

  it('matches concrete paths, any request, and unknown routes', async () => {
    const sim = makeSim({ strictRoutes: false });
    sim.fail({ operation: 'GET /shipments/7', status: 418 });
    sim.fail({ operation: 'POST /shipments/7', status: 499 });
    expect((await sim.transport(req('GET', '/shipments/7'))).status).toBe(418);
    sim.fail({ operation: 'weird', status: 499 });
    sim.fail({ status: 502 });
    expect((await sim.transport(req('GET', '/whatever'))).status).toBe(502);
    sim.clearFaults();
    expect((await sim.transport(req('GET', '/whatever'))).status).toBe(404);
  });

  it('simulates network errors, delays and hanging connections', async () => {
    const clock = new SimClock();
    const sim = makeSim({ clock, sleep: clock.sleep });
    sim.fail({ networkError: true });
    await expect(sim.transport(req('GET', '/shipments/1'))).rejects.toThrow('simulated network error');
    sim.fail({ networkError: new Error('ECONNRESET') });
    await expect(sim.transport(req('GET', '/shipments/1'))).rejects.toThrow('ECONNRESET');
    sim.fail({ delayMs: 1500, status: 504 });
    const before = clock.now();
    expect((await sim.transport(req('GET', '/shipments/1'))).status).toBe(504);
    expect(clock.now() - before).toBe(1500);

    sim.fail({ hang: true });
    const http = createHttpClient({ carrier: 't', baseUrl: 'https://api.test/v1', transport: sim.transport, retry: false, timeoutMs: 10 });
    await expect(http.request({ method: 'GET', path: '/shipments/1' })).rejects.toMatchObject({ code: 'TIMEOUT' });

    const aborted = new AbortController();
    aborted.abort();
    sim.fail({ hang: true });
    await expect(sim.transport(req('GET', '/shipments/1', { signal: aborted.signal }))).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('uses real timers for delays by default and honours aborts', async () => {
    const sim = makeSim();
    sim.fail({ delayMs: 5, status: 500 });
    expect((await sim.transport(req('GET', '/shipments/1'))).status).toBe(500);
    const controller = new AbortController();
    sim.fail({ delayMs: 10_000, status: 500 });
    const pending = sim.transport(req('GET', '/shipments/1', { signal: controller.signal }));
    controller.abort(new Error('stop'));
    await expect(pending).rejects.toThrow('stop');
  });
});

describe('rate limit', () => {
  it('answers 429 with Retry-After per window and key', async () => {
    const clock = new SimClock();
    const sim = makeSim({ clock, rateLimit: { limit: 2, windowMs: 10_000, key: ctx => ctx.headers['x-user'] ?? '-' } });
    const get = (user: string) => sim.transport(req('GET', '/shipments/1', { headers: { 'X-User': user } }));
    await get('a');
    await get('a');
    expect((await get('b')).status).toBe(200);
    clock.advance(2_500);
    const limited = await get('a');
    expect(limited).toMatchObject({ status: 429, headers: { 'retry-after': '8' } });
    clock.advance(7_500);
    expect((await get('a')).status).toBe(200);
  });

  it('supports a carrier-shaped 429 body', async () => {
    const sim = makeSim({ rateLimit: { limit: 0, windowMs: 1000, response: s => ({ body: { status: 'Error', message: 'slow down', retry: s } }) } });
    expect(await sim.transport(req('GET', '/shipments/1'))).toMatchObject({ status: 429, data: { status: 'Error', retry: 1 } });
  });
});

describe('combineSimulators and reset', () => {
  it('routes by the longest matching base URL', async () => {
    const api = makeSim();
    const forms = createSimulator({ contract: defineContract({ name: 'forms', operations: [{ id: 'sticker', method: 'GET', path: '/sticker' }] }), baseUrl: 'https://api.test/v1/forms', handlers: { sticker: () => json({ forms: true }) } });
    const transport = combineSimulators(api, forms);
    expect((await transport(req('GET', '/forms/sticker'))).data).toEqual({ forms: true });
    expect((await transport(req('GET', '/shipments/barcode/1'))).data).toEqual({ barcode: '1' });
    await expect(transport({ method: 'GET', url: 'https://nowhere.test' })).rejects.toThrow('No simulator serves');

    api.fail({ status: 500 });
    api.state.collection('x').insert('1', {});
    api.reset();
    expect(api.calls).toHaveLength(0);
    expect(api.state.collection('x').size).toBe(0);
    expect((await api.transport(req('GET', '/shipments/barcode/1'))).status).toBe(200);
  });
});
