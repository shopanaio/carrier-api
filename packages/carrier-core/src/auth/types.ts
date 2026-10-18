// code and comments in English
import type { HttpRequest, HttpResponse } from '../http/types';

/** A value given directly or resolved lazily (from a secret manager, env, etc.). */
export type Secret = string | (() => string | Promise<string>);

export async function resolveSecret(secret: Secret): Promise<string> {
  return typeof secret === 'function' ? secret() : secret;
}

export interface AuthStrategy {
  /** Adds credentials to an outgoing request. Must not mutate the input. */
  apply(request: HttpRequest): HttpRequest | Promise<HttpRequest>;
  /**
   * Called when the carrier answered "unauthorized" to a request this strategy prepared.
   * Return true when fresh credentials are available and the request should be repeated once.
   */
  onUnauthorized?(response: HttpResponse<unknown>, request: HttpRequest): boolean | Promise<boolean>;
}
