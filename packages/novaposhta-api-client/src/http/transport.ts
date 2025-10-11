/**
 * HTTP transport layer for Nova Poshta API (thin REST client)
 */

import type { NovaPoshtaRequest, NovaPoshtaResponse } from '../types/base';

// HTTP transport interface for dependency injection (interface only)
export interface HttpTransport {
  request<T = unknown>(request: NovaPoshtaRequest): Promise<NovaPoshtaResponse<T>>;
}
