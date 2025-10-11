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

// Mock transport for testing
export class MockHttpTransport implements HttpTransport {
  private responses: Map<string, NovaPoshtaResponse<unknown>> = new Map();
  private delays: Map<string, number> = new Map();
  private errors: Map<string, Error> = new Map();

  async request<T = unknown>(request: NovaPoshtaRequest): Promise<NovaPoshtaResponse<T>> {
    const key = `${request.modelName}.${request.calledMethod}`;

    // Simulate delay
    const delay = this.delays.get(key) || 0;
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Simulate error
    const error = this.errors.get(key);
    if (error) {
      throw error;
    }

    // Return mocked response
    const response = this.responses.get(key);
    if (response) {
      return response as NovaPoshtaResponse<T>;
    }

    // Default success response
    return {
      success: true,
      data: [] as unknown as T,
      errors: [],
      warnings: [],
      info: [],
      messageCodes: [],
      errorCodes: [],
      warningCodes: [],
      infoCodes: [],
    };
  }

  // Mock configuration methods
  mockResponse<T>(modelName: string, method: string, response: NovaPoshtaResponse<T>): void {
    this.responses.set(`${modelName}.${method}`, response);
  }

  mockDelay(modelName: string, method: string, delay: number): void {
    this.delays.set(`${modelName}.${method}`, delay);
  }

  mockError(modelName: string, method: string, error: Error): void {
    this.errors.set(`${modelName}.${method}`, error);
  }

  clearMocks(): void {
    this.responses.clear();
    this.delays.clear();
    this.errors.clear();
  }
}
