// code and comments in English
import type { HttpRequest, HttpTransport } from '../http/types';
import { getHeader, setHeader } from '../http/types';
import { base64Encode } from '../utils/base64';
import type { Clock } from '../utils/time';
import { systemClock } from '../utils/time';
import {
  CarrierError,
  CarrierErrorCategory,
  categoryFromHttpStatus,
  isCarrierError,
  isFatalError,
  isTransportFailure,
} from '../errors';
import type { AuthStrategy, Secret } from './types';
import { resolveSecret } from './types';
import { abortReason, assertPositiveNumber } from '../utils/time';
import type { StoredToken, TokenStore } from './store';
import { InMemoryTokenStore } from './store';

/** What a login or refresh call yields. Give either `expiresAt` or `expiresInSec`. */
export interface TokenGrant {
  accessToken: string;
  refreshToken?: string;
  expiresInSec?: number;
  expiresAt?: number;
  refreshExpiresInSec?: number;
}

/** Passed to `login` and `refresh`: the signal aborts when `loginTimeoutMs` runs out. */
export interface TokenCallContext {
  signal: AbortSignal;
}

/** Code of the error raised when a login or refresh exceeds `loginTimeoutMs` (the request was never sent). */
export const TOKEN_TIMEOUT_CODE = 'ETOKEN_TIMEOUT';

export interface TokenAuthOptions {
  /** Carrier slug for errors raised by a failed login. Default `unknown`. */
  carrier?: string;
  /**
   * Full login (credentials → token). A thrown CarrierError or transport failure passes through;
   * anything else becomes a non-retryable `LOGIN_FAILED` authentication error.
   * Pass `context.signal` to the token request so a timed-out login does not keep running.
   */
  login: (context: TokenCallContext) => Promise<TokenGrant>;
  /**
   * Exchanges a refresh token for a new access token. When the carrier rejects it, `login` runs;
   * a transport failure or timeout is thrown instead, so a network blip does not cost a full login.
   */
  refresh?: (refreshToken: string, context: TokenCallContext) => Promise<TokenGrant>;
  /**
   * Upper bound for one `login` or `refresh` call. A call that takes longer is aborted through
   * `context.signal` and fails with a retryable `TimeoutError` (code `ETOKEN_TIMEOUT`), so a hung token
   * endpoint does not block every request of the account. The request itself was not sent yet, so
   * retry repeats even a POST. Default 30 s.
   */
  loginTimeoutMs?: number;
  /**
   * Cache key; include the account so two accounts never share a token. A function is called on
   * every lookup, so a key that follows the current account (multi-tenant) always picks its own token.
   * Default `default`, allowed only with the private default store: a shared `store` requires a key.
   */
  key?: string | (() => string | Promise<string>);
  store?: TokenStore;
  clock?: Clock;
  /** Renew this long before expiry, but at most half the token lifetime ahead. Default 60 s. */
  refreshSkewMs?: number;
  /** Lifetime assumed when the grant has no expiry. Default: no expiry (renew only on 401). */
  defaultTtlMs?: number;
  /** How the token is put on the request. Default `Authorization: Bearer <token>`. */
  header?: string;
  prefix?: string;
  /** Custom placement; overrides `header`/`prefix`. */
  applyToken?: (request: HttpRequest, accessToken: string) => HttpRequest;
}

/**
 * Caches and renews a token with single-flight semantics: concurrent calls share one login,
 * and a 401 invalidates the token it was sent with (not a newer one) and triggers one retry.
 */
export class TokenManager {
  private readonly store: TokenStore;
  private readonly clock: Clock;
  private readonly keySource: NonNullable<TokenAuthOptions['key']>;
  private readonly refreshSkewMs: number;
  /** One renewal in flight per cache key. */
  private readonly inflight = new Map<string, Promise<StoredToken>>();

  constructor(
    private readonly options: Pick<
      TokenAuthOptions,
      'carrier' | 'login' | 'refresh' | 'loginTimeoutMs' | 'key' | 'store' | 'clock' | 'refreshSkewMs' | 'defaultTtlMs'
    >,
  ) {
    if (options.store && options.key === undefined) {
      throw new TypeError('tokenAuth: pass `key` (unique per account) when using a shared TokenStore');
    }
    if (options.loginTimeoutMs !== undefined) assertPositiveNumber(options.loginTimeoutMs, 'tokenAuth.loginTimeoutMs');
    this.store = options.store ?? new InMemoryTokenStore();
    this.clock = options.clock ?? systemClock;
    this.keySource = options.key ?? 'default';
    this.refreshSkewMs = options.refreshSkewMs ?? 60_000;
  }

  /**
   * Returns a valid access token, logging in or refreshing when needed. An aborted `signal` stops
   * waiting for a renewal; the renewal itself goes on for other requests of the same account.
   */
  async getToken(signal?: AbortSignal): Promise<string> {
    if (signal?.aborted) throw abortReason(signal);
    const keyOrPromise = this.key();
    const key = typeof keyOrPromise === 'string' ? keyOrPromise : await keyOrPromise;
    const stored = await this.store.get(key);
    if (stored && this.isFresh(stored)) return stored.accessToken;
    return (await untilAborted(this.renew(key, stored), signal)).accessToken;
  }

  /**
   * Marks `accessToken` as rejected. The refresh token is kept, so the next `getToken`
   * tries refresh first and falls back to a full login.
   */
  async invalidate(accessToken?: string): Promise<void> {
    const key = await this.key();
    const stored = await this.store.get(key);
    if (!stored) return;
    if (accessToken !== undefined && stored.accessToken !== accessToken) return; // already renewed by someone else
    if (stored.refreshToken) await this.store.set(key, { ...stored, expiresAt: 0 });
    else await this.store.delete(key);
  }

  async clear(): Promise<void> {
    await this.store.delete(await this.key());
  }

  /** Synchronous for a static key, so the common path adds no extra await before the store lookup. */
  private key(): string | Promise<string> {
    if (typeof this.keySource === 'string') return this.keySource;
    // Resolved on every call: the key may depend on the current account and must not be cached.
    return Promise.resolve(this.keySource());
  }

  private isFresh(token: StoredToken): boolean {
    if (token.expiresAt === undefined) return true;
    // A token living shorter than the skew would otherwise be renewed on every request.
    const lifetime = token.issuedAt !== undefined ? token.expiresAt - token.issuedAt : Infinity;
    const skew = Math.min(this.refreshSkewMs, lifetime / 2);
    return token.expiresAt - skew > this.clock.now();
  }

  private renew(key: string, stored: StoredToken | undefined): Promise<StoredToken> {
    let pending = this.inflight.get(key);
    if (!pending) {
      pending = this.obtain(key, stored).finally(() => {
        this.inflight.delete(key);
      });
      this.inflight.set(key, pending);
    }
    return pending;
  }

  private async obtain(key: string, stored: StoredToken | undefined): Promise<StoredToken> {
    const now = this.clock.now();
    const canRefresh =
      this.options.refresh !== undefined &&
      stored?.refreshToken !== undefined &&
      (stored.refreshExpiresAt === undefined || stored.refreshExpiresAt > now);

    let grant: TokenGrant | undefined;
    if (canRefresh) {
      try {
        grant = await this.withDeadline(context => this.options.refresh!(stored.refreshToken!, context), 'refresh');
      } catch (error) {
        // The refresh never got an answer: let retry repeat it instead of spending a full login.
        if (isFatalError(error) || isTransportFailure(error) || isAbortLike(error)) throw error;
        if (isCarrierError(error) && error.category !== CarrierErrorCategory.Authentication && error.retryable)
          throw error;
        grant = undefined; // the refresh token was rejected: fall back to a full login
      }
    }
    grant ??= await this.login();

    const token = this.toStored(grant, stored);
    await this.store.set(key, token);
    return token;
  }

  /** A bug or an unexpected value from `login` must not look like a network failure and be retried. */
  private async login(): Promise<TokenGrant> {
    try {
      return await this.withDeadline(context => this.options.login(context), 'login');
    } catch (error) {
      if (isCarrierError(error) || isFatalError(error) || isTransportFailure(error)) throw error;
      if (isAbortLike(error)) throw error;
      throw new CarrierError({
        carrier: this.options.carrier ?? 'unknown',
        code: 'LOGIN_FAILED',
        message: error instanceof Error ? error.message : String(error),
        category: CarrierErrorCategory.Authentication,
        retryable: false,
        raw: error,
        cause: error,
      });
    }
  }

  /** Runs a login or refresh with a deadline; on timeout its signal aborts so it does not keep running. */
  private async withDeadline<T>(call: (context: TokenCallContext) => Promise<T>, what: string): Promise<T> {
    const ms = this.options.loginTimeoutMs ?? 30_000;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const deadline = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        const error = Object.assign(new Error(`Token ${what} timed out after ${ms} ms`), {
          name: 'TimeoutError',
          code: TOKEN_TIMEOUT_CODE,
        });
        controller.abort(error);
        reject(error);
      }, ms);
    });
    try {
      return await Promise.race([call({ signal: controller.signal }), deadline]);
    } finally {
      clearTimeout(timer);
    }
  }

  private toStored(grant: TokenGrant, previous: StoredToken | undefined): StoredToken {
    const now = this.clock.now();
    // A NaN or infinite expiry from `login` would make the token never fresh; treat it as absent.
    const expiresInSec = finiteOrUndefined(grant.expiresInSec);
    const refreshExpiresInSec = finiteOrUndefined(grant.refreshExpiresInSec);
    const expiresAt =
      finiteOrUndefined(grant.expiresAt) ??
      (expiresInSec !== undefined ? now + expiresInSec * 1000 : undefined) ??
      (this.options.defaultTtlMs !== undefined ? now + this.options.defaultTtlMs : undefined);
    const refreshToken = grant.refreshToken ?? previous?.refreshToken;
    return {
      accessToken: grant.accessToken,
      ...(expiresAt !== undefined ? { expiresAt, issuedAt: now } : {}),
      ...(refreshToken !== undefined ? { refreshToken } : {}),
      ...(refreshExpiresInSec !== undefined
        ? { refreshExpiresAt: now + refreshExpiresInSec * 1000 }
        : previous?.refreshExpiresAt !== undefined && grant.refreshToken === undefined
          ? { refreshExpiresAt: previous.refreshExpiresAt }
          : {}),
    };
  }
}

const TOKEN_META_KEY = 'authToken';

/** Token obtained by a login call and sent on every request (Meest `token` header, DPD, FAN Courier). */
export function tokenAuth(options: TokenAuthOptions): AuthStrategy & { readonly manager: TokenManager } {
  const manager = new TokenManager(options);
  const header = options.header ?? 'Authorization';
  const prefix = options.prefix ?? (header.toLowerCase() === 'authorization' ? 'Bearer ' : '');
  const applyToken =
    options.applyToken ??
    ((request: HttpRequest, token: string) => ({
      ...request,
      headers: setHeader(request.headers, header, prefix + token),
    }));

  return {
    manager,
    async apply(request) {
      const token = await manager.getToken(request.signal);
      const applied = applyToken(request, token);
      return { ...applied, meta: { ...(applied.meta ?? {}), [TOKEN_META_KEY]: token } };
    },
    async onUnauthorized(_response, request) {
      const used = request.meta?.[TOKEN_META_KEY];
      await manager.invalidate(typeof used === 'string' ? used : undefined);
      return true;
    },
  };
}

/** Alias matching the plan's naming (`loginToken`). */
export const loginToken = tokenAuth;

export interface OAuth2Options {
  tokenUrl: string;
  clientId: Secret;
  clientSecret: Secret;
  /** Transport for the token call (usually the same raw transport the client uses). */
  transport: HttpTransport;
  scope?: string;
  /** `basic` sends client credentials in the Authorization header (RFC 6749 default), `body` in the form. */
  clientAuth?: 'basic' | 'body';
  extraParams?: Record<string, string>;
  carrier?: string;
  /** Cache key. Default: token URL + client id (+ username for the password grant). */
  key?: string;
  store?: TokenStore;
  clock?: Clock;
  refreshSkewMs?: number;
  /**
   * Per-attempt timeout of the token request (`HttpRequest.timeoutMs`). Default 30 s.
   * The whole login is bounded by this plus one second.
   */
  tokenTimeoutMs?: number;
}

/** OAuth2 client-credentials grant (UPS, FedEx, USPS, GLS, Ninja Van, NZ Post, ...). */
export function oauth2ClientCredentials(options: OAuth2Options) {
  return oauth2(
    options,
    { grant_type: 'client_credentials' },
    async () => `${options.tokenUrl}|${await resolveSecret(options.clientId)}`,
  );
}

/** OAuth2 resource-owner password grant (DHL Paket, Hermes DE). */
export function oauth2Password(options: OAuth2Options & { username: Secret; password: Secret }) {
  return oauth2(
    options,
    async () => ({
      grant_type: 'password',
      username: await resolveSecret(options.username),
      password: await resolveSecret(options.password),
    }),
    async () => `${options.tokenUrl}|${await resolveSecret(options.clientId)}|${await resolveSecret(options.username)}`,
  );
}

function oauth2(
  options: OAuth2Options,
  grantParams: Record<string, string> | (() => Promise<Record<string, string>>),
  defaultKey: () => Promise<string>,
): AuthStrategy & { readonly manager: TokenManager } {
  const carrier = options.carrier ?? 'oauth2';
  if (options.tokenTimeoutMs !== undefined) assertPositiveNumber(options.tokenTimeoutMs, 'oauth2.tokenTimeoutMs');
  const tokenTimeoutMs = options.tokenTimeoutMs ?? 30_000;

  const requestToken = async (params: Record<string, string>, signal: AbortSignal): Promise<TokenGrant> => {
    const clientId = await resolveSecret(options.clientId);
    const clientSecret = await resolveSecret(options.clientSecret);
    const form: Record<string, string> = { ...params, ...(options.extraParams ?? {}) };
    if (options.scope) form.scope = options.scope;
    let headers: Record<string, string> = { Accept: 'application/json' };
    if ((options.clientAuth ?? 'basic') === 'basic') {
      headers = setHeader(headers, 'Authorization', `Basic ${base64Encode(`${clientId}:${clientSecret}`)}`);
    } else {
      form.client_id = clientId;
      form.client_secret = clientSecret;
    }

    const response = await options.transport<Record<string, unknown>>({
      method: 'POST',
      url: options.tokenUrl,
      headers,
      body: { kind: 'form', value: form },
      idempotent: true,
      timeoutMs: tokenTimeoutMs,
      signal,
    });
    const data = response.data ?? {};
    if (response.status >= 400 || typeof data.access_token !== 'string') {
      // Throttling and server errors are transient (retryable); anything else means bad credentials.
      const transient = response.status === 429 || response.status >= 500;
      throw new CarrierError({
        carrier,
        code: typeof data.error === 'string' ? data.error : `HTTP_${response.status}`,
        message: typeof data.error_description === 'string' ? data.error_description : 'OAuth2 token request failed',
        category: transient ? categoryFromHttpStatus(response.status) : CarrierErrorCategory.Authentication,
        httpStatus: response.status,
        raw: data,
      });
    }
    // A malformed expires_in would yield NaN and force a login on every request; treat it as absent.
    const expiresIn =
      typeof data.expires_in === 'number' || (typeof data.expires_in === 'string' && data.expires_in.trim() !== '')
        ? Number(data.expires_in)
        : NaN;
    return {
      accessToken: data.access_token,
      ...(typeof data.refresh_token === 'string' ? { refreshToken: data.refresh_token } : {}),
      ...(Number.isFinite(expiresIn) ? { expiresInSec: expiresIn } : {}),
    };
  };

  return tokenAuth({
    carrier,
    key: options.key ?? defaultKey,
    store: options.store,
    clock: options.clock,
    refreshSkewMs: options.refreshSkewMs,
    // The transport's own per-attempt timeout answers first; this only catches a transport that ignores it.
    loginTimeoutMs: tokenTimeoutMs + 1_000,
    login: async ({ signal }) =>
      requestToken(typeof grantParams === 'function' ? await grantParams() : grantParams, signal),
    refresh: (refreshToken, { signal }) =>
      requestToken({ grant_type: 'refresh_token', refresh_token: refreshToken }, signal),
  });
}

/** Reads the token a request was sent with (set by `tokenAuth`). Useful in logs and tests. */
export function tokenUsedBy(request: HttpRequest): string | undefined {
  const value = request.meta?.[TOKEN_META_KEY];
  return typeof value === 'string' ? value : getHeader(request.headers, 'authorization');
}

function finiteOrUndefined(value: number | undefined): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function isAbortLike(error: unknown): boolean {
  const name = (error as { name?: unknown } | null | undefined)?.name;
  return name === 'AbortError';
}

/** Waits for `promise` but gives up (without cancelling it) when `signal` aborts. */
function untilAborted<T>(promise: Promise<T>, signal: AbortSignal | undefined): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) {
    promise.catch(() => undefined); // nobody waits for it here any more; avoid an unhandled rejection
    return Promise.reject(abortReason(signal));
  }
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(abortReason(signal));
    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(
      value => {
        signal.removeEventListener('abort', onAbort);
        resolve(value);
      },
      (error: unknown) => {
        signal.removeEventListener('abort', onAbort);
        reject(error);
      },
    );
  });
}
