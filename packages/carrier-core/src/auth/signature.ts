// code and comments in English
import type { HttpRequest } from '../http/types';
import { base64Encode } from '../utils/base64';
import type { Clock } from '../utils/time';
import { systemClock } from '../utils/time';
import type { AuthStrategy } from './types';

export interface SignatureContext {
  request: HttpRequest;
  /** Request body serialised exactly as it will be sent (JSON string, form string, text), or '' when absent. */
  body: string;
  /**
   * The wire bytes of the body: the raw bytes for a binary body (where `body` is only a lossy
   * UTF-8 decoding), the UTF-8 encoding of `body` otherwise. Sign these for binary payloads.
   */
  bodyBytes: Uint8Array;
  /** Epoch milliseconds from the injected clock, for timestamped signatures. */
  timestamp: number;
}

export interface SignatureOptions {
  /**
   * Computes the signature, e.g. `md5(body + key)` for J&T / Cainiao or HMAC-SHA256 for SF International.
   * Hashing is injected so the core stays dependency-free (`node:crypto` or `hmacSha256` below).
   */
  sign: (ctx: SignatureContext) => string | Promise<string>;
  /** Puts the signature (and any timestamp) on the request. */
  place: (request: HttpRequest, signature: string, ctx: SignatureContext) => HttpRequest;
  clock?: Clock;
}

/**
 * Signed requests (Cainiao `data_digest`, SF Express `msgDigest`, J&T `digest`, Mondial Relay `Security`).
 * Apply it last in `composeAuth` so the signature covers every other credential added to the body.
 */
export function signature(options: SignatureOptions): AuthStrategy {
  const clock = options.clock ?? systemClock;
  return {
    async apply(request) {
      const body = serializeBody(request);
      const bodyBytes = request.body?.kind === 'binary' ? request.body.value : new TextEncoder().encode(body);
      const ctx: SignatureContext = { request, body, bodyBytes, timestamp: clock.now() };
      return options.place(request, await options.sign(ctx), ctx);
    },
  };
}

/** The body string the fetch transport would send, so signatures match the wire bytes. */
export function serializeBody(request: HttpRequest): string {
  const body = request.body;
  if (!body) return '';
  switch (body.kind) {
    case 'json':
      return JSON.stringify(body.value);
    case 'form':
      return new URLSearchParams(body.value).toString();
    case 'text':
      return body.value;
    case 'binary':
      return new TextDecoder().decode(body.value);
  }
}

export type DigestEncoding = 'hex' | 'base64';

/** HMAC-SHA256 via WebCrypto (Node 18+, browsers, edge). */
export async function hmacSha256(key: string, message: string, encoding: DigestEncoding = 'hex'): Promise<string> {
  const subtle = getSubtle();
  const encoder = new TextEncoder();
  const cryptoKey = await subtle.importKey('raw', encoder.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ]);
  return encode(new Uint8Array(await subtle.sign('HMAC', cryptoKey, encoder.encode(message))), encoding);
}

/** SHA-256 digest via WebCrypto. MD5 is not available in WebCrypto; inject `node:crypto` for MD5 carriers. */
export async function sha256(message: string, encoding: DigestEncoding = 'hex'): Promise<string> {
  const digest = await getSubtle().digest('SHA-256', new TextEncoder().encode(message));
  return encode(new Uint8Array(digest), encoding);
}

function getSubtle(): SubtleCrypto {
  const subtle = (globalThis as { crypto?: Crypto }).crypto?.subtle;
  if (!subtle) throw new TypeError('WebCrypto (globalThis.crypto.subtle) is not available in this runtime');
  return subtle;
}

function encode(bytes: Uint8Array, encoding: DigestEncoding): string {
  if (encoding === 'base64') return base64Encode(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}
