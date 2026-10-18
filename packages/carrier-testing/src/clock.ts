// code and comments in English
import type { Clock } from '@shopana/carrier-core';

/** Manually driven clock shared by the simulator and the client under test (token TTLs, rate limits). */
export class SimClock implements Clock {
  private current: number;

  constructor(start: number | Date = Date.UTC(2026, 0, 1, 9, 0, 0)) {
    this.current = typeof start === 'number' ? start : start.getTime();
  }

  now(): number {
    return this.current;
  }

  advance(ms: number): void {
    if (ms < 0) throw new RangeError('SimClock cannot go backwards');
    this.current += ms;
  }

  set(time: number | Date): void {
    this.current = typeof time === 'number' ? time : time.getTime();
  }

  toISOString(): string {
    return new Date(this.current).toISOString();
  }

  /** A `Sleep` that advances this clock instead of waiting; plug it into retry/rate-limit options. */
  readonly sleep = (ms: number, signal?: AbortSignal): Promise<void> => {
    if (signal?.aborted) {
      return Promise.reject(
        signal.reason ?? Object.assign(new Error('The operation was aborted'), { name: 'AbortError' }),
      );
    }
    this.advance(Math.max(0, ms));
    return Promise.resolve();
  };
}
