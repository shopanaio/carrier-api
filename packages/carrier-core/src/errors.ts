// code and comments in English

/**
 * Error categories shared by every carrier. Values match the Nova Poshta
 * `ErrorCategory` enum so its catalog maps onto CarrierError without translation;
 * `not_found`, `rate_limit`, `server` and `timeout` are added for HTTP-based carriers.
 */
export enum CarrierErrorCategory {
  Authentication = 'authentication',
  Validation = 'validation',
  BusinessLogic = 'business_logic',
  NotFound = 'not_found',
  RateLimit = 'rate_limit',
  Server = 'server',
  Network = 'network',
  Timeout = 'timeout',
  Configuration = 'configuration',
  Unknown = 'unknown',
}

export interface CarrierErrorInit {
  carrier: string;
  code: string;
  message: string;
  category: CarrierErrorCategory;
  retryable?: boolean;
  httpStatus?: number;
  /** Raw carrier payload (response body or thrown value) for debugging. */
  raw?: unknown;
  /** Field the carrier blamed, when it reports one. */
  field?: string;
  cause?: unknown;
}

/** Single error type every carrier client throws. */
export class CarrierError extends Error {
  readonly carrier: string;
  readonly code: string;
  readonly category: CarrierErrorCategory;
  readonly retryable: boolean;
  readonly httpStatus?: number;
  readonly raw?: unknown;
  readonly field?: string;
  override readonly cause?: unknown;

  constructor(init: CarrierErrorInit) {
    super(init.message);
    this.name = 'CarrierError';
    this.carrier = init.carrier;
    this.code = init.code;
    this.category = init.category;
    this.retryable = init.retryable ?? isRetryableCategory(init.category);
    this.httpStatus = init.httpStatus;
    this.raw = init.raw;
    this.field = init.field;
    this.cause = init.cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      carrier: this.carrier,
      code: this.code,
      message: this.message,
      category: this.category,
      retryable: this.retryable,
      httpStatus: this.httpStatus,
      field: this.field,
    };
  }
}

export function isCarrierError(value: unknown): value is CarrierError {
  return value instanceof CarrierError;
}

export function isRetryableCategory(category: CarrierErrorCategory): boolean {
  return (
    category === CarrierErrorCategory.RateLimit ||
    category === CarrierErrorCategory.Server ||
    category === CarrierErrorCategory.Network ||
    category === CarrierErrorCategory.Timeout
  );
}

/** Default HTTP status → category mapping used when a carrier has no better signal. */
export function categoryFromHttpStatus(status: number): CarrierErrorCategory {
  if (status === 401 || status === 403) return CarrierErrorCategory.Authentication;
  if (status === 404 || status === 410) return CarrierErrorCategory.NotFound;
  if (status === 408) return CarrierErrorCategory.Timeout;
  if (status === 429) return CarrierErrorCategory.RateLimit;
  if (status >= 500) return CarrierErrorCategory.Server;
  if (status >= 400) return CarrierErrorCategory.Validation;
  return CarrierErrorCategory.Unknown;
}

/**
 * Errors marked `fatal: true` (e.g. carrier-testing's SimulatorError: a contract violation in a test)
 * pass through the client untouched: they are never retried or wrapped as network errors.
 */
export function isFatalError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { fatal?: unknown }).fatal === true;
}

/**
 * Whether a value thrown below the retry layer may be repeated: retryable CarrierErrors and
 * transport failures. Anything else (a bug in a middleware, a malformed payload) is not.
 */
export function isRetryableFailure(error: unknown): boolean {
  if (isFatalError(error) || errorName(error) === 'AbortError') return false;
  if (isCarrierError(error)) return error.retryable;
  return isTransportFailure(error);
}

const TRANSPORT_FAILURE_MESSAGES = [
  'fetch failed',
  'failed to fetch',
  'networkerror',
  'load failed',
  'network request failed',
  'terminated',
];
const TRANSPORT_FAILURE_CODES = ['ENOTFOUND', 'EAI_AGAIN', 'ETIMEDOUT', 'EPIPE', 'EHOSTUNREACH', 'ENETUNREACH'];

/**
 * Whether a raw thrown value means the request did not get a response: a timeout, a socket error
 * (`ECONN*`, `UND_ERR_*`, DNS) or the TypeError that `fetch` throws in Node, browsers and Safari.
 */
export function isTransportFailure(error: unknown): boolean {
  if (errorName(error) === 'TimeoutError') return true;
  const code = errorCode(error);
  if (code && (code.startsWith('ECONN') || code.startsWith('UND_ERR_') || TRANSPORT_FAILURE_CODES.includes(code)))
    return true;
  if (error instanceof TypeError) {
    const message = error.message.toLowerCase();
    return TRANSPORT_FAILURE_MESSAGES.some(m => message.startsWith(m));
  }
  return false;
}

const PROGRAMMING_ERRORS = [TypeError, RangeError, ReferenceError, SyntaxError, URIError, EvalError];

/**
 * Whether a value rejected by a transport is a bug in the transport (a TypeError, RangeError, ...
 * that is not the TypeError `fetch` uses for network failures) rather than a lost connection.
 * Other values (`Error('socket hang up')`, library errors) are still treated as network failures.
 */
export function isProgrammingError(error: unknown): boolean {
  return PROGRAMMING_ERRORS.some(type => error instanceof type) && !isTransportFailure(error);
}

// ETOKEN_TIMEOUT: a login or refresh (auth/auth.ts) timed out before the request itself was sent.
const PRE_SEND_CODES = ['ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN', 'UND_ERR_CONNECT_TIMEOUT', 'ETOKEN_TIMEOUT'];

/**
 * Whether the failure certainly happened before any byte reached the carrier (connection refused,
 * DNS failure, connect timeout, token timeout), so even a non-idempotent request can be repeated safely.
 */
export function isPreSendFailure(error: unknown): boolean {
  const code = errorCode(error);
  return code !== undefined && PRE_SEND_CODES.includes(code);
}

/** System error code of `error` or of a value in its `cause` chain (undici puts it on `cause`). */
function errorCode(error: unknown): string | undefined {
  let current = error;
  for (let depth = 0; depth < 4 && typeof current === 'object' && current !== null; depth += 1) {
    const code = (current as { code?: unknown }).code;
    if (typeof code === 'string' && /^(E[A-Z_]+|UND_ERR_[A-Z_]+)$/.test(code)) return code;
    current = (current as { cause?: unknown }).cause;
  }
  return undefined;
}

function errorName(error: unknown): string | undefined {
  const name = (error as { name?: unknown } | null | undefined)?.name;
  return typeof name === 'string' ? name : undefined;
}

/** Wraps a thrown transport-level value (fetch TypeError, AbortError, ...) in a CarrierError. */
export function toNetworkError(carrier: string, error: unknown): CarrierError {
  if (isCarrierError(error)) return error;
  const name = errorName(error);
  const isTimeout = name === 'TimeoutError';
  const isAbort = name === 'AbortError';
  return new CarrierError({
    carrier,
    code: isTimeout ? 'TIMEOUT' : isAbort ? 'ABORTED' : 'NETWORK_ERROR',
    message: messageOf(error),
    category: isTimeout ? CarrierErrorCategory.Timeout : CarrierErrorCategory.Network,
    // A caller-initiated abort must not be retried.
    retryable: !isAbort,
    raw: error,
    cause: error,
  });
}

/**
 * Wraps any other thrown value (a bug in a middleware, `unwrap` or an auth strategy) in a
 * non-retryable `UNEXPECTED_ERROR`, so callers only ever see CarrierError.
 */
export function toCarrierError(carrier: string, error: unknown): CarrierError {
  if (isCarrierError(error)) return error;
  return new CarrierError({
    carrier,
    code: 'UNEXPECTED_ERROR',
    message: messageOf(error),
    category: CarrierErrorCategory.Unknown,
    retryable: false,
    raw: error,
    cause: error,
  });
}

function messageOf(error: unknown): string {
  const message = (error as { message?: unknown } | null | undefined)?.message;
  return typeof message === 'string' ? message : String(error);
}
