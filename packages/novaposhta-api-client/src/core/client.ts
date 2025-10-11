// code and comments in English
import type { NovaPoshtaRequest, NovaPoshtaResponse } from '../types/base';
import type { HttpTransport } from '../http/transport';

// Narrow HTTP POST JSON transport used by services internally
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

// Adapter from function-style transport to interface-style transport for services
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

// Types to hoist only public methods
type Fn = (...args: any[]) => any;
type PublicMethodNames<T> = { [K in keyof T]: T[K] extends Fn ? K : never }[keyof T];
type ReservedKeys = 'constructor' | 'attach';
export type ServiceAPI<T> = Omit<Pick<T, PublicMethodNames<T>>, ReservedKeys>;

export type PluggableService = { attach?: (ctx: ClientContext) => void };

export type Client<API> = API & {
  use<S extends PluggableService>(service: S): Client<API & ServiceAPI<S>>;
};

export function createClient<API extends {} = {}>(ctx: ClientContext): Client<API> {
  const self: any = {} as Client<API>;

  self.use = function use<S extends PluggableService>(service: S): Client<API & ServiceAPI<S>> {
    // Inject context into service if supported
    if (typeof service.attach === 'function') {
      service.attach(ctx);
    }

    // Hoist instance methods from service prototype
    const proto = Object.getPrototypeOf(service);
    for (const key of Object.getOwnPropertyNames(proto)) {
      if (key === 'constructor' || key === 'attach') continue;
      const fn = (service as any)[key];
      if (typeof fn === 'function') {
        if (key in self) {
          throw new Error(`Method conflict on client: ${key}`);
        }
        self[key] = fn.bind(service);
      }
    }

    return self as Client<API & ServiceAPI<S>>;
  };

  return self as Client<API>;
}
