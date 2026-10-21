// code and comments in English
import type { HttpClient } from './httpClient';

/**
 * Default context handed to services. Carriers may extend it (extra base URLs,
 * credentials flags) and pass the extended type to `createClient`.
 */
export interface ClientContext<TConfig = unknown> {
  http: HttpClient;
  config: TConfig;
}

// Types to hoist only public methods (same shape as the Nova Poshta client).
type Fn = (...args: any[]) => any;
type PublicMethodNames<T> = { [K in keyof T]: T[K] extends Fn ? K : never }[keyof T];
type ReservedKeys = 'constructor' | 'attach';
export type ServiceAPI<T> = Omit<Pick<T, PublicMethodNames<T>>, ReservedKeys>;

export type PluggableService<Ctx> = { attach?: (ctx: Ctx) => void };
export type PluggableNamedService<NS extends string = string, Ctx = ClientContext> = PluggableService<Ctx> & {
  readonly namespace: NS;
};

export type Client<API, Ctx = ClientContext> = API & {
  use<S extends PluggableNamedService<string, Ctx>>(service: S): Client<API & { [K in S['namespace']]: S }, Ctx>;
};

/**
 * Plugin-style client: `createClient(ctx).use(new ShipmentsService()).use(new TrackingService())`.
 * Each service receives `ctx` in `attach` and is mounted under its `namespace`, so unused
 * services are tree-shaken away.
 */
export function createClient<Ctx = ClientContext, API extends object = object>(ctx: Ctx): Client<API, Ctx> {
  const self: Record<string, unknown> = {};

  self.use = function use(service: PluggableNamedService<string, Ctx>) {
    const ns = (service as { namespace?: unknown }).namespace;
    if (typeof ns !== 'string' || ns === '') {
      throw new Error('Service must define a string "namespace" property');
    }
    // Own keys only: `toString` or `constructor` from Object.prototype are free namespaces.
    if (Object.prototype.hasOwnProperty.call(self, ns)) {
      throw new Error(`Namespace already installed on client: ${ns}`);
    }
    if (typeof service.attach === 'function') {
      service.attach(ctx);
    }
    self[ns] = service;
    return self;
  };

  return self as Client<API, Ctx>;
}
