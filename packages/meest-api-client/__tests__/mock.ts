import type { HttpRequest, HttpResponse, HttpTransport } from '@shopana/carrier-core';

export interface Call {
  method: string;
  /** Path after the base URL, still URL-encoded. */
  path: string;
  query: Record<string, unknown>;
  headers: Record<string, string>;
  body: unknown;
  responseType?: string;
  signal?: AbortSignal;
}

export type Reply = Partial<HttpResponse<unknown>> & { data?: unknown };
export type Handler = (call: Call, index: number) => Reply | Promise<Reply>;

/** Function-based HttpTransport that records requests; the handler decides the answer. */
export function mockTransport(baseUrl: string, handler: Handler) {
  const calls: Call[] = [];
  const transport: HttpTransport = async <T>(request: HttpRequest) => {
    const call: Call = {
      method: request.method,
      path: request.url.slice(baseUrl.length),
      query: { ...(request.query ?? {}) },
      headers: Object.fromEntries(Object.entries(request.headers ?? {}).map(([k, v]) => [k.toLowerCase(), v])),
      body: request.body && 'value' in request.body ? request.body.value : undefined,
      ...(request.responseType ? { responseType: request.responseType } : {}),
      ...(request.signal ? { signal: request.signal } : {}),
    };
    calls.push(call);
    const reply = await handler(call, calls.length - 1);
    return { status: 200, headers: {}, data: null, ...reply } as HttpResponse<T>;
  };
  return {
    transport,
    calls,
    callsTo: (method: string, path: string) => calls.filter(c => c.method === method && c.path === path),
  };
}

export const noWait = async () => {};

/** Manual clock for token TTLs and rate limits; `sleep` advances it instead of waiting. */
export class FakeClock {
  constructor(private current = Date.UTC(2026, 0, 1, 9, 0, 0)) {}
  now() {
    return this.current;
  }
  advance(ms: number) {
    this.current += ms;
  }
  readonly sleep = async (ms: number) => {
    this.current += Math.max(0, ms);
  };
}
