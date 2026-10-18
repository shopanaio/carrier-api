import {
  CarrierError,
  CarrierErrorCategory,
  createClient,
  createHttpClient,
  defaultHttpError,
  isCarrierError,
  queryParam,
  redactRequest,
  REDACTED,
  timeout,
  composeMiddleware,
  toNetworkError,
  categoryFromHttpStatus,
  base64Encode,
} from '../src';
import type { ClientContext, HttpLogEvent } from '../src';
import { fakeTime, ok, scriptedTransport, status } from './helpers';

describe('HttpClient', () => {
  it('builds wire requests from path templates, query, headers and JSON', async () => {
    const { transport, calls } = scriptedTransport(ok({ result: 1 }));
    const http = createHttpClient({ carrier: 'meest', baseUrl: 'https://api.test/v3.0/openAPI/', transport, defaultHeaders: { 'X-App': 'shopana' }, retry: false });
    await http.request({ method: 'POST', path: '/parcel/{id}', pathParams: { id: 'p 1' }, query: { lang: 'uk' }, json: { a: 1 }, headers: { 'X-Req': '1' }, idempotent: true, timeoutMs: 50, meta: { op: 'x' }, responseType: 'json' });
    expect(calls[0]).toMatchObject({
      method: 'POST',
      url: 'https://api.test/v3.0/openAPI/parcel/p%201',
      query: { lang: 'uk' },
      headers: { 'X-App': 'shopana', 'X-Req': '1' },
      body: { kind: 'json', value: { a: 1 } },
      idempotent: true,
      timeoutMs: 50,
      meta: { op: 'x' },
    });
  });

  it('unwraps carrier envelopes and lets unwrap throw for 2xx errors', async () => {
    const unwrap = (r: { data: unknown }) => {
      const env = r.data as { status: string; result: unknown; info?: { message: string } };
      if (env.status !== 'OK') throw new CarrierError({ carrier: 'meest', code: 'E', message: env.info!.message, category: CarrierErrorCategory.Validation });
      return env.result;
    };
    const { transport } = scriptedTransport(ok({ status: 'OK', result: [1] }), ok({ status: 'Error', info: { message: 'bad zip' } }));
    const http = createHttpClient({ carrier: 'meest', baseUrl: 'https://api.test', transport, unwrap });
    expect(await http.request({ method: 'GET', path: '/a' })).toEqual([1]);
    await expect(http.request({ method: 'GET', path: '/a' })).rejects.toMatchObject({ message: 'bad zip', category: 'validation' });
  });

  it('maps non-2xx responses with the default mapper or a carrier mapper', async () => {
    const { transport } = scriptedTransport(status(404, { code: 'UPE02001', message: 'Shipment not found' }));
    const http = createHttpClient({ carrier: 'ukrposhta', baseUrl: 'https://api.test', transport, retry: false });
    const error = await http.request({ method: 'GET', path: '/shipments/1' }).catch(e => e);
    expect(isCarrierError(error)).toBe(true);
    expect(error).toMatchObject({ carrier: 'ukrposhta', code: 'UPE02001', message: 'Shipment not found', category: 'not_found', httpStatus: 404, retryable: false });

    const custom = createHttpClient({
      carrier: 'x',
      baseUrl: 'https://api.test',
      transport,
      retry: false,
      mapError: r => new CarrierError({ carrier: 'x', code: 'CUSTOM', message: String(r.status), category: CarrierErrorCategory.BusinessLogic }),
    });
    await expect(custom.request({ method: 'GET', path: '/' })).rejects.toMatchObject({ code: 'CUSTOM' });
  });

  it('send returns any status without throwing', async () => {
    const { transport } = scriptedTransport(status(500, 'boom'));
    const http = createHttpClient({ carrier: 'x', baseUrl: 'https://api.test', transport, retry: false });
    expect((await http.send({ method: 'POST', path: '/' })).status).toBe(500);
  });

  it('wraps network failures in CarrierError for both send and request', async () => {
    const { transport } = scriptedTransport(new TypeError('fetch failed'));
    const http = createHttpClient({ carrier: 'x', baseUrl: 'https://api.test', transport, retry: false });
    await expect(http.request({ method: 'GET', path: '/' })).rejects.toMatchObject({ code: 'NETWORK_ERROR', category: 'network', retryable: true });
    await expect(http.send({ method: 'GET', path: '/' })).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
  });

  it('runs retry, rate limit, custom middlewares, auth and logging in order and redacts secrets', async () => {
    const time = fakeTime();
    const events: HttpLogEvent[] = [];
    const { transport, calls } = scriptedTransport(status(503), ok({ ok: true }));
    const http = createHttpClient({
      carrier: 'ukrposhta',
      baseUrl: 'https://api.test',
      transport,
      auth: queryParam('token', 'secret-cp'),
      retry: { sleep: time.sleep, jitter: 'none', baseDelayMs: 10 },
      rateLimit: { limit: 1, intervalMs: 1000, clock: time.clock, sleep: time.sleep },
      logger: e => events.push(e),
      timeoutMs: 10_000,
      middlewares: [(r, next) => next({ ...r, headers: { ...r.headers, 'X-Trace': '1' } })],
    });
    expect(await http.request({ method: 'GET', path: '/s', headers: { Authorization: 'Bearer abc' } })).toEqual({ ok: true });
    expect(calls).toHaveLength(2);
    expect(calls[0]!.query).toEqual({ token: 'secret-cp' });
    expect(calls[0]!.headers!['X-Trace']).toBe('1');
    // backoff 10 ms, then rate limiter waited for the second token
    expect(time.sleeps).toEqual([10, 990]);
    expect(events.map(e => e.status)).toEqual([503, 200]);
    expect(events[0]!.request.query).toEqual({ token: REDACTED });
    expect(events[0]!.request.headers).toMatchObject({ Authorization: REDACTED });
    expect(events[0]!.carrier).toBe('ukrposhta');
  });

  it('logs failed attempts with the error', async () => {
    const events: HttpLogEvent[] = [];
    const { transport } = scriptedTransport(new TypeError('fetch failed'));
    const http = createHttpClient({ carrier: 'x', baseUrl: 'https://api.test', transport, retry: false, logger: e => events.push(e) });
    await http.send({ method: 'GET', path: '/' }).catch(() => undefined);
    expect(events[0]!.error).toMatchObject({ code: 'NETWORK_ERROR', cause: expect.any(TypeError) });
  });
});

describe('redactRequest', () => {
  it('masks secrets in URL, query, headers and nested bodies', () => {
    const redacted = redactRequest(
      {
        method: 'POST',
        url: 'https://api.test/s?token=abc&lang=uk&x',
        headers: { token: 't', 'Content-Type': 'application/json', 'X-Custom-Secret': 's' },
        query: { apiKey: 'k', page: 1 },
        body: { kind: 'json', value: { username: 'u', password: 'p', nested: [{ clientSecret: 'c', ok: 1 }] } },
      },
      { headers: ['x-custom-secret'] },
    );
    expect(redacted).toEqual({
      method: 'POST',
      url: `https://api.test/s?token=${REDACTED}&lang=uk&x`,
      headers: { token: REDACTED, 'Content-Type': 'application/json', 'X-Custom-Secret': REDACTED },
      query: { apiKey: REDACTED, page: 1 },
      body: { username: 'u', password: REDACTED, nested: [{ clientSecret: REDACTED, ok: 1 }] },
    });
  });

  it('summarises text and binary bodies and masks form fields', () => {
    expect(redactRequest({ method: 'POST', url: 'u', body: { kind: 'text', value: '<a/>', contentType: 'text/xml' } }).body).toBe('[text text/xml, 4 chars]');
    expect(redactRequest({ method: 'POST', url: 'u', body: { kind: 'binary', value: new Uint8Array(3), contentType: 'application/pdf' } }).body).toBe(
      '[binary application/pdf, 3 bytes]',
    );
    expect(redactRequest({ method: 'POST', url: 'u', body: { kind: 'form', value: { password: 'p', a: 'b' } } }, { keys: ['a'] }).body).toEqual({
      password: REDACTED,
      a: REDACTED,
    });
  });
});

describe('timeout middleware', () => {
  it('rejects with TimeoutError and aborts the inner signal', async () => {
    let inner: AbortSignal | undefined;
    const transport = ((r: { signal?: AbortSignal }) => {
      inner = r.signal;
      return new Promise(() => undefined);
    }) as never;
    await expect(composeMiddleware(transport, [timeout(5)])({ method: 'GET', url: 'u' })).rejects.toMatchObject({ name: 'TimeoutError' });
    expect(inner!.aborted).toBe(true);
  });

  it('passes through fast responses and forwards a parent abort', async () => {
    const { transport } = scriptedTransport(ok(1));
    expect((await composeMiddleware(transport, [timeout(1000)])({ method: 'GET', url: 'u' })).data).toBe(1);

    const parent = new AbortController();
    parent.abort(new Error('cancelled'));
    let inner: AbortSignal | undefined;
    const capture = ((r: { signal?: AbortSignal }) => {
      inner = r.signal;
      return Promise.resolve(ok());
    }) as never;
    await composeMiddleware(capture, [timeout(1000)])({ method: 'GET', url: 'u', signal: parent.signal });
    expect(inner!.aborted).toBe(true);
  });

  it('turns a timeout into a retryable CarrierError at the client', async () => {
    const transport = (() => new Promise(() => undefined)) as never;
    const http = createHttpClient({ carrier: 'x', baseUrl: 'https://api.test', transport, retry: false, timeoutMs: 5 });
    await expect(http.request({ method: 'GET', path: '/' })).rejects.toMatchObject({ code: 'TIMEOUT', category: 'timeout', retryable: true });
  });
});

describe('errors', () => {
  it('maps HTTP statuses to categories', () => {
    expect([401, 403, 404, 410, 408, 429, 500, 400, 302].map(categoryFromHttpStatus)).toEqual([
      'authentication',
      'authentication',
      'not_found',
      'not_found',
      'timeout',
      'rate_limit',
      'server',
      'validation',
      'unknown',
    ]);
  });

  it('serialises without raw payloads and keeps instanceof', () => {
    const error = new CarrierError({ carrier: 'np', code: '20000200068', message: 'auth', category: CarrierErrorCategory.Authentication, raw: { secret: 1 }, field: 'apiKey', cause: 'x' });
    expect(error).toBeInstanceOf(Error);
    expect(error.retryable).toBe(false);
    expect(error.toJSON()).toEqual({ name: 'CarrierError', carrier: 'np', code: '20000200068', message: 'auth', category: 'authentication', retryable: false, httpStatus: undefined, field: 'apiKey' });
  });

  it('wraps aborts as non-retryable and passes CarrierError through', () => {
    const abort = toNetworkError('x', Object.assign(new Error('a'), { name: 'AbortError' }));
    expect(abort).toMatchObject({ code: 'ABORTED', retryable: false });
    const existing = new CarrierError({ carrier: 'x', code: 'c', message: 'm', category: CarrierErrorCategory.Unknown });
    expect(toNetworkError('x', existing)).toBe(existing);
    expect(toNetworkError('x', 'plain')).toMatchObject({ message: 'plain' });
  });

  it('defaultHttpError reads string bodies and falls back to the status', () => {
    expect(defaultHttpError('x', status(500, 'Internal'))).toMatchObject({ code: 'HTTP_500', message: 'Internal' });
    expect(defaultHttpError('x', status(400, { errorCode: 7 }))).toMatchObject({ code: '7', message: 'HTTP 400' });
    expect(defaultHttpError('x', status(400, ''))).toMatchObject({ message: 'HTTP 400' });
  });
});

describe('createClient', () => {
  class TrackingService {
    readonly namespace = 'tracking' as const;
    ctx!: ClientContext<{ lang: string }>;
    attach(ctx: ClientContext<{ lang: string }>) {
      this.ctx = ctx;
    }
    lang() {
      return this.ctx.config.lang;
    }
  }

  it('mounts services under their namespace and passes the context', () => {
    const { transport } = scriptedTransport(ok());
    const ctx: ClientContext<{ lang: string }> = { http: createHttpClient({ carrier: 'x', baseUrl: 'u', transport }), config: { lang: 'uk' } };
    const client = createClient(ctx).use(new TrackingService());
    expect(client.tracking.lang()).toBe('uk');
    expect(() => client.use(new TrackingService())).toThrow('Namespace already installed');
    expect(() => client.use({ namespace: '' } as never)).toThrow('string "namespace"');
  });
});

describe('base64Encode', () => {
  it('matches Buffer for strings and bytes of every padding length', () => {
    for (const s of ['', 'a', 'ab', 'abc', 'Привіт']) expect(base64Encode(s)).toBe(Buffer.from(s).toString('base64'));
    expect(base64Encode(new Uint8Array([255, 0]))).toBe('/wA=');
  });
});
