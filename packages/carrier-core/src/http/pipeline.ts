// code and comments in English
import type { HttpRequest, HttpResponse, HttpTransport } from './types';

export type Next = (request: HttpRequest) => Promise<HttpResponse<unknown>>;

/** A pipeline step: may rewrite the request, call `next` zero or more times, and inspect the response. */
export type Middleware = (request: HttpRequest, next: Next) => Promise<HttpResponse<unknown>>;

/**
 * Wraps a transport in middlewares. The first middleware is the outermost:
 * `composeMiddleware(t, [a, b])` runs a → b → t.
 */
export function composeMiddleware(transport: HttpTransport, middlewares: readonly Middleware[]): HttpTransport {
  const terminal: Next = request => transport(request);
  const chain = middlewares.reduceRight<Next>((next, middleware) => request => middleware(request, next), terminal);
  return (<T>(request: HttpRequest) => chain(request) as Promise<HttpResponse<T>>) as HttpTransport;
}
