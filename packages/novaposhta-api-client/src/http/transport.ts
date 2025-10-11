/**
 * HTTP transport layer for Nova Poshta API (thin REST client)
 */

import type { NovaPoshtaRequest, NovaPoshtaResponse } from '../types/base';

// HTTP transport interface for dependency injection
export interface HttpTransport {
  request<T = unknown>(request: NovaPoshtaRequest): Promise<NovaPoshtaResponse<T>>;
}

// Transport configuration
export interface TransportConfig {
  /** Base URL for Nova Poshta API */
  readonly baseUrl: string;
  /** Request timeout in milliseconds */
  readonly timeout: number;
  /** Custom headers */
  readonly headers: Record<string, string>;
}

// Default transport configuration
export const DEFAULT_TRANSPORT_CONFIG: TransportConfig = {
  baseUrl: 'https://api.novaposhta.ua/v2.0/json/',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Fetch-based HTTP transport implementation (no retries/limits/circuit-breaker)
export class FetchHttpTransport implements HttpTransport {
  constructor(
    private readonly apiKey: string,
    private readonly config: TransportConfig = DEFAULT_TRANSPORT_CONFIG,
  ) {}

  async request<T = unknown>(request: NovaPoshtaRequest): Promise<NovaPoshtaResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const finalRequest: NovaPoshtaRequest = {
        ...request,
        apiKey: request.apiKey && request.apiKey.length > 0 ? request.apiKey : this.apiKey,
      };

      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: this.config.headers,
        body: JSON.stringify(finalRequest),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json() as NovaPoshtaResponse<T>;
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}
