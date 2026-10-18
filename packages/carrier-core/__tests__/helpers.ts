import type { HttpRequest, HttpResponse, HttpTransport } from '../src';

export function fakeTime(start = 1_700_000_000_000) {
  let now = start;
  const sleeps: number[] = [];
  return {
    clock: { now: () => now },
    sleeps,
    advance(ms: number) {
      now += ms;
    },
    sleep: async (ms: number) => {
      sleeps.push(ms);
      now += ms;
    },
  };
}

export type Responder = (request: HttpRequest, index: number) => HttpResponse<unknown> | Promise<HttpResponse<unknown>>;

/** Transport that records requests and answers with scripted responses. */
export function scriptedTransport(...responders: Array<Responder | HttpResponse<unknown> | Error>) {
  const calls: HttpRequest[] = [];
  const transport: HttpTransport = (async (request: HttpRequest) => {
    const index = calls.length;
    calls.push(request);
    const step = responders[Math.min(index, responders.length - 1)];
    if (step instanceof Error) throw step;
    return typeof step === 'function' ? step(request, index) : step;
  }) as HttpTransport;
  return { transport, calls };
}

export const ok = (data: unknown = {}, headers: Record<string, string> = {}): HttpResponse<unknown> => ({ status: 200, headers, data });
export const status = (code: number, data: unknown = {}, headers: Record<string, string> = {}): HttpResponse<unknown> => ({
  status: code,
  headers,
  data,
});
