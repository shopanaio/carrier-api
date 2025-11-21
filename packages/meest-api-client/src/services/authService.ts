import { BaseService } from './baseService';
import type { LoginRequest, LoginTokens, RefreshTokenRequest, RefreshTokens } from '../types/auth';

export class AuthService extends BaseService {
  readonly namespace = 'auth' as const;

  async login(credentials: LoginRequest): Promise<LoginTokens> {
    const result = await this.send<LoginTokens>({
      method: 'POST',
      path: '/auth',
      body: credentials,
      skipAuth: true,
    });

    if (result?.token) {
      this.tokenManager.setToken(result.token);
    }

    return result;
  }

  async refresh(payload: RefreshTokenRequest): Promise<RefreshTokens> {
    const result = await this.send<RefreshTokens>({
      method: 'POST',
      path: '/refreshToken',
      body: payload,
      skipAuth: true,
    });

    if (result?.token) {
      this.tokenManager.setToken(result.token);
    }

    return result;
  }

  logout() {
    this.tokenManager.clearToken();
  }
}
