// code and comments in English
import type { Middleware } from '../http/pipeline';
import type { HttpRequest, HttpResponse } from '../http/types';
import { getHeader, isIdempotent } from '../http/types';
import { isPreSendFailure, isRetryableFailure } from '../errors';
import type { Clock, Sleep } from '../utils/time';
import { assertNonNegativeInteger, sleep as defaultSleep, systemClock } from '../utils/time';

export interface RetryOptions {
  /** Retries after the first attempt. Default 2. */
  maxRetries?: number;
  /** First backoff step. Default 500 ms; doubles every attempt. */
  baseDelayMs?: number;
  /** Cap for a computed backoff step. Default 30 s. */
  maxDelayMs?: number;
  /** A `Retry-After` longer than this is not waited for; the response is returned as is. Default 60 s. */
  maxRetryAfterMs?: number;
  /** `full` (default) picks a random delay in [0, backoff]; `none` waits the whole backoff. */
  jitter?: 'full' | 'none';
  /** Statuses treated as transient. Default 408, 425, 429, 500, 502, 503, 504. */
  retryOnStatus?: readonly number[];
  /**
   * Carrier-specific predicate for 2xx responses that are really throttling or transient
   * failures (Nova Poshta reports rate limiting as error code 20000401501 in a 200 body).
   * A match is treated like 429: the carrier rejected the call without processing it.
   */
  shouldRetryResponse?: (response: HttpResponse<unknown>, request: HttpRequest) => boolean;
  /**
   * Repeat non-idempotent requests (POST/PATCH without `idempotent: true`) after 5xx or network
   * errors. Off by default: a shipment could be created twice. 429 and failures that certainly
   * happened before sending (ECONNREFUSED, ENOTFOUND, EAI_AGAIN) are always retried.
   */
  retryNonIdempotent?: boolean;
  onRetry?: (info: RetryInfo) => void;
  sleep?: Sleep;
  clock?: Clock;
  random?: () => number;
}

export interface RetryInfo {
  attempt: number;
  delayMs: number;
  request: HttpRequest;
  response?: HttpResponse<unknown>;
  error?: unknown;
}

const DEFAULT_RETRY_STATUS = [408, 425, 429, 500, 502, 503, 504];

/**
 * Retries 429, 5xx, network errors and carrier predicates with exponential backoff and `Retry-After`.
 * A thrown CarrierError is repeated only when it is `retryable` (a failed login is not).
 */
export function retry(options: RetryOptions = {}): Middleware {
  const maxRetries = options.maxRetries ?? 2;
  const baseDelayMs = options.baseDelayMs ?? 500;
  const maxDelayMs = options.maxDelayMs ?? 30_000;
  const maxRetryAfterMs = options.maxRetryAfterMs ?? 60_000;
  assertNonNegativeInteger(maxRetries, 'retry.maxRetries');
  assertNonNegativeInteger(baseDelayMs, 'retry.baseDelayMs');
  assertNonNegativeInteger(maxDelayMs, 'retry.maxDelayMs');

  const retryOnStatus = new Set(options.retryOnStatus ?? DEFAULT_RETRY_STATUS);
  const sleep = options.sleep ?? defaultSleep;
  const clock = options.clock ?? systemClock;
  const random = options.random ?? Math.random;

  const backoff = (attempt: number) => {
    const step = Math.min(maxDelayMs, baseDelayMs * 2 ** attempt);
    return options.jitter === 'none' ? step : Math.floor(random() * step);
  };

  return async (request, next) => {
    const safeToRepeat = isIdempotent(request) || options.retryNonIdempotent === true;

    for (let attempt = 0; ; attempt += 1) {
      let response: HttpResponse<unknown>;
      try {
        response = await next(request);
      } catch (error) {
        // A refused connection or a DNS failure never reached the carrier, so even a POST is safe to repeat.
        const repeatable = safeToRepeat || isPreSendFailure(error);
        if (attempt >= maxRetries || !repeatable || request.signal?.aborted || !isRetryableFailure(error)) throw error;
        const delayMs = backoff(attempt);
        options.onRetry?.({ attempt: attempt + 1, delayMs, request, error });
        await sleep(delayMs, request.signal);
        continue;
      }

      const verdict = classify(response, request);
      if (verdict === 'done' || attempt >= maxRetries) return response;
      if (verdict === 'transient' && !safeToRepeat) return response;

      const retryAfterMs = parseRetryAfter(getHeader(response.headers, 'retry-after'), clock.now());
      if (retryAfterMs !== undefined && retryAfterMs > maxRetryAfterMs) return response;
      const delayMs = retryAfterMs ?? backoff(attempt);

      options.onRetry?.({ attempt: attempt + 1, delayMs, request, response });
      await sleep(delayMs, request.signal);
    }
  };

  // 'rejected': the carrier refused without processing (safe to repeat any method).
  // 'transient': the outcome is unknown (repeat only idempotent requests).
  function classify(response: HttpResponse<unknown>, request: HttpRequest): 'done' | 'rejected' | 'transient' {
    if (response.status === 429) return retryOnStatus.has(429) ? 'rejected' : 'done';
    if (retryOnStatus.has(response.status)) return 'transient';
    if (options.shouldRetryResponse?.(response, request)) return 'rejected';
    return 'done';
  }
}

/** Parses `Retry-After` as delta-seconds or an HTTP date. Returns milliseconds to wait. */
export function parseRetryAfter(value: string | undefined, now: number): number | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  if (trimmed === '') return undefined;
  if (/^\d+(\.\d+)?$/.test(trimmed)) return Math.round(Number(trimmed) * 1000);
  const date = Date.parse(trimmed);
  if (Number.isNaN(date)) return undefined;
  return Math.max(0, date - now);
}
