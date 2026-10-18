// code and comments in English

export interface StoredToken {
  accessToken: string;
  refreshToken?: string;
  /** Epoch milliseconds; absent means "valid until the carrier says otherwise". */
  expiresAt?: number;
  /** Refresh token expiry, epoch milliseconds. */
  refreshExpiresAt?: number;
  /** When the token was obtained, epoch milliseconds; bounds the renew-ahead window to its lifetime. */
  issuedAt?: number;
}

/**
 * Where tokens live between calls. The default is per-process memory; serverless consumers
 * plug in Redis/KV so cold starts don't log in again.
 */
export interface TokenStore {
  get(key: string): StoredToken | undefined | Promise<StoredToken | undefined>;
  set(key: string, token: StoredToken): void | Promise<void>;
  delete(key: string): void | Promise<void>;
}

export class InMemoryTokenStore implements TokenStore {
  private readonly tokens = new Map<string, StoredToken>();

  get(key: string): StoredToken | undefined {
    return this.tokens.get(key);
  }

  set(key: string, token: StoredToken): void {
    this.tokens.set(key, token);
  }

  delete(key: string): void {
    this.tokens.delete(key);
  }
}
