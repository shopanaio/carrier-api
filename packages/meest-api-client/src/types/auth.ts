import type {
  AuthRequestBody,
  AuthResponse,
  AuthResult,
  RefreshTokenRequestBody,
  RefreshTokenResponse,
  RefreshTokenResult,
} from './generated';

export type LoginRequest = AuthRequestBody;
export type LoginResponse = AuthResponse;
export type LoginTokens = AuthResult;

export type RefreshTokenRequest = RefreshTokenRequestBody;
export type RefreshResponse = RefreshTokenResponse;
export type RefreshTokens = RefreshTokenResult;

export interface TokenPayload {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}
