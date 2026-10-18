// code and comments in English
import type { AuthResult } from '../types/generated';
import { ContractService } from './base';
import type { MeestTokens, RequestOptions } from './base';

/** Explicit access to the token endpoints. The client logs in and refreshes on its own; use this to test credentials. */
export class AuthService extends ContractService {
  readonly namespace = 'auth' as const;

  /** `POST /auth` with the configured login and password. */
  login(options?: RequestOptions): Promise<MeestTokens> {
    return this.ctx.config.auth.login(options?.signal);
  }

  /** `POST /refreshToken`. */
  refresh(refreshToken: string, options?: RequestOptions): Promise<MeestTokens> {
    return this.ctx.config.auth.refresh(refreshToken, options?.signal);
  }
}

/** Normalizes the two spellings of the refresh token field (`refresh_token` in Swagger examples). */
export function toTokens(result: AuthResult & { refreshToken?: string }): MeestTokens {
  const token = result.token;
  const refreshToken = result.refresh_token ?? result.refreshToken;
  if (!token || !refreshToken) throw new TypeError('Meest auth response has no token');
  return { token, refreshToken, expiresIn: result.expiresIn ?? 86_400 };
}
