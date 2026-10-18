// code and comments in English
import type { AuthResponse, RefreshTokenResponse } from '../types/generated';
import { ContractService } from './base';
import type { RequestOptions } from './base';

/** The token endpoints. The client logs in and refreshes on its own; these return Meest's answers unchanged. */
export class AuthService extends ContractService {
  readonly namespace = 'auth' as const;

  /** `POST /auth` with the configured login and password. */
  login(options?: RequestOptions): Promise<AuthResponse> {
    return this.ctx.config.auth.login(options?.signal);
  }

  /** `POST /refreshToken`. */
  refresh(refreshToken: string, options?: RequestOptions): Promise<RefreshTokenResponse> {
    return this.ctx.config.auth.refresh(refreshToken, options?.signal);
  }
}
