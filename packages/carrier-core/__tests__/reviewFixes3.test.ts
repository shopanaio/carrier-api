import { createHttpClient, isPreSendFailure, isProgrammingError, TokenManager, tokenAuth } from '../src';
import { ok, scriptedTransport } from './helpers';

describe('transport rejections', () => {
  it('does not retry a bug inside the transport and reports it as UNEXPECTED_ERROR', async () => {
    const bug = new TypeError("Cannot read properties of undefined (reading 'status')");
    const { transport, calls } = scriptedTransport(bug);
    const http = createHttpClient({ carrier: 'x', baseUrl: 'https://api.test', transport, retry: { baseDelayMs: 0 } });
    await expect(http.request({ method: 'GET', path: '/' })).rejects.toMatchObject({
      code: 'UNEXPECTED_ERROR',
      retryable: false,
      cause: bug,
    });
    expect(calls).toHaveLength(1);
  });

  it('keeps fetch TypeErrors and library errors as network failures', () => {
    expect(isProgrammingError(new TypeError('fetch failed'))).toBe(false);
    expect(isProgrammingError(new TypeError('Network request failed'))).toBe(false);
    expect(isProgrammingError(new TypeError('terminated'))).toBe(false);
    expect(isProgrammingError(new Error('socket hang up'))).toBe(false);
    expect(isProgrammingError(new RangeError('Invalid array length'))).toBe(true);
  });

  it('repeats a POST after a connect timeout, which never reached the carrier', async () => {
    const connectTimeout = Object.assign(new TypeError('fetch failed'), {
      cause: Object.assign(new Error('connect timeout'), { code: 'UND_ERR_CONNECT_TIMEOUT' }),
    });
    expect(isPreSendFailure(connectTimeout)).toBe(true);
    const { transport, calls } = scriptedTransport(connectTimeout, ok({ id: 1 }));
    const http = createHttpClient({ carrier: 'x', baseUrl: 'https://api.test', transport, retry: { baseDelayMs: 0 } });
    expect(await http.request({ method: 'POST', path: '/', json: {} })).toEqual({ id: 1 });
    expect(calls).toHaveLength(2);
  });
});

describe('token renewal can be abandoned', () => {
  it('rejects a waiting request on abort while the hung login goes on', async () => {
    const login = jest.fn(() => new Promise<never>(() => undefined));
    const { transport, calls } = scriptedTransport(ok());
    // A short loginTimeoutMs only so no timer outlives the test.
    const http = createHttpClient({
      carrier: 'x',
      baseUrl: 'https://api.test',
      transport,
      auth: tokenAuth({ login, loginTimeoutMs: 20 }),
    });
    const controller = new AbortController();
    const pending = http.request({ method: 'GET', path: '/', signal: controller.signal });
    controller.abort();
    await expect(pending).rejects.toMatchObject({ code: 'ABORTED', retryable: false });
    expect(calls).toHaveLength(0);
  });

  it('fails a login that takes longer than loginTimeoutMs with a retryable timeout', async () => {
    const login = jest
      .fn<Promise<{ accessToken: string }>, []>()
      .mockImplementationOnce(() => new Promise(() => undefined))
      .mockResolvedValue({ accessToken: 't' });
    const { transport, calls } = scriptedTransport(ok({ ok: 1 }));
    const http = createHttpClient({
      carrier: 'x',
      baseUrl: 'https://api.test',
      transport,
      retry: { baseDelayMs: 0 },
      auth: tokenAuth({ login, loginTimeoutMs: 5 }),
    });
    expect(await http.request({ method: 'GET', path: '/' })).toEqual({ ok: 1 });
    expect(login).toHaveBeenCalledTimes(2);
    expect(calls).toHaveLength(1);
  });

  it('does not fall back to a full login when refresh fails on the network', async () => {
    let now = 0;
    const login = jest.fn(async () => ({ accessToken: 'L', refreshToken: 'r', expiresInSec: 1 }));
    const refresh = jest.fn(async () => {
      throw new TypeError('fetch failed');
    });
    const manager = new TokenManager({ login, refresh, refreshSkewMs: 0, clock: { now: () => now } });
    await manager.getToken();
    now = 5_000;
    await expect(manager.getToken()).rejects.toThrow('fetch failed');
    expect(login).toHaveBeenCalledTimes(1);
  });

  it('still logs in when the refresh token is rejected', async () => {
    let now = 0;
    const login = jest.fn(async () => ({
      accessToken: `L${login.mock.calls.length}`,
      refreshToken: 'r',
      expiresInSec: 1,
    }));
    const refresh = jest.fn(async () => {
      throw new Error('invalid_grant');
    });
    const manager = new TokenManager({ login, refresh, refreshSkewMs: 0, clock: { now: () => now } });
    await manager.getToken();
    now = 5_000;
    expect(await manager.getToken()).toBe('L2');
  });
});
