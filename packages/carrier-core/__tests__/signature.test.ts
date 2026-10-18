import { createHash, createHmac } from 'node:crypto';
import { bodyCredentials, composeAuth, hmacSha256, serializeBody, sha256, signature } from '../src';
import type { HttpRequest } from '../src';
import { fakeTime } from './helpers';

const post = (body: HttpRequest['body']): HttpRequest => ({ method: 'POST', url: 'https://api.test/gw', body });

describe('signature strategy', () => {
  it('signs the serialised body after other credentials were added (J&T-style md5 digest)', async () => {
    const md5 = (s: string) => createHash('md5').update(s).digest('base64');
    const strategy = composeAuth(
      bodyCredentials({ customerCode: 'C1' }),
      signature({
        sign: ({ body }) => md5(body + 'secret'),
        place: (request, digest) => ({ ...request, headers: { ...(request.headers ?? {}), digest } }),
      }),
    );
    const applied = await strategy.apply(post({ kind: 'json', value: { txlogisticId: 'T1' } }));
    const sent = JSON.stringify({ customerCode: 'C1', txlogisticId: 'T1' });
    expect(serializeBody(applied)).toBe(sent);
    expect(applied.headers!.digest).toBe(md5(sent + 'secret'));
  });

  it('passes a clock timestamp for timestamped signatures (form body)', async () => {
    const time = fakeTime(1_760_000_000_000);
    const strategy = signature({
      clock: time.clock,
      sign: ({ body, timestamp }) => createHash('md5').update(body + timestamp + 'key').digest('hex'),
      place: (request, msgDigest, { timestamp }) => ({
        ...request,
        body: { kind: 'form', value: { ...(request.body as { value: Record<string, string> }).value, timestamp: String(timestamp), msgDigest } },
      }),
    });
    const applied = await strategy.apply(post({ kind: 'form', value: { msgData: '{"a":1}' } }));
    const value = (applied.body as { value: Record<string, string> }).value;
    expect(value.timestamp).toBe('1760000000000');
    expect(value.msgDigest).toBe(createHash('md5').update('msgData=%7B%22a%22%3A1%7D1760000000000key').digest('hex'));
  });

  it('serialises every body kind like the fetch transport', () => {
    expect(serializeBody({ method: 'GET', url: 'u' })).toBe('');
    expect(serializeBody(post({ kind: 'text', value: '<x/>', contentType: 'text/xml' }))).toBe('<x/>');
    expect(serializeBody(post({ kind: 'binary', value: new TextEncoder().encode('abc'), contentType: 'application/octet-stream' }))).toBe('abc');
  });
});

describe('WebCrypto digests', () => {
  it('matches node:crypto for HMAC-SHA256 and SHA-256 in hex and base64', async () => {
    expect(await hmacSha256('key', 'message')).toBe(createHmac('sha256', 'key').update('message').digest('hex'));
    expect(await hmacSha256('key', 'message', 'base64')).toBe(createHmac('sha256', 'key').update('message').digest('base64'));
    expect(await sha256('привіт')).toBe(createHash('sha256').update('привіт').digest('hex'));
  });

  it('fails clearly without WebCrypto', async () => {
    const g = globalThis as { crypto?: unknown };
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
    Object.defineProperty(globalThis, 'crypto', { value: undefined, configurable: true });
    try {
      await expect(sha256('x')).rejects.toThrow('WebCrypto');
    } finally {
      if (descriptor) Object.defineProperty(globalThis, 'crypto', descriptor);
      else delete g.crypto;
    }
  });
});
