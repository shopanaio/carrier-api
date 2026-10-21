import { composeMiddleware, parseRetryAfter, retry } from '../src';
import { fakeTime, ok, scriptedTransport, status } from './helpers';

describe('retry middleware', () => {
  const setup = (opts: Parameters<typeof retry>[0], ...steps: Parameters<typeof scriptedTransport>) => {
    const time = fakeTime();
    const scripted = scriptedTransport(...steps);
    const send = composeMiddleware(scripted.transport, [retry({ sleep: time.sleep, clock: time.clock, jitter: 'none', baseDelayMs: 100, ...opts })]);
    return { ...scripted, time, send };
  };

  it('retries 5xx on GET with exponential backoff', async () => {
    const { send, calls, time } = setup({}, status(503), status(502), ok({ done: true }));
    const res = await send({ method: 'GET', url: 'https://x.test' });
    expect(res.data).toEqual({ done: true });
    expect(calls).toHaveLength(3);
    expect(time.sleeps).toEqual([100, 200]);
  });

  it('does not retry 5xx on a non-idempotent POST', async () => {
    const { send, calls } = setup({}, status(500), ok());
    const res = await send({ method: 'POST', url: 'https://x.test' });
    expect(res.status).toBe(500);
    expect(calls).toHaveLength(1);
  });

  it('retries 5xx on POST marked idempotent or when retryNonIdempotent is on', async () => {
    const a = setup({}, status(500), ok());
    expect((await a.send({ method: 'POST', url: 'https://x.test', idempotent: true })).status).toBe(200);
    const b = setup({ retryNonIdempotent: true }, status(500), ok());
    expect((await b.send({ method: 'POST', url: 'https://x.test' })).status).toBe(200);
  });

  it('retries 429 on POST and honours Retry-After seconds', async () => {
    const { send, calls, time } = setup({}, status(429, {}, { 'retry-after': '2' }), ok());
    const res = await send({ method: 'POST', url: 'https://x.test' });
    expect(res.status).toBe(200);
    expect(calls).toHaveLength(2);
    expect(time.sleeps).toEqual([2000]);
  });

  it('gives up when Retry-After exceeds maxRetryAfterMs', async () => {
    const { send, calls } = setup({ maxRetryAfterMs: 1000 }, status(429, {}, { 'retry-after': '120' }), ok());
    expect((await send({ method: 'GET', url: 'https://x.test' })).status).toBe(429);
    expect(calls).toHaveLength(1);
  });

  it('stops after maxRetries and returns the last response', async () => {
    const { send, calls } = setup({ maxRetries: 1 }, status(503));
    expect((await send({ method: 'GET', url: 'https://x.test' })).status).toBe(503);
    expect(calls).toHaveLength(2);
  });

  it('retries network errors on GET but not on POST', async () => {
    const get = setup({}, new TypeError('fetch failed'), ok());
    expect((await get.send({ method: 'GET', url: 'https://x.test' })).status).toBe(200);
    const post = setup({}, new TypeError('fetch failed'), ok());
    await expect(post.send({ method: 'POST', url: 'https://x.test' })).rejects.toThrow('fetch failed');
    expect(post.calls).toHaveLength(1);
  });

  it('rethrows after the last network failure and never retries aborts', async () => {
    const a = setup({ maxRetries: 1 }, new TypeError('fetch failed'));
    await expect(a.send({ method: 'GET', url: 'https://x.test' })).rejects.toThrow('fetch failed');
    expect(a.calls).toHaveLength(2);

    const abort = Object.assign(new Error('aborted'), { name: 'AbortError' });
    const b = setup({}, abort, ok());
    await expect(b.send({ method: 'GET', url: 'https://x.test' })).rejects.toBe(abort);
    expect(b.calls).toHaveLength(1);
  });

  it('retries 2xx responses matched by the carrier predicate, even on POST', async () => {
    const throttled = ok({ errorCodes: ['20000401501'] });
    const onRetry = jest.fn();
    const { send, calls } = setup(
      { shouldRetryResponse: r => (r.data as { errorCodes?: string[] }).errorCodes?.includes('20000401501') ?? false, onRetry },
      throttled,
      ok({ errorCodes: [] }),
    );
    expect((await send({ method: 'POST', url: 'https://x.test' })).data).toEqual({ errorCodes: [] });
    expect(calls).toHaveLength(2);
    expect(onRetry).toHaveBeenCalledWith(expect.objectContaining({ attempt: 1, delayMs: 100 }));
  });

  it('uses full jitter by default', async () => {
    const time = fakeTime();
    const { transport } = scriptedTransport(status(503), ok());
    const send = composeMiddleware(transport, [retry({ sleep: time.sleep, baseDelayMs: 1000, random: () => 0.25 })]);
    await send({ method: 'GET', url: 'https://x.test' });
    expect(time.sleeps).toEqual([250]);
  });

  it('can treat 429 as final when removed from retryOnStatus', async () => {
    const { send, calls } = setup({ retryOnStatus: [503] }, status(429), ok());
    expect((await send({ method: 'GET', url: 'https://x.test' })).status).toBe(429);
    expect(calls).toHaveLength(1);
  });

  it('validates options', () => {
    expect(() => retry({ maxRetries: -1 })).toThrow(TypeError);
  });
});

describe('parseRetryAfter', () => {
  it('parses seconds and HTTP dates', () => {
    const now = Date.parse('2026-10-18T10:00:00Z');
    expect(parseRetryAfter('3', now)).toBe(3000);
    expect(parseRetryAfter('0.5', now)).toBe(500);
    expect(parseRetryAfter('Sun, 18 Oct 2026 10:00:05 GMT', now)).toBe(5000);
    expect(parseRetryAfter('Sun, 18 Oct 2026 09:00:00 GMT', now)).toBe(0);
    expect(parseRetryAfter('soon', now)).toBeUndefined();
    expect(parseRetryAfter('', now)).toBeUndefined();
    expect(parseRetryAfter(undefined, now)).toBeUndefined();
  });
});
