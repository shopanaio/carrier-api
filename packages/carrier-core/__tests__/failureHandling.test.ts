import {
  CarrierError,
  CarrierErrorCategory,
  createHttpClient,
  InMemoryTokenStore,
  isRetryableFailure,
  oauth2ClientCredentials,
  oauth2Password,
  redactRequest,
  retry,
  composeMiddleware,
  TokenBucket,
  TokenManager,
  tokenAuth,
} from '../src';
import { fakeTime, ok, scriptedTransport, status } from './helpers';

const authError = () => new CarrierError({ carrier: 't', code: 'BAD_LOGIN', message: 'bad credentials', category: CarrierErrorCategory.Authentication });

describe('retry and thrown errors', () => {
  it('does not repeat a non-retryable CarrierError, such as a failed login', async () => {
    const login = jest.fn(async () => {
      throw authError();
    });
    const { transport, calls } = scriptedTransport(ok());
    const http = createHttpClient({ carrier: 't', baseUrl: 'https://x.test', transport, retry: { baseDelayMs: 0 }, auth: tokenAuth({ login }) });
    await expect(http.request({ method: 'GET', path: '/a' })).rejects.toMatchObject({ code: 'BAD_LOGIN', category: 'authentication' });
    expect(login).toHaveBeenCalledTimes(1);
    expect(calls).toHaveLength(0);
  });

  it('repeats retryable CarrierErrors and plain transport failures', async () => {
    const time = fakeTime();
    const send = composeMiddleware(scriptedTransport(new TypeError('fetch failed'), ok({ n: 1 })).transport, [retry({ sleep: time.sleep })]);
    expect((await send({ method: 'GET', url: 'u' })).data).toEqual({ n: 1 });

    const flaky = jest.fn().mockRejectedValueOnce(new CarrierError({ carrier: 't', code: 'E', message: 'm', category: CarrierErrorCategory.Server })).mockResolvedValue(ok());
    await composeMiddleware(flaky as never, [retry({ sleep: time.sleep })])({ method: 'GET', url: 'u' });
    expect(flaky).toHaveBeenCalledTimes(2);
  });

  it('passes fatal errors (simulator contract violations) through untouched and unrepeated', async () => {
    const fatal = Object.assign(new Error('handler broke the contract'), { name: 'SimulatorError', fatal: true });
    const { transport, calls } = scriptedTransport(fatal);
    const http = createHttpClient({ carrier: 't', baseUrl: 'https://x.test', transport, retry: { baseDelayMs: 0 } });
    await expect(http.request({ method: 'GET', path: '/a' })).rejects.toBe(fatal);
    await expect(http.send({ method: 'GET', path: '/a' })).rejects.toBe(fatal);
    expect(calls).toHaveLength(2);
  });

  it('classifies failures', () => {
    expect(isRetryableFailure(new TypeError('fetch failed'))).toBe(true);
    expect(isRetryableFailure(Object.assign(new Error('a'), { name: 'AbortError' }))).toBe(false);
    expect(isRetryableFailure(authError())).toBe(false);
    expect(isRetryableFailure({ fatal: true })).toBe(false);
  });
});

describe('token cache keys', () => {
  const tokenTransport = (scripted: Record<string, string>) =>
    (async (request: { body?: { value: Record<string, string> }; headers?: Record<string, string> }) => {
      const id = request.body?.value.client_id ?? Buffer.from((request.headers?.Authorization ?? '').slice(6), 'base64').toString().split(':')[0]!;
      return ok({ access_token: scripted[id], expires_in: 3600 });
    }) as never;

  it('keeps two OAuth2 accounts apart in a shared store', async () => {
    const store = new InMemoryTokenStore();
    const transport = tokenTransport({ A: 'token-A', B: 'token-B' });
    const a = oauth2ClientCredentials({ tokenUrl: 'https://auth.test/token', clientId: 'A', clientSecret: 's', store, transport });
    const b = oauth2ClientCredentials({ tokenUrl: 'https://auth.test/token', clientId: () => 'B', clientSecret: 's', store, transport });
    expect((await a.apply({ method: 'GET', url: 'u' })).headers).toEqual({ Authorization: 'Bearer token-A' });
    expect((await b.apply({ method: 'GET', url: 'u' })).headers).toEqual({ Authorization: 'Bearer token-B' });
    expect(store.get('https://auth.test/token|A')).toMatchObject({ accessToken: 'token-A' });
  });

  it('includes the username for the password grant', async () => {
    const store = new InMemoryTokenStore();
    const transport = (async () => ok({ access_token: 't' })) as never;
    await oauth2Password({ tokenUrl: 'https://auth.test/token', clientId: 'c', clientSecret: 's', username: 'u1', password: 'p', store, transport }).apply({ method: 'GET', url: 'u' });
    expect(store.get('https://auth.test/token|c|u1')).toBeDefined();
  });

  it('requires an explicit key with a shared store', () => {
    expect(() => tokenAuth({ login: async () => ({ accessToken: 't' }), store: new InMemoryTokenStore() })).toThrow(/pass `key`/);
    expect(() => new TokenManager({ login: async () => ({ accessToken: 't' }), store: new InMemoryTokenStore(), key: async () => 'meest|user' })).not.toThrow();
  });

  it('treats a malformed expires_in as absent instead of logging in on every call', async () => {
    const transport = jest.fn(async () => ok({ access_token: 't', expires_in: 'soon' }));
    const strategy = oauth2ClientCredentials({ tokenUrl: 'https://auth.test/token', clientId: 'c', clientSecret: 's', transport: transport as never });
    await strategy.apply({ method: 'GET', url: 'u' });
    await strategy.apply({ method: 'GET', url: 'u' });
    expect(transport).toHaveBeenCalledTimes(1);
  });
});

describe('rate limiter', () => {
  it('rejects at once for an aborted signal and leaves the queue when aborted while waiting', async () => {
    const bucket = new TokenBucket({ limit: 1, intervalMs: 60_000 });
    await bucket.acquire();
    const aborted = new AbortController();
    aborted.abort(new Error('gone'));
    await expect(bucket.acquire(aborted.signal)).rejects.toThrow('gone');

    const controller = new AbortController();
    const waiting = bucket.acquire(controller.signal);
    controller.abort(Object.assign(new Error('cancelled'), { name: 'AbortError' }));
    await expect(waiting).rejects.toThrow('cancelled');
  });

  it('cancels a request waiting for a token through the client', async () => {
    const bucket = new TokenBucket({ limit: 1, intervalMs: 60_000 });
    bucket.tryAcquire();
    const { transport, calls } = scriptedTransport(ok());
    const http = createHttpClient({ carrier: 't', baseUrl: 'https://x.test', transport, rateLimit: bucket });
    const controller = new AbortController();
    const pending = http.request({ method: 'GET', path: '/a', signal: controller.signal });
    controller.abort();
    await expect(pending).rejects.toMatchObject({ code: 'ABORTED' });
    expect(calls).toHaveLength(0);
  });

  it('serves the waiters left after an abort in order', async () => {
    const time = fakeTime();
    const bucket = new TokenBucket({ limit: 1, intervalMs: 100, clock: time.clock, sleep: time.sleep });
    await bucket.acquire();
    const order: number[] = [];
    const controller = new AbortController();
    const first = bucket.acquire(controller.signal).then(() => order.push(1), () => order.push(-1));
    const second = bucket.acquire().then(() => order.push(2));
    controller.abort();
    await Promise.all([first, second]);
    expect(order).toEqual([-1, 2]);
  });

  it('rejects every waiter when sleeping fails instead of stalling', async () => {
    const bucket = new TokenBucket({ limit: 1, intervalMs: 1000, clock: { now: () => 0 }, sleep: async () => { throw new Error('timer broke'); } });
    await bucket.acquire();
    await expect(bucket.acquire()).rejects.toThrow('timer broke');
  });

  it('refuses a limit below one token', () => {
    expect(() => new TokenBucket({ limit: 0.5, intervalMs: 1000 })).toThrow(/at least 1/);
  });

  it('takes a token for the repeat after a 401', async () => {
    const limiter = { acquire: jest.fn(async () => undefined) };
    let n = 0;
    const { transport } = scriptedTransport(status(401), ok());
    const http = createHttpClient({ carrier: 't', baseUrl: 'https://x.test', transport, retry: false, rateLimit: limiter, auth: tokenAuth({ login: async () => ({ accessToken: `t${n++}` }) }) });
    await http.request({ method: 'GET', path: '/a' });
    expect(limiter.acquire).toHaveBeenCalledTimes(2);
  });
});

describe('redaction', () => {
  it('masks camelCase access tokens and x-auth-token headers', () => {
    const redacted = redactRequest({ method: 'POST', url: 'u', headers: { 'X-Auth-Token': 'secret' }, body: { kind: 'json', value: { accessToken: 'a', name: 'n' } } });
    expect(redacted).toMatchObject({ headers: { 'X-Auth-Token': '***' }, body: { accessToken: '***', name: 'n' } });
  });
});
