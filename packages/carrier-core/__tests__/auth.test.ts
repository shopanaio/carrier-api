import {
  apiKey,
  auth,
  basic,
  bearer,
  bodyCredentials,
  composeAuth,
  composeMiddleware,
  getHeader,
  noAuth,
  queryParam,
  when,
} from '../src';
import type { HttpRequest } from '../src';
import { ok, scriptedTransport, status } from './helpers';

const req = (extra: Partial<HttpRequest> = {}): HttpRequest => ({ method: 'GET', url: 'https://x.test', ...extra });

describe('static auth strategies', () => {
  it('noAuth leaves the request untouched', async () => {
    const r = req();
    expect(await noAuth().apply(r)).toBe(r);
  });

  it('apiKey puts the key in a header, query or JSON body', async () => {
    expect((await apiKey({ name: 'X-Key', value: 'k' }).apply(req())).headers).toEqual({ 'X-Key': 'k' });
    expect((await apiKey({ in: 'query', name: 'serviceKey', value: () => 'k' }).apply(req({ query: { a: 1 } }))).query).toEqual({
      a: 1,
      serviceKey: 'k',
    });
    const body = await apiKey({ in: 'body', name: 'apiKey', value: 'k' }).apply(req({ method: 'POST', body: { kind: 'json', value: { a: 1 } } }));
    expect(body.body).toEqual({ kind: 'json', value: { apiKey: 'k', a: 1 } });
  });

  it('bearer and queryParam build Ukrposhta-style credentials, replacing existing headers case-insensitively', async () => {
    const strategy = composeAuth(bearer(async () => 'ecom'), queryParam('token', 'cp'));
    const applied = await strategy.apply(req({ headers: { authorization: 'old' } }));
    expect(applied.headers).toEqual({ Authorization: 'Bearer ecom' });
    expect(applied.query).toEqual({ token: 'cp' });
  });

  it('basic encodes UTF-8 credentials', async () => {
    const applied = await basic({ username: 'user', password: 'пароль' }).apply(req());
    expect(getHeader(applied.headers, 'authorization')).toBe(`Basic ${Buffer.from('user:пароль').toString('base64')}`);
  });

  it('bodyCredentials merges into JSON, nested JSON and form bodies', async () => {
    const flat = await bodyCredentials({ userName: 'u', password: 'p' }).apply(req({ method: 'POST' }));
    expect(flat.body).toEqual({ kind: 'json', value: { userName: 'u', password: 'p' } });

    const nested = await bodyCredentials({ UserName: 'u' }, { path: 'ClientInfo' }).apply(req({ method: 'POST', body: { kind: 'json', value: { x: 1 } } }));
    expect(nested.body).toEqual({ kind: 'json', value: { ClientInfo: { UserName: 'u' }, x: 1 } });

    const form = await bodyCredentials({ key: 'k' }).apply(req({ method: 'POST', body: { kind: 'form', value: { a: '1' } } }));
    expect(form.body).toEqual({ kind: 'form', value: { key: 'k', a: '1' } });

    const nestedForm = await bodyCredentials({ key: 'k' }, { path: 'auth' }).apply(req({ method: 'POST', body: { kind: 'form', value: {} } }));
    expect(nestedForm.body).toEqual({ kind: 'form', value: { auth: '{"key":"k"}' } });

    await expect(bodyCredentials({ k: 'v' }).apply(req({ method: 'POST', body: { kind: 'text', value: 'x', contentType: 'text/plain' } }))).rejects.toThrow(
      'Cannot add body credentials',
    );
  });

  it('when applies a strategy only to matching requests', async () => {
    const strategy = when(r => r.meta?.counterpartyToken === true, queryParam('token', 'cp'));
    expect((await strategy.apply(req())).query).toBeUndefined();
    expect((await strategy.apply(req({ meta: { counterpartyToken: true } }))).query).toEqual({ token: 'cp' });
    expect(await strategy.onUnauthorized!(status(401), req())).toBe(false);
  });
});

describe('auth middleware', () => {
  it('repeats once with fresh credentials when the strategy can renew them', async () => {
    let token = 'a';
    const strategy = {
      apply: (r: HttpRequest) => ({ ...r, headers: { token } }),
      onUnauthorized: jest.fn(async () => {
        token = 'b';
        return true;
      }),
    };
    const { transport, calls } = scriptedTransport(status(401), ok());
    const res = await composeMiddleware(transport, [auth(strategy)])(req());
    expect(res.status).toBe(200);
    expect(calls.map(c => c.headers!.token)).toEqual(['a', 'b']);
  });

  it('returns the 401 when the strategy cannot renew or has no hook', async () => {
    const declined = scriptedTransport(status(401), ok());
    const res = await composeMiddleware(declined.transport, [auth({ apply: r => r, onUnauthorized: () => false })])(req());
    expect(res.status).toBe(401);
    expect(declined.calls).toHaveLength(1);

    const noHook = scriptedTransport(status(401));
    expect((await composeMiddleware(noHook.transport, [auth(noAuth())])(req())).status).toBe(401);
  });

  it('supports carriers that report auth errors in the body', async () => {
    const strategy = { apply: (r: HttpRequest) => r, onUnauthorized: jest.fn(() => true) };
    const { transport, calls } = scriptedTransport(ok({ error: 'expired' }), ok({}));
    await composeMiddleware(transport, [auth(strategy, { isUnauthorized: r => (r.data as { error?: string }).error === 'expired' })])(req());
    expect(calls).toHaveLength(2);
  });

  it('composeAuth asks every strategy to renew', async () => {
    const a = { apply: (r: HttpRequest) => r, onUnauthorized: jest.fn(() => false) };
    const b = { apply: (r: HttpRequest) => r, onUnauthorized: jest.fn(() => true) };
    expect(await composeAuth(a, b, noAuth()).onUnauthorized!(status(401), req())).toBe(true);
    expect(a.onUnauthorized).toHaveBeenCalled();
  });
});
