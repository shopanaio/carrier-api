// code and comments in English
import type { NovaPoshtaRequest, NovaPoshtaResponse } from '../types/base';
import type { HttpTransport } from '../http/transport';

// Narrow HTTP POST JSON transport used by plugins
export type HttpPostJsonTransport = <TReq, TRes>(args: {
  url: string;
  body: TReq;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}) => Promise<{ status: number; data: TRes }>;

export interface ClientContext {
  transport: HttpPostJsonTransport;
  baseUrl: string;
  apiKey?: string;
}

export type ServicePlugin<TService> = (ctx: ClientContext) => TService;

export function createClient(ctx: ClientContext) {
  return {
    use<TService>(plugin: ServicePlugin<TService>): TService {
      return plugin(ctx);
    },
  };
}

// Adapter from function-style transport to client-internal interface-style transport
export function toHttpTransport(ctx: ClientContext): HttpTransport {
  return {
    async request<T = unknown>(request: NovaPoshtaRequest): Promise<NovaPoshtaResponse<T>> {
      const finalRequest: NovaPoshtaRequest = {
        ...request,
        apiKey: request.apiKey || ctx.apiKey || '',
      };

      const response = await ctx.transport<NovaPoshtaRequest, NovaPoshtaResponse<T>>({
        url: ctx.baseUrl,
        body: finalRequest,
      });

      return response.data;
    },
  };
}
