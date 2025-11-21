// code and comments in English
import { TokenManager } from '../core/tokenManager';
import type { HttpMethod, HttpRequest } from '../http/transport';
import type { ResponseFormat } from '../types/base';
import { serializeQueryParams, trimTrailingSlash, ensureLeadingSlash } from './serializers';

export interface RequestBuilderInit {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  tokenManager: TokenManager;
}

export interface ServiceRequestConfig {
  method: HttpMethod;
  path: string;
  query?: Record<string, unknown>;
  body?: unknown;
  headers?: Record<string, string>;
  responseType?: ResponseFormat;
  skipAuth?: boolean;
  signal?: AbortSignal;
}

export class RequestBuilder {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;

  constructor(private readonly init: RequestBuilderInit) {
    this.baseUrl = trimTrailingSlash(init.baseUrl || 'https://api.meest.com/v3.0/openAPI');
    this.defaultHeaders = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.defaultHeaders ?? {}),
    };
  }

  build(config: ServiceRequestConfig): HttpRequest {
    const path = ensureLeadingSlash(config.path);
    const query = config.query ? serializeQueryParams(config.query) : '';
    const url = `${this.baseUrl}${path}${query}`;
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...(config.headers ?? {}),
    };

    if (!config.skipAuth) {
      const token = this.init.tokenManager.getToken();
      if (token) {
        headers.token = token;
      }
    }

    return {
      method: config.method,
      url,
      headers,
      body: config.body,
      responseType: config.responseType,
      signal: config.signal,
    };
  }
}
