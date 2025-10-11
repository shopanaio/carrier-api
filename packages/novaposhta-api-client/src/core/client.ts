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
      const { apiKey, ...rest } = request as NovaPoshtaRequest & { apiKey?: string };
      const finalRequest: NovaPoshtaRequest = {
        ...(rest as NovaPoshtaRequest),
        ...(apiKey ? { apiKey } : {}),
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
export type PluggableNamedService<NS extends string = string> = PluggableService & { readonly namespace: NS };

export type Client<API> = API & {
  use<S extends PluggableNamedService<string>>(service: S): Client<API & { [K in S['namespace']]: ServiceAPI<S> }>;
};

export function createClient<API extends {} = {}>(ctx: ClientContext): Client<API> {
  const self: any = {} as Client<API>;

  self.use = function use<S extends PluggableNamedService<string>>(service: S): Client<API & { [K in S['namespace']]: ServiceAPI<S> }> {
    // Inject context into service if supported
    if (typeof service.attach === 'function') {
      service.attach(ctx);
    }

    const ns: string | undefined = (service as any).namespace;
    if (!ns || typeof ns !== 'string') {
      throw new Error('Service must define a string "namespace" property');
    }

    if (!(ns in self)) {
      (self as any)[ns] = {};
    }
    const target = (self as any)[ns];

    // Hoist instance methods from service prototype
    const proto = Object.getPrototypeOf(service);
    for (const key of Object.getOwnPropertyNames(proto)) {
      if (key === 'constructor' || key === 'attach') continue;
      const fn = (service as any)[key];
      if (typeof fn === 'function') {
        if (key in target) {
          throw new Error(`Method conflict on client namespace "${ns}": ${key}`);
        }
        target[key] = fn.bind(service);
      }
    }

    return self as Client<API & { [K in S['namespace']]: ServiceAPI<S> }>;
  };

  return self as Client<API>;
}
