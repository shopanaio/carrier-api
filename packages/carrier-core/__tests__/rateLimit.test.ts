import { composeMiddleware, rateLimit, TokenBucket } from '../src';
import { fakeTime, ok, scriptedTransport } from './helpers';

describe('TokenBucket', () => {
  it('allows a burst up to the limit, then refills at limit/interval', async () => {
    const time = fakeTime();
    const bucket = new TokenBucket({ limit: 2, intervalMs: 1000, clock: time.clock, sleep: time.sleep });
    await bucket.acquire();
    await bucket.acquire();
    expect(bucket.tryAcquire()).toBe(false);
    expect(bucket.waitTimeMs()).toBe(500);

    await bucket.acquire();
    expect(time.sleeps).toEqual([500]);

    time.advance(10_000);
    expect(bucket.tryAcquire()).toBe(true);
    expect(bucket.tryAcquire()).toBe(true);
    expect(bucket.tryAcquire()).toBe(false);
  });

  it('serves waiters in FIFO order', async () => {
    const time = fakeTime();
    const bucket = new TokenBucket({ limit: 1, intervalMs: 100, clock: time.clock, sleep: time.sleep });
    const order: number[] = [];
    await Promise.all([1, 2, 3].map(n => bucket.acquire().then(() => order.push(n))));
    expect(order).toEqual([1, 2, 3]);
    expect(time.sleeps).toEqual([100, 100]);
  });

  it('rejects invalid limits', () => {
    expect(() => new TokenBucket({ limit: 0, intervalMs: 1000 })).toThrow(TypeError);
    expect(() => new TokenBucket({ limit: 1, intervalMs: Number.NaN })).toThrow(TypeError);
  });
});

describe('rateLimit middleware', () => {
  it('waits for a token before each request', async () => {
    const time = fakeTime();
    const { transport, calls } = scriptedTransport(ok());
    const send = composeMiddleware(transport, [rateLimit({ limit: 1, intervalMs: 600, clock: time.clock, sleep: time.sleep })]);
    await send({ method: 'GET', url: 'https://x.test/1' });
    await send({ method: 'GET', url: 'https://x.test/2' });
    expect(calls).toHaveLength(2);
    expect(time.sleeps).toEqual([600]);
  });

  it('accepts a shared limiter instance', async () => {
    const limiter = { acquire: jest.fn(async () => undefined) };
    const { transport } = scriptedTransport(ok());
    await composeMiddleware(transport, [rateLimit(limiter)])({ method: 'GET', url: 'https://x.test' });
    expect(limiter.acquire).toHaveBeenCalledTimes(1);
  });
});
