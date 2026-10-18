import { createFetchTransport } from '../src';

function fakeFetch(response: Response) {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const impl = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return response;
  }) as unknown as typeof fetch;
  return { impl, calls };
}

describe('createFetchTransport', () => {
  it('sends JSON with query and default headers, parses JSON and lower-cases headers', async () => {
    const { impl, calls } = fakeFetch(new Response(JSON.stringify({ ok: 1 }), { status: 201, headers: { 'X-Thing': 'v', 'Content-Type': 'application/json' } }));
    const transport = createFetchTransport({ fetchImpl: impl, baseHeaders: { 'User-Agent': 'ua' } });
    const res = await transport({ method: 'POST', url: 'https://x.test/a', query: { q: 1 }, body: { kind: 'json', value: { a: 1 } } });

    expect(res).toEqual({ status: 201, headers: { 'x-thing': 'v', 'content-type': 'application/json' }, data: { ok: 1 } });
    expect(calls[0]!.url).toBe('https://x.test/a?q=1');
    expect(calls[0]!.init.method).toBe('POST');
    expect(calls[0]!.init.body).toBe('{"a":1}');
    expect(calls[0]!.init.headers).toMatchObject({ 'User-Agent': 'ua', 'Content-Type': 'application/json', Accept: 'application/json' });
  });

  it('encodes form bodies and returns text for non-JSON payloads', async () => {
    const { impl, calls } = fakeFetch(new Response('<xml/>', { status: 200 }));
    const transport = createFetchTransport({ fetchImpl: impl });
    const res = await transport({ method: 'POST', url: 'https://x.test', body: { kind: 'form', value: { a: '1', b: 'x y' } } });
    expect(res.data).toBe('<xml/>');
    expect(calls[0]!.init.body).toBe('a=1&b=x+y');
    expect(calls[0]!.init.headers).toMatchObject({ 'Content-Type': 'application/x-www-form-urlencoded' });
  });

  it('returns binary payloads with their content type', async () => {
    const pdf = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
    const { impl, calls } = fakeFetch(new Response(pdf, { status: 200, headers: { 'content-type': 'application/pdf' } }));
    const res = await createFetchTransport({ fetchImpl: impl })({ method: 'GET', url: 'https://x.test/sticker', responseType: 'binary' });
    expect(res.data).toEqual({ contentType: 'application/pdf', data: pdf });
    expect(calls[0]!.init.headers).toMatchObject({ Accept: '*/*' });
  });

  it('decodes JSON error bodies even when binary was requested', async () => {
    const { impl } = fakeFetch(new Response('{"message":"nope"}', { status: 404, headers: { 'content-type': 'application/json' } }));
    const res = await createFetchTransport({ fetchImpl: impl })({ method: 'GET', url: 'https://x.test', responseType: 'binary' });
    expect(res).toMatchObject({ status: 404, data: { message: 'nope' } });
  });

  it('sends text and binary bodies with their content types, and returns undefined for empty bodies', async () => {
    const { impl, calls } = fakeFetch(new Response(null, { status: 204 }));
    const transport = createFetchTransport({ fetchImpl: impl });
    const res = await transport({ method: 'PUT', url: 'https://x.test', body: { kind: 'text', value: '<a/>', contentType: 'text/xml' } });
    expect(res.data).toBeUndefined();
    expect(calls[0]!.init.headers).toMatchObject({ 'Content-Type': 'text/xml' });

    const bytes = new Uint8Array([1]);
    await transport({ method: 'PUT', url: 'https://x.test', responseType: 'text', body: { kind: 'binary', value: bytes, contentType: 'application/octet-stream' } });
    expect(calls[1]!.init.body).toBe(bytes);
  });

  it('aborts with a TimeoutError after timeoutMs', async () => {
    const impl = ((_url: string, init: RequestInit) =>
      new Promise((_, reject) => init.signal!.addEventListener('abort', () => reject(init.signal!.reason)))) as unknown as typeof fetch;
    await expect(createFetchTransport({ fetchImpl: impl })({ method: 'GET', url: 'https://x.test', timeoutMs: 5 })).rejects.toMatchObject({
      name: 'TimeoutError',
    });
  });

  it('propagates a caller abort', async () => {
    const impl = ((_url: string, init: RequestInit) =>
      new Promise((_, reject) => init.signal!.addEventListener('abort', () => reject(init.signal!.reason)))) as unknown as typeof fetch;
    const controller = new AbortController();
    const pending = createFetchTransport({ fetchImpl: impl })({ method: 'GET', url: 'https://x.test', timeoutMs: 1000, signal: controller.signal });
    controller.abort(new Error('stop'));
    await expect(pending).rejects.toThrow('stop');
  });
});
