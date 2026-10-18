// code and comments in English

/** Per-call options accepted by every service method of both clients. */
export interface RequestOptions {
  /** Aborts this call, including retries and waits for a rate-limit slot. */
  signal?: AbortSignal;
}
