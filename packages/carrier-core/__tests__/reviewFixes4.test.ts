import {
  bodyCredentials,
  createClient,
  createHttpClient,
  isProgrammingError,
  oauth2ClientCredentials,
  TokenManager,
  tokenAuth,
} from '../src';
import type { HttpRequest, TokenCallContext } from '../src';
import { fakeTime, ok, scriptedTransport } from './helpers';

describe('a throwing logger', () => {
  const logger = jest.fn(() => {
    throw new Error('log sink down');
  });

  it('does not turn a sent POST into a failure', async () => {
    const { transport, calls } = scriptedTransport(ok({ id: 'S1' }));
    const http = createHttpClient({ carrier: 'x', baseUrl: 'https://api.test', transport, logger });
    expect(await http.request({ method: 'POST', path: '/shipments', json: {} })).toEqual({ id: 'S1' });
    expect(calls).toHaveLength(1);
  });

  it('keeps the original error of a failed attempt and logs it once', async () => {
    logger.mockClear();
    const { transport } = scriptedTransport(new TypeError('fetch failed'));
    const http = createHttpClient({ carrier: 'x', baseUrl: 'https://api.test', transport, logger, retry: false });
    await expect(http.request({ method: 'GET', path: '/' })).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
    expect(logger).toHaveBeenCalledTimes(1);
  });
});

describe('token freshness', () => {
  it('renews a token living shorter than refreshSkewMs only after half its lifetime', async () => {
    const time = fakeTime();
    let logins = 0;
    const manager = new TokenManager({
      clock: time.clock,
      login: async () => ({ accessToken: `t${++logins}`, expiresInSec: 30 }),
    });
    for (let i = 0; i < 5; i += 1) expect(await manager.getToken()).toBe('t1');
    time.advance(14_000);
    expect(await manager.getToken()).toBe('t1');
    time.advance(2_000);
    expect(await manager.getToken()).toBe('t2');
  });

  it('treats a NaN or infinite expiry from login as absent', async () => {
    const login = jest.fn(async () => ({ accessToken: 't', expiresInSec: Number('soon'), expiresAt: Infinity }));
    const manager = new TokenManager({ login });
    for (let i = 0; i < 3; i += 1) await manager.getToken();
    expect(login).toHaveBeenCalledTimes(1);
  });

  it('rejects a non-positive loginTimeoutMs', () => {
    expect(() => tokenAuth({ login: async () => ({ accessToken: 't' }), loginTimeoutMs: 0 })).toThrow(/loginTimeoutMs/);
    expect(() =>
      oauth2ClientCredentials({
        tokenUrl: 'https://auth.test/token',
        clientId: 'c',
        clientSecret: 's',
        transport: scriptedTransport(ok()).transport,
        tokenTimeoutMs: -1,
      }),
    ).toThrow(/tokenTimeoutMs/);
  });
});

describe('login timeout', () => {
  it('aborts the hung login through its signal instead of piling up logins', async () => {
    const signals: AbortSignal[] = [];
    const login = jest.fn(
      ({ signal }: TokenCallContext) =>
        new Promise<never>((_, reject) => {
          signals.push(signal);
          signal.addEventListener('abort', () => reject(signal.reason));
        }),
    );
    const { transport, calls } = scriptedTransport(ok());
    const http = createHttpClient({
      carrier: 'x',
      baseUrl: 'https://api.test',
      transport,
      retry: { baseDelayMs: 0 },
      auth: tokenAuth({ login, loginTimeoutMs: 5 }),
    });
    await expect(http.request({ method: 'GET', path: '/' })).rejects.toMatchObject({
      code: 'TIMEOUT',
      retryable: true,
    });
    expect(login).toHaveBeenCalledTimes(3);
    expect(signals.every(signal => signal.aborted)).toBe(true);
    expect(calls).toHaveLength(0);
  });

  it('repeats a POST whose login timed out, since nothing was sent yet', async () => {
    const login = jest
      .fn<Promise<{ accessToken: string }>, [TokenCallContext]>()
      .mockImplementationOnce(() => new Promise(() => undefined))
      .mockResolvedValue({ accessToken: 't' });
    const { transport, calls } = scriptedTransport(ok({ id: 1 }));
    const http = createHttpClient({
      carrier: 'x',
      baseUrl: 'https://api.test',
      transport,
      retry: { baseDelayMs: 0 },
      auth: tokenAuth({ login, loginTimeoutMs: 5 }),
    });
    expect(await http.request({ method: 'POST', path: '/shipments', json: {} })).toEqual({ id: 1 });
    expect(calls).toHaveLength(1);
  });

  it('passes the signal to the OAuth2 token request', async () => {
    const tokenCalls = scriptedTransport(ok({ access_token: 'at', expires_in: 3600 }));
    const strategy = oauth2ClientCredentials({
      tokenUrl: 'https://auth.test/token',
      clientId: 'c',
      clientSecret: 's',
      transport: tokenCalls.transport,
      tokenTimeoutMs: 1_000,
    });
    await strategy.apply({ method: 'GET', url: 'https://api.test/' });
    const tokenRequest = tokenCalls.calls[0] as HttpRequest;
    expect(tokenRequest.signal).toBeInstanceOf(AbortSignal);
    expect(tokenRequest.timeoutMs).toBe(1_000);
  });
});

describe('smaller fixes', () => {
  it('classifies URIError and EvalError as programming errors', () => {
    expect(isProgrammingError(new URIError('URI malformed'))).toBe(true);
    expect(isProgrammingError(new EvalError('x'))).toBe(true);
  });

  it('refuses to let a body field silently replace body credentials', async () => {
    const post = (value: Record<string, unknown>): HttpRequest => ({
      method: 'POST',
      url: 'https://api.test/',
      body: { kind: 'json', value },
    });
    await expect(bodyCredentials({ apiKey: 'k' }).apply(post({ apiKey: 'other' }))).rejects.toThrow(/"apiKey"/);
    await expect(
      bodyCredentials({ UserName: 'u' }, { path: 'ClientInfo' }).apply(post({ ClientInfo: {} })),
    ).rejects.toThrow(/"ClientInfo"/);
    await expect(
      bodyCredentials({ key: 'k' }).apply({ ...post({}), body: { kind: 'form', value: { key: 'x' } } }),
    ).rejects.toThrow(/"key"/);
  });

  it('allows namespaces named like Object.prototype members', () => {
    const client = createClient({}).use({ namespace: 'toString' as const });
    expect(client.toString).toEqual({ namespace: 'toString' });
    expect(() => client.use({ namespace: 'toString' as const })).toThrow(/already installed/);
  });
});
