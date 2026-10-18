import { CarrierError, composeMiddleware, InMemoryTokenStore, oauth2ClientCredentials, oauth2Password, auth, tokenAuth, TokenManager, tokenUsedBy } from '../src';
import type { HttpRequest } from '../src';
import { fakeTime, ok, scriptedTransport, status } from './helpers';

const req = (): HttpRequest => ({ method: 'GET', url: 'https://x.test/parcel' });

describe('TokenManager', () => {
  it('logs in once for concurrent callers and caches the token', async () => {
    let resolveLogin!: (v: { accessToken: string; expiresInSec: number }) => void;
    const login = jest.fn(() => new Promise<{ accessToken: string; expiresInSec: number }>(r => (resolveLogin = r)));
    const manager = new TokenManager({ login });
    const pending = Promise.all([manager.getToken(), manager.getToken(), manager.getToken()]);
    await Promise.resolve();
    resolveLogin({ accessToken: 't1', expiresInSec: 3600 });
    expect(await pending).toEqual(['t1', 't1', 't1']);
    expect(await manager.getToken()).toBe('t1');
    expect(login).toHaveBeenCalledTimes(1);
  });

  it('refreshes ahead of expiry and falls back to login when refresh fails', async () => {
    const time = fakeTime();
    const login = jest.fn().mockResolvedValueOnce({ accessToken: 'a', refreshToken: 'r1', expiresInSec: 120 }).mockResolvedValueOnce({ accessToken: 'c', expiresInSec: 120 });
    const refresh = jest.fn().mockResolvedValueOnce({ accessToken: 'b', expiresInSec: 120 }).mockRejectedValueOnce(new Error('refresh expired'));
    const manager = new TokenManager({ login, refresh, clock: time.clock, refreshSkewMs: 30_000 });

    expect(await manager.getToken()).toBe('a');
    time.advance(60_000);
    expect(await manager.getToken()).toBe('a'); // still outside the skew window
    time.advance(31_000);
    expect(await manager.getToken()).toBe('b'); // refreshed with r1
    expect(refresh).toHaveBeenLastCalledWith('r1', { signal: expect.any(AbortSignal) });
    time.advance(100_000);
    expect(await manager.getToken()).toBe('c'); // refresh (kept r1) failed → login
    expect(login).toHaveBeenCalledTimes(2);
  });

  it('skips refresh once the refresh token itself expired', async () => {
    const time = fakeTime();
    const login = jest.fn().mockResolvedValueOnce({ accessToken: 'a', refreshToken: 'r', expiresInSec: 10, refreshExpiresInSec: 20 }).mockResolvedValueOnce({ accessToken: 'b' });
    const refresh = jest.fn();
    const manager = new TokenManager({ login, refresh, clock: time.clock, refreshSkewMs: 0 });
    await manager.getToken();
    time.advance(25_000);
    expect(await manager.getToken()).toBe('b');
    expect(refresh).not.toHaveBeenCalled();
  });

  it('applies defaultTtlMs when the grant has no expiry', async () => {
    const time = fakeTime();
    const login = jest.fn().mockResolvedValueOnce({ accessToken: 'a' }).mockResolvedValueOnce({ accessToken: 'b' });
    const manager = new TokenManager({ login, clock: time.clock, defaultTtlMs: 1000, refreshSkewMs: 0 });
    expect(await manager.getToken()).toBe('a');
    time.advance(1001);
    expect(await manager.getToken()).toBe('b');
  });

  it('invalidates only the token that was rejected', async () => {
    const store = new InMemoryTokenStore();
    const manager = new TokenManager({ login: async () => ({ accessToken: 'new' }), store, key: 'default' });
    store.set('default', { accessToken: 'current' });
    await manager.invalidate('stale');
    expect(store.get('default')).toEqual({ accessToken: 'current' });
    await manager.invalidate('current');
    expect(store.get('default')).toBeUndefined();
    await manager.invalidate(); // nothing stored: no-op
    expect(await manager.getToken()).toBe('new');
    await manager.clear();
    expect(store.get('default')).toBeUndefined();
  });

  it('keeps the refresh token when invalidating so the next call refreshes first', async () => {
    const store = new InMemoryTokenStore();
    const refresh = jest.fn(async () => ({ accessToken: 'refreshed' }));
    const manager = new TokenManager({ login: async () => ({ accessToken: 'login', refreshToken: 'r' }), refresh, store, key: 'default' });
    await manager.getToken();
    await manager.invalidate('login');
    expect(await manager.getToken()).toBe('refreshed');
    expect(store.get('default')).toMatchObject({ accessToken: 'refreshed', refreshToken: 'r' });
  });
});

describe('tokenAuth strategy', () => {
  it('sends the token in a custom header and recovers from a 401 with one refresh', async () => {
    const login = jest.fn(async () => ({ accessToken: 'login-token', refreshToken: 'r', expiresInSec: 86400 }));
    const refresh = jest.fn(async () => ({ accessToken: 'refreshed-token', expiresInSec: 86400 }));
    const strategy = tokenAuth({ login, refresh, header: 'token' });
    const { transport, calls } = scriptedTransport(status(401), ok({ status: 'OK' }));

    const res = await composeMiddleware(transport, [auth(strategy)])(req());
    expect(res.status).toBe(200);
    expect(calls.map(c => c.headers!.token)).toEqual(['login-token', 'refreshed-token']);
    expect(tokenUsedBy(calls[1]!)).toBe('refreshed-token');
    expect(login).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledWith('r', { signal: expect.any(AbortSignal) });
  });

  it('defaults to Authorization: Bearer and supports custom placement', async () => {
    const def = await tokenAuth({ login: async () => ({ accessToken: 't' }) }).apply(req());
    expect(def.headers).toEqual({ Authorization: 'Bearer t' });
    const custom = await tokenAuth({ login: async () => ({ accessToken: 't' }), applyToken: (r, t) => ({ ...r, query: { sid: t } }) }).apply(req());
    expect(custom.query).toEqual({ sid: 't' });
    expect(tokenUsedBy({ method: 'GET', url: 'x', headers: { authorization: 'Bearer z' } })).toBe('Bearer z');
  });
});

describe('oauth2', () => {
  it('requests a client-credentials token with basic client auth and caches it', async () => {
    const { transport, calls } = scriptedTransport(ok({ access_token: 'at', expires_in: 3600, token_type: 'Bearer' }));
    const strategy = oauth2ClientCredentials({ tokenUrl: 'https://auth.test/token', clientId: 'id', clientSecret: 'sec', scope: 'ship', transport });
    const applied = await strategy.apply(req());
    await strategy.apply(req());
    expect(applied.headers).toEqual({ Authorization: 'Bearer at' });
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      method: 'POST',
      url: 'https://auth.test/token',
      headers: { Authorization: `Basic ${Buffer.from('id:sec').toString('base64')}` },
      body: { kind: 'form', value: { grant_type: 'client_credentials', scope: 'ship' } },
    });
  });

  it('supports the password grant with client credentials in the body', async () => {
    const { transport, calls } = scriptedTransport(ok({ access_token: 'at', refresh_token: 'rt' }));
    const strategy = oauth2Password({ tokenUrl: 'https://auth.test/token', clientId: 'id', clientSecret: 'sec', clientAuth: 'body', username: 'u', password: 'p', transport, extraParams: { audience: 'x' } });
    await strategy.apply(req());
    expect(calls[0]!.body).toEqual({
      kind: 'form',
      value: { grant_type: 'password', username: 'u', password: 'p', audience: 'x', client_id: 'id', client_secret: 'sec' },
    });
  });

  it('throws CarrierError on token failures', async () => {
    const { transport } = scriptedTransport(status(401, { error: 'invalid_client', error_description: 'bad secret' }));
    const strategy = oauth2ClientCredentials({ tokenUrl: 'https://auth.test/token', clientId: 'id', clientSecret: 'sec', transport, carrier: 'ups' });
    const error = await strategy.apply(req()).catch(e => e);
    expect(error).toBeInstanceOf(CarrierError);
    expect(error).toMatchObject({ carrier: 'ups', code: 'invalid_client', category: 'authentication', retryable: false });

    const server = scriptedTransport(status(503));
    const err2 = await oauth2ClientCredentials({ tokenUrl: 'https://auth.test/token', clientId: 'id', clientSecret: 'sec', transport: server.transport }).apply(req()).catch(e => e);
    expect(err2).toMatchObject({ code: 'HTTP_503', category: 'server', retryable: true });
  });
});
