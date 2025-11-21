/**
 * Universal HTTP transport types for carrier API clients
 * Supports both simple POST-JSON APIs (like Nova Poshta) and RESTful APIs (like Meest)
 */

// HTTP methods supported by the transport
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

// Response format types
export type ResponseFormat = 'json' | 'text' | 'arraybuffer' | 'blob' | 'stream';

/**
 * Universal HTTP request interface
 * Works for both simple POST APIs and complex REST APIs
 */
export interface HttpRequest {
  /** HTTP method (default: POST) */
  method?: HttpMethod;

  /** Full URL or path (will be resolved against baseUrl if relative) */
  url: string;

  /** Request headers */
  headers?: Record<string, string>;

  /** Request body (will be JSON-stringified if object and Content-Type is application/json) */
  body?: unknown;

  /** Expected response format (default: json) */
  responseType?: ResponseFormat;

  /** AbortSignal for cancellation support */
  signal?: AbortSignal;

  /** Request timeout in milliseconds */
  timeoutMs?: number;

  /** Query parameters (will be appended to URL) */
  query?: Record<string, string | number | boolean | null | undefined>;
}

/**
 * Universal HTTP response interface
 */
export interface HttpResponse<T = unknown> {
  /** HTTP status code */
  status: number;

  /** HTTP status text (e.g., "OK", "Not Found") */
  statusText?: string;

  /** Response headers */
  headers?: Record<string, string>;

  /** Response data (parsed according to responseType) */
  data: T;
}

/**
 * Universal HTTP transport interface
 * All carrier clients will work with this interface
 */
export interface HttpTransport {
  /**
   * Execute an HTTP request
   * @param request - HTTP request configuration
   * @returns Promise with HTTP response
   */
  request<T = unknown>(request: HttpRequest): Promise<HttpResponse<T>>;
}

/**
 * Transport configuration options
 */
export interface TransportOptions {
  /** Base URL for all requests (optional) */
  baseUrl?: string;

  /** Default headers to include in all requests */
  defaultHeaders?: Record<string, string>;

  /** Default timeout in milliseconds */
  defaultTimeout?: number;

  /** Retry configuration */
  retry?: {
    /** Maximum number of retries */
    maxRetries: number;
    /** Delay between retries in milliseconds */
    retryDelay: number;
    /** HTTP status codes that should trigger a retry */
    retryableStatusCodes?: number[];
  };

  /** Request/response interceptors */
  interceptors?: {
    /** Intercept and modify requests before sending */
    request?: (request: HttpRequest) => HttpRequest | Promise<HttpRequest>;
    /** Intercept and modify responses before returning */
    response?: <T>(response: HttpResponse<T>) => HttpResponse<T> | Promise<HttpResponse<T>>;
    /** Handle errors */
    error?: (error: unknown) => unknown | Promise<unknown>;
  };
}

/**
 * Fetch-like function signature for custom fetch implementations
 */
export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
