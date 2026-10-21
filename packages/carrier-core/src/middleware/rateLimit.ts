// code and comments in English
import type { Middleware } from '../http/pipeline';
import type { Clock, Sleep } from '../utils/time';
import { abortReason, assertPositiveNumber, sleep as defaultSleep, systemClock } from '../utils/time';

export interface RateLimitOptions {
  /** Requests allowed per `intervalMs`; also the burst size. At least 1. */
  limit: number;
  intervalMs: number;
  clock?: Clock;
  sleep?: Sleep;
}

interface Waiter {
  resolve: () => void;
  reject: (reason: unknown) => void;
  signal?: AbortSignal;
  onAbort?: () => void;
}

/**
 * Token bucket: holds up to `limit` tokens and refills continuously at `limit / intervalMs`.
 * Waiters are served in FIFO order; an aborted waiter leaves the queue without taking a token.
 * One bucket per client instance, so limits are per process.
 */
export class TokenBucket {
  private readonly capacity: number;
  private readonly refillPerMs: number;
  private readonly clock: Clock;
  private readonly sleep: Sleep;
  private tokens: number;
  private updatedAt: number;
  private readonly waiters: Waiter[] = [];
  private pumping = false;
  /** Interrupts the pump's sleep when the last waiter leaves, so no timer outlives the queue. */
  private wake?: AbortController;

  constructor(options: RateLimitOptions) {
    assertPositiveNumber(options.limit, 'rateLimit.limit');
    assertPositiveNumber(options.intervalMs, 'rateLimit.intervalMs');
    // A bucket smaller than one token never fills up and would wait forever.
    if (options.limit < 1) throw new TypeError('rateLimit.limit must be at least 1');
    this.capacity = options.limit;
    this.refillPerMs = options.limit / options.intervalMs;
    this.clock = options.clock ?? systemClock;
    this.sleep = options.sleep ?? defaultSleep;
    this.tokens = options.limit;
    this.updatedAt = this.clock.now();
  }

  /** Takes a token if one is available right now and nobody is queued ahead (FIFO is kept). */
  tryAcquire(): boolean {
    return this.waiters.length === 0 && this.take();
  }

  private take(): boolean {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }

  /** Resolves once a token has been taken; rejects with the signal's reason if aborted while waiting. */
  acquire(signal?: AbortSignal): Promise<void> {
    if (signal?.aborted) return Promise.reject(abortReason(signal));
    if (this.tryAcquire()) return Promise.resolve();
    return new Promise<void>((resolve, reject) => {
      const waiter: Waiter = { resolve, reject, signal };
      if (signal) {
        waiter.onAbort = () => {
          const index = this.waiters.indexOf(waiter);
          if (index !== -1) this.waiters.splice(index, 1);
          if (this.waiters.length === 0) this.wake?.abort();
          reject(abortReason(signal));
        };
        signal.addEventListener('abort', waiter.onAbort, { once: true });
      }
      this.waiters.push(waiter);
      void this.pump();
    });
  }

  /** Milliseconds until the next token is available (0 when one is available now). */
  waitTimeMs(): number {
    this.refill();
    return this.tokens >= 1 ? 0 : Math.ceil((1 - this.tokens) / this.refillPerMs);
  }

  private async pump(): Promise<void> {
    if (this.pumping) return;
    this.pumping = true;
    try {
      while (this.waiters.length > 0) {
        if (this.take()) {
          const waiter = this.waiters.shift()!;
          if (waiter.onAbort) waiter.signal?.removeEventListener('abort', waiter.onAbort);
          waiter.resolve();
          continue;
        }
        const wake = new AbortController();
        this.wake = wake;
        try {
          await this.sleep(this.waitTimeMs(), wake.signal);
        } catch (error) {
          if (!wake.signal.aborted) throw error;
        } finally {
          this.wake = undefined;
        }
      }
    } catch (error) {
      // A failing sleep would stall the queue forever; fail every waiter instead.
      for (const waiter of this.waiters.splice(0)) waiter.reject(error);
    } finally {
      this.pumping = false;
    }
  }

  private refill(): void {
    const now = this.clock.now();
    const elapsed = Math.max(0, now - this.updatedAt);
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillPerMs);
    this.updatedAt = now;
  }
}

export interface RateLimiter {
  /** Should reject with the signal's reason when aborted while waiting. */
  acquire(signal?: AbortSignal): Promise<void>;
}

export function toRateLimiter(limiter: RateLimiter | RateLimitOptions): RateLimiter {
  return 'acquire' in limiter ? limiter : new TokenBucket(limiter);
}

/** Waits for a rate-limit token before every attempt that reaches the network. */
export function rateLimit(limiter: RateLimiter | RateLimitOptions): Middleware {
  const bucket = toRateLimiter(limiter);
  return async (request, next) => {
    await bucket.acquire(request.signal);
    return next(request);
  };
}
