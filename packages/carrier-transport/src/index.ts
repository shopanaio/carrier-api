/**
 * @shopana/carrier-transport
 * Universal HTTP transport abstraction for carrier API clients
 */

export * from './types';
export * from './utils';
export * from './fetchTransport';
export * from './mockTransport';
export * from './adapters';

// Re-export commonly used types for convenience
export type {
  HttpTransport,
  HttpRequest,
  HttpResponse,
  HttpMethod,
  ResponseFormat,
  TransportOptions,
  FetchLike,
} from './types';

export { createFetchTransport } from './fetchTransport';
export {
  createNovaPoshtaTransport,
  createNovaPoshtaTransportWithBase,
  type NovaPoshtaTransport,
} from './adapters/novaposhta';
export {
  createMeestTransport,
  createMeestTransportWithConfig,
} from './adapters/meest';
