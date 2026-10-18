// code and comments in English
import type { AuthStrategy } from '../auth/types';
import type { Middleware } from '../http/pipeline';
import type { HttpRequest, HttpResponse } from '../http/types';

export interface AuthMiddlewareOptions {
  /** Some carriers answer 200 with an auth error in the body; override to detect those. Default: status 401. */
  isUnauthorized?: (response: HttpResponse<unknown>) => boolean;
  /**
   * Runs before the repeated request after credentials were renewed. HttpClient uses it to take
   * a rate-limit token, so the repeat counts against the carrier's limit like any other request.
   */
  beforeRepeat?: (request: HttpRequest) => Promise<void>;
}

/** Applies credentials and, on "unauthorized", lets the strategy renew them and repeats the request once. */
export function auth(strategy: AuthStrategy, options: AuthMiddlewareOptions = {}): Middleware {
  const isUnauthorized = options.isUnauthorized ?? (response => response.status === 401);
  return async (request, next) => {
    const applied = await strategy.apply(request);
    const response = await next(applied);
    if (!isUnauthorized(response) || !strategy.onUnauthorized) return response;
    if (!(await strategy.onUnauthorized(response, applied))) return response;
    await options.beforeRepeat?.(request);
    return next(await strategy.apply(request));
  };
}
