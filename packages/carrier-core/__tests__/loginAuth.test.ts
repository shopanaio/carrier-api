import { createHttpClient, InMemoryTokenStore, oauth2ClientCredentials, TokenManager, tokenAuth } from '../src';
import { ok, scriptedTransport, status } from './helpers';

describe('TokenManager login failures', () => {
  it('turns an unexpected login error into a non-retryable LOGIN_FAILED for the carrier', async () => {
    const bug = new RangeError('bad config');
    const manager = new TokenManager({ carrier: 'meest', login: async () => Promise.reject(bug) });
    await expect(manager.getToken()).rejects.toMatchObject({
      carrier: 'meest',
      code: 'LOGIN_FAILED',
      category: 'authentication',
      retryable: false,
      cause: bug,
    });
    await expect(new TokenManager({ login: async () => Promise.reject('nope') }).getToken()).rejects.toMatchObject({
      carrier: 'unknown',
      message: 'nope',
    });
  });

  it('does not retry LOGIN_FAILED through the client', async () => {
    const login = jest.fn(async () => {
      throw new Error('unexpected payload');
    });
    const { transport, calls } = scriptedTransport(ok());
    const http = createHttpClient({ carrier: 'meest', baseUrl: 'https://x.test', transport, retry: { baseDelayMs: 0 }, auth: tokenAuth({ carrier: 'meest', login }) });
    await expect(http.request({ method: 'GET', path: '/a' })).rejects.toMatchObject({ code: 'LOGIN_FAILED', carrier: 'meest' });
    expect(login).toHaveBeenCalledTimes(1);
    expect(calls).toHaveLength(0);
  });

  it('lets transport failures of the login call through, so they are retried as network errors', async () => {
    const login = jest
      .fn()
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValue({ accessToken: 't' });
    const { transport, calls } = scriptedTransport(ok({ ok: 1 }));
    const http = createHttpClient({ carrier: 'meest', baseUrl: 'https://x.test', transport, retry: { baseDelayMs: 0 }, auth: tokenAuth({ login }) });
    expect(await http.request({ method: 'GET', path: '/a' })).toEqual({ ok: 1 });
    expect(login).toHaveBeenCalledTimes(2);
    expect(calls[0]!.headers).toMatchObject({ Authorization: 'Bearer t' });
  });
});

describe('TokenManager key function', () => {
  it('resolves the key on every call and keeps one token per account', async () => {
    let account = 'A';
    const key = jest.fn(() => `meest|${account}`);
    const login = jest.fn(async () => ({ accessToken: `token-${account}` }));
    const store = new InMemoryTokenStore();
    const manager = new TokenManager({ login, key, store });
    expect(await manager.getToken()).toBe('token-A');
    account = 'B';
    expect(await manager.getToken()).toBe('token-B');
    account = 'A';
    expect(await manager.getToken()).toBe('token-A');
    expect(login).toHaveBeenCalledTimes(2);
    expect(key).toHaveBeenCalledTimes(3);
    expect(store.get('meest|B')).toMatchObject({ accessToken: 'token-B' });
  });

  it('shares one login per key, not across keys', async () => {
    let release!: () => void;
    const gate = new Promise<void>(resolve => (release = resolve));
    let account = 'A';
    const login = jest.fn(async () => {
      const owner = account;
      await gate;
      return { accessToken: `token-${owner}` };
    });
    const manager = new TokenManager({ login, key: async () => account });
    const a1 = manager.getToken();
    const a2 = manager.getToken();
    await Promise.resolve();
    await Promise.resolve();
    account = 'B';
    const b = manager.getToken();
    await new Promise(resolve => setImmediate(resolve));
    release();
    expect(await Promise.all([a1, a2, b])).toEqual(['token-A', 'token-A', 'token-B']);
    expect(login).toHaveBeenCalledTimes(2);
  });
});

describe('OAuth2 token endpoint errors', () => {
  const strategy = (code: number) =>
    oauth2ClientCredentials({
      carrier: 'ups',
      tokenUrl: 'https://auth.test/token',
      clientId: 'c',
      clientSecret: 's',
      transport: scriptedTransport(status(code, { error: 'e' })).transport,
    });

  it.each([
    [429, 'rate_limit', true],
    [503, 'server', true],
    [401, 'authentication', false],
    [400, 'authentication', false],
  ])('maps HTTP %i to %s (retryable %s) with the carrier slug', async (code, category, retryable) => {
    await expect(strategy(code).apply({ method: 'GET', url: 'u' })).rejects.toMatchObject({ carrier: 'ups', category, retryable, httpStatus: code });
  });

  it('retries a throttled token call through the client', async () => {
    const tokenCalls = scriptedTransport(status(429, {}), ok({ access_token: 'tok', expires_in: 3600 }));
    const auth = oauth2ClientCredentials({ carrier: 'ups', tokenUrl: 'https://auth.test/token', clientId: 'c', clientSecret: 's', transport: tokenCalls.transport });
    const { transport, calls } = scriptedTransport(ok({ ok: 1 }));
    const http = createHttpClient({ carrier: 'ups', baseUrl: 'https://x.test', transport, retry: { baseDelayMs: 0 }, auth });
    expect(await http.request({ method: 'GET', path: '/a' })).toEqual({ ok: 1 });
    expect(tokenCalls.calls).toHaveLength(2);
    expect(calls[0]!.headers).toMatchObject({ Authorization: 'Bearer tok' });
  });
});
