// code and comments in English
import type { HttpTransport } from '../http/transport';
import { RequestBuilder } from '../utils/requestBuilder';
import { TokenManager, type TokenChangeHandler } from './tokenManager';

export const DEFAULT_BASE_URL = 'https://api.meest.com/v3.0/openAPI';

export interface ClientContext {
  transport: HttpTransport;
  requestBuilder: RequestBuilder;
  tokenManager: TokenManager;
}

export interface CreateClientOptions {
  transport: HttpTransport;
  baseUrl?: string;
  token?: string;
  defaultHeaders?: Record<string, string>;
  onTokenChange?: TokenChangeHandler;
}

// Types to hoist only public methods
export type PluggableService = { attach?: (ctx: ClientContext) => void };
export type PluggableNamedService<NS extends string = string> = PluggableService & { readonly namespace: NS };

export type Client<API> = API & {
  use<S extends PluggableNamedService<string>>(service: S): Client<API & { [K in S['namespace']]: S }>;
};

export function createClient<API = {}>(options: CreateClientOptions): Client<API> {
  if (!options.transport) {
    throw new Error('Meest client requires a transport implementation');
  }

  const tokenManager = new TokenManager(options.token, options.onTokenChange);
  const requestBuilder = new RequestBuilder({
    baseUrl: options.baseUrl ?? DEFAULT_BASE_URL,
    defaultHeaders: options.defaultHeaders,
    tokenManager,
  });

  const ctx: ClientContext = {
    transport: options.transport,
    requestBuilder,
    tokenManager,
  };

  const self: any = {};

  self.use = function use<S extends PluggableNamedService<string>>(service: S) {
    if (typeof service.attach === 'function') {
      service.attach(ctx);
    }
    const ns: string | undefined = (service as any).namespace;
    if (!ns) {
      throw new Error('Service must provide a namespace');
    }
    if (self[ns]) {
      throw new Error(`Namespace already installed on client: ${ns}`);
    }
    self[ns] = service;
    return self as Client<API & { [K in S['namespace']]: S }>;
  };

  return self as Client<API>;
}
