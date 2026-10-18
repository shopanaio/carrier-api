import {
  CarrierError,
  CarrierErrorCategory,
  composeMiddleware,
  createHttpClient,
  isPreSendFailure,
  isRetryableFailure,
  isTransportFailure,
  redactRequest,
  retry,
  signature,
  toCarrierError,
  TokenBucket,
} from '../src';
import type { HttpRequest } from '../src';
import { fakeTime, ok, scriptedTransport } from './helpers';

const withCode = (message: string, code: string) => Object.assign(new TypeError(message), { cause: Object.assign(new Error(code), { code }) });

describe('error classification', () => {
  it('treats only transport failures as retryable raw errors', () => {
    expect(isTransportFailure(new TypeError('fetch failed'))).toBe(true);
    expect(isTransportFailure(new TypeError('Failed to fetch'))).toBe(true);
    expect(isTransportFailure(new TypeError('NetworkError when attempting to fetch resource.'))).toBe(true);
    expect(isTransportFailure(new TypeError('Load failed'))).toBe(true);
    expect(isTransportFailure(Object.assign(new Error('t'), { name: 'TimeoutError' }))).toBe(true);
    expect(isTransportFailure(withCode('x', 'ECONNRESET'))).toBe(true);
    expect(isTransportFailure(withCode('x', 'UND_ERR_SOCKET'))).toBe(true);
    expect(isTransportFailure(Object.assign(new Error('x'), { code: 'ENOTFOUND' }))).toBe(true);

    expect(isTransportFailure(new TypeError("Cannot read properties of undefined (reading 'x')"))).toBe(false);
    expect(isTransportFailure(new Error('boom'))).toBe(false);
    expect(isTransportFailure('plain')).toBe(false);
    expect(isRetryableFailure(new TypeError("Cannot read properties of undefined (reading 'x')"))).toBe(false);
    expect(isRetryableFailure(new RangeError('bad'))).toBe(false);
    expect(isRetryableFailure(withCode('fetch failed', 'ECONNRESET'))).toBe(true);
  });

  it('recognises failures that happened before sending', () => {
    expect(isPreSendFailure(withCode('fetch failed', 'ECONNREFUSED'))).toBe(true);
    expect(isPreSendFailure(withCode('fetch failed', 'EAI_AGAIN'))).toBe(true);
    expect(isPreSendFailure(withCode('fetch failed', 'ECONNRESET'))).toBe(false);
    expect(isPreSendFailure(new TypeError('fetch failed'))).toBe(false);
  });

  it('wraps unexpected values in a non-retryable UNEXPECTED_ERROR', () => {
    const bug = new RangeError('bug');
    expect(toCarrierError('x', bug)).toMatchObject({ code: 'UNEXPECTED_ERROR', category: 'unknown', retryable: false, cause: bug });
    expect(toCarrierError('x', 'plain')).toMatchObject({ message: 'plain' });
    const existing = new CarrierError({ carrier: 'x', code: 'E', message: 'm', category: CarrierErrorCategory.Server });
    expect(toCarrierError('x', existing)).toBe(existing);
  });
});

describe('HttpClient error mapping', () => {
  it('maps any transport rejection to a network error', async () => {
    const { transport } = scriptedTransport(new Error('socket hang up'));
    const http = createHttpClient({ carrier: 'x', baseUrl: 'https://api.test', transport, retry: false });
    await expect(http.request({ method: 'GET', path: '/' })).rejects.toMatchObject({ code: 'NETWORK_ERROR', retryable: true });
  });

  it('turns a bug in a custom middleware into UNEXPECTED_ERROR and does not retry it', async () => {
    const { transport, calls } = scriptedTransport(ok());
    const middleware = jest.fn(async () => {
      throw new TypeError("Cannot read properties of undefined (reading 'id')");
    });
    const http = createHttpClient({ carrier: 'x', baseUrl: 'https://api.test', transport, retry: { baseDelayMs: 0 }, middlewares: [middleware] });
    await expect(http.request({ method: 'GET', path: '/' })).rejects.toMatchObject({ code: 'UNEXPECTED_ERROR', category: 'unknown', retryable: false });
    expect(middleware).toHaveBeenCalledTimes(1);
    expect(calls).toHaveLength(0);
  });

  it('turns a non-CarrierError from an auth strategy or unwrap into UNEXPECTED_ERROR', async () => {
    const { transport } = scriptedTransport(ok({ a: 1 }));
    const broken = createHttpClient({ carrier: 'x', baseUrl: 'https://api.test', transport, auth: { apply: () => { throw new Error('no key'); } } });
    await expect(broken.send({ method: 'GET', path: '/' })).rejects.toMatchObject({ code: 'UNEXPECTED_ERROR', message: 'no key' });

    const unwrap = createHttpClient({ carrier: 'x', baseUrl: 'https://api.test', transport, unwrap: () => { throw new Error('bad envelope'); } });
    await expect(unwrap.request({ method: 'GET', path: '/' })).rejects.toMatchObject({ code: 'UNEXPECTED_ERROR', message: 'bad envelope' });
  });

  it('reports a caller abort with a custom reason as ABORTED', async () => {
    const bucket = new TokenBucket({ limit: 1, intervalMs: 60_000 });
    bucket.tryAcquire();
    const { transport } = scriptedTransport(ok());
    const http = createHttpClient({ carrier: 'x', baseUrl: 'https://api.test', transport, rateLimit: bucket });
    const controller = new AbortController();
    const pending = http.request({ method: 'GET', path: '/', signal: controller.signal });
    controller.abort('user left');
    await expect(pending).rejects.toMatchObject({ code: 'ABORTED', retryable: false });
  });

  it('runs custom middlewares before auth, so the signature covers their changes', async () => {
    const { transport, calls } = scriptedTransport(ok());
    const http = createHttpClient({
      carrier: 'x',
      baseUrl: 'https://api.test',
      transport,
      retry: false,
      middlewares: [(r, next) => next({ ...r, headers: { ...r.headers, 'X-Trace': '1' }, body: { kind: 'json', value: { traced: true } } })],
      auth: signature({
        sign: ({ request, body }) => `${request.headers?.['X-Trace'] ?? '-'}:${body}`,
        place: (request, sig) => ({ ...request, headers: { ...request.headers, sig } }),
      }),
    });
    await http.send({ method: 'POST', path: '/' });
    expect(calls[0]!.headers!.sig).toBe('1:{"traced":true}');
  });
});

describe('retry before sending', () => {
  it('repeats a POST when the connection was refused, but not after a reset', async () => {
    const time = fakeTime();
    const refused = scriptedTransport(withCode('fetch failed', 'ECONNREFUSED'), ok());
    const send = composeMiddleware(refused.transport, [retry({ sleep: time.sleep })]);
    expect((await send({ method: 'POST', url: 'u' })).status).toBe(200);
    expect(refused.calls).toHaveLength(2);

    const reset = scriptedTransport(withCode('fetch failed', 'ECONNRESET'), ok());
    await expect(composeMiddleware(reset.transport, [retry({ sleep: time.sleep })])({ method: 'POST', url: 'u' })).rejects.toThrow('fetch failed');
    expect(reset.calls).toHaveLength(1);
  });

  it('repeats a POST through the client when DNS failed', async () => {
    const { transport, calls } = scriptedTransport(withCode('fetch failed', 'ENOTFOUND'), ok({ ok: 1 }));
    const http = createHttpClient({ carrier: 'x', baseUrl: 'https://api.test', transport, retry: { baseDelayMs: 0 } });
    expect(await http.request({ method: 'POST', path: '/' })).toEqual({ ok: 1 });
    expect(calls).toHaveLength(2);
  });
});

describe('signature bodyBytes', () => {
  it('passes raw bytes for binary bodies and UTF-8 bytes otherwise', async () => {
    const seen: Uint8Array[] = [];
    const strategy = signature({
      sign: ({ bodyBytes }) => {
        seen.push(bodyBytes);
        return 's';
      },
      place: request => request,
    });
    const raw = new Uint8Array([0xff, 0x00, 0xfe]);
    await strategy.apply({ method: 'POST', url: 'u', body: { kind: 'binary', value: raw, contentType: 'application/octet-stream' } });
    await strategy.apply({ method: 'POST', url: 'u', body: { kind: 'text', value: 'ї', contentType: 'text/plain' } });
    await strategy.apply({ method: 'GET', url: 'u' } as HttpRequest);
    expect(seen[0]).toBe(raw);
    expect(Array.from(seen[1]!)).toEqual([0xd1, 0x97]);
    expect(seen[2]).toHaveLength(0);
  });
});

describe('redactUrl', () => {
  it('does not throw on malformed percent-encoding', () => {
    expect(redactRequest({ method: 'GET', url: 'https://x.test/?%E0%A4%A=1&token=s' }).url).toBe('https://x.test/?%E0%A4%A=1&token=***');
    expect(redactRequest({ method: 'GET', url: 'https://x.test/?a=%ZZ' }).url).toBe('https://x.test/?a=%ZZ');
  });
});

describe('TokenBucket.tryAcquire', () => {
  it('does not jump ahead of queued waiters', async () => {
    const time = fakeTime();
    let release!: () => void;
    const gate = new Promise<void>(resolve => (release = resolve));
    const bucket = new TokenBucket({
      limit: 1,
      intervalMs: 100,
      clock: time.clock,
      sleep: async ms => {
        await gate;
        time.advance(ms);
      },
    });
    await bucket.acquire();
    const order: string[] = [];
    const waiting = bucket.acquire().then(() => order.push('waiter'));
    time.advance(100);
    // A token is available now, but a waiter is queued ahead.
    expect(bucket.tryAcquire()).toBe(false);
    release();
    await waiting;
    expect(order).toEqual(['waiter']);
  });
});

describe('TokenBucket pump', () => {
  it('stops sleeping once the last waiter aborts', async () => {
    const signals: Array<AbortSignal | undefined> = [];
    const bucket = new TokenBucket({
      limit: 1,
      intervalMs: 60_000,
      clock: { now: () => 0 },
      sleep: (_ms, signal) =>
        new Promise((_, reject) => {
          signals.push(signal);
          signal?.addEventListener('abort', () => reject(signal.reason));
        }),
    });
    await bucket.acquire();
    const controller = new AbortController();
    const waiting = bucket.acquire(controller.signal);
    controller.abort(new Error('left'));
    await expect(waiting).rejects.toThrow('left');
    expect(signals[0]?.aborted).toBe(true);
  });
});
