import type { HttpRequest, HttpResponse, HttpTransport } from '@shopana/carrier-core';

export interface MockAnswer {
  status?: number;
  data?: unknown;
  headers?: Record<string, string>;
}

export interface MockCall {
  method: string;
  /** Path without the host, e.g. `/ecom/0.0.1/shipments/abc`. */
  path: string;
  query: Record<string, unknown>;
  headers: Record<string, string>;
  /** The JSON body, when there is one. */
  body: unknown;
  request: HttpRequest;
}

export type MockHandler = (call: MockCall, params: Record<string, string>) => MockAnswer | Promise<MockAnswer>;

export interface MockRoute {
  method: string;
  /** Path template relative to the host: `{name}` matches one segment. A trailing `*` matches anything after. */
  path: string;
  respond: MockHandler | MockAnswer;
}

/**
 * A plain HTTP mock: routes answer by method and path, every request is recorded in `calls`.
 * It holds no state of its own; a test that needs state keeps it in the handlers.
 */
export function createMockTransport(routes: MockRoute[] = []) {
  const calls: MockCall[] = [];
  const table = [...routes];

  const transport: HttpTransport = (async (request: HttpRequest): Promise<HttpResponse> => {
    const url = new URL(request.url);
    const call: MockCall = {
      method: request.method,
      path: decodeURIComponent(url.pathname),
      query: request.query ?? {},
      headers: Object.fromEntries(Object.entries(request.headers ?? {}).map(([k, v]) => [k.toLowerCase(), v])),
      body: request.body && 'value' in request.body ? request.body.value : undefined,
      request,
    };
    calls.push(call);
    for (const route of table) {
      if (route.method !== request.method) continue;
      const params = match(route.path, call.path);
      if (!params) continue;
      const answer = typeof route.respond === 'function' ? await route.respond(call, params) : route.respond;
      return { status: answer.status ?? 200, headers: answer.headers ?? {}, data: answer.data ?? {} };
    }
    throw new Error(`No mock route for ${request.method} ${call.path}`);
  }) as HttpTransport;

  return {
    transport,
    calls,
    /** Adds a route that wins over the earlier ones. */
    on(route: MockRoute) {
      table.unshift(route);
    },
    callsTo(method: string, path: string) {
      return calls.filter(call => call.method === method && match(path, call.path) !== undefined);
    },
    last: () => calls[calls.length - 1]!,
  };
}

function match(template: string, path: string): Record<string, string> | undefined {
  const names: string[] = [];
  const pattern = template
    .split(/(\{[^}]+\}|\*)/)
    .map(part => {
      if (part === '*') return '.*';
      const m = /^\{([^}]+)\}$/.exec(part);
      if (m) {
        names.push(m[1]!);
        return '([^/]+)';
      }
      return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('');
  const result = new RegExp(`^${pattern}$`).exec(path);
  if (!result) return undefined;
  return Object.fromEntries(names.map((name, i) => [name, result[i + 1]!]));
}

export const ok = (data: unknown): MockAnswer => ({ data });
export const fail = (status: number, code: string, message: string): MockAnswer => ({
  status,
  data: { code, message },
});
