// code and comments in English
import type { BinaryData, ClientContext, QueryParams, ResponseType } from '@shopana/carrier-core';
import type { DeleteRequestOptions, RequestOptions } from '../../shared';
import type { AuthResponse, RefreshTokenResponse } from '../types/generated';

/** Login and refresh calls, made without the token strategy so a 401 there never recurses into login. */
export interface MeestAuthApi {
  login(signal?: AbortSignal): Promise<AuthResponse>;
  refresh(refreshToken: string, signal?: AbortSignal): Promise<RefreshTokenResponse>;
}

export interface MeestContractContextConfig {
  auth: MeestAuthApi;
}

export type ContractContext = ClientContext<MeestContractContextConfig>;

export type { BinaryData, DeleteRequestOptions, RequestOptions };

interface CallOptions extends RequestOptions {
  path: string;
  pathParams?: Record<string, string | number>;
  query?: QueryParams;
  json?: unknown;
  /** Safe to repeat: reads that Meest models as POST (search, calculate). */
  idempotent?: boolean;
  responseType?: ResponseType;
}

export abstract class ContractService {
  protected ctx!: ContractContext;

  attach(ctx: ContractContext): void {
    this.ctx = ctx;
  }

  protected httpGet<T>(options: CallOptions): Promise<T> {
    return this.ctx.http.request<T>({ method: 'GET', ...options });
  }

  protected httpPost<T>(options: CallOptions): Promise<T> {
    return this.ctx.http.request<T>({ method: 'POST', ...options });
  }

  protected httpPut<T>(options: CallOptions): Promise<T> {
    return this.ctx.http.request<T>({ method: 'PUT', ...options });
  }

  protected httpDelete<T>(options: CallOptions): Promise<T> {
    return this.ctx.http.request<T>({ method: 'DELETE', ...options });
  }
}

/**
 * Several ids go to Meest as one path segment separated by literal commas. Each id is encoded on its own, so the
 * separators stay `,` on the wire (a pathParam would turn them into `%2C`).
 */
export function encodeIds(ids: string | readonly string[]): string {
  const list = typeof ids === 'string' ? [ids] : ids;
  return list.map(encodeURIComponent).join(',');
}
