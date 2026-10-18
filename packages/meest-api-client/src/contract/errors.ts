// code and comments in English
import { CarrierError, CarrierErrorCategory, categoryFromHttpStatus } from '@shopana/carrier-core';
import type { HttpResponse } from '@shopana/carrier-core';
import type { MeestInfo } from './types/envelope';

export const MEEST_CARRIER = 'meest';

interface LooseEnvelope {
  status?: unknown;
  info?: MeestInfo | string | null;
  fieldName?: string | null;
  message?: string | null;
  messageDetails?: unknown;
  result?: unknown;
}

export function isEnvelope(data: unknown): data is LooseEnvelope {
  return (
    typeof data === 'object' && data !== null && !Array.isArray(data) && 'status' in data && !('contentType' in data)
  );
}

export function isOk(env: LooseEnvelope): boolean {
  return typeof env.status === 'string' && env.status.toLowerCase() === 'ok';
}

/** Error description from either `info` (object) or flat `fieldName`/`message` fields; both occur in the Swagger. */
function describe(env: LooseEnvelope): { fieldName?: string; message?: string; details?: unknown } {
  const info = typeof env.info === 'object' && env.info !== null ? env.info : undefined;
  const fieldName = info?.fieldName ?? env.fieldName ?? undefined;
  const message = info?.message ?? env.message ?? (typeof env.info === 'string' ? env.info : undefined) ?? undefined;
  const details = info?.messageDetails ?? env.messageDetails;
  return {
    ...(fieldName ? { fieldName } : {}),
    ...(message ? { message } : {}),
    ...(details !== undefined && details !== null && details !== '' ? { details } : {}),
  };
}

/** Meest publishes no error catalog, so the category comes from the HTTP status and a few field hints. */
function categoryFor(httpStatus: number, fieldName: string | undefined): CarrierErrorCategory {
  if (httpStatus >= 200 && httpStatus < 300) {
    // Status "Error" in a 2xx body: the request was understood but refused. A complaint about the token is an auth error.
    if (fieldName === 'token') return CarrierErrorCategory.Authentication;
    return fieldName ? CarrierErrorCategory.Validation : CarrierErrorCategory.BusinessLogic;
  }
  if (httpStatus === 405 || httpStatus === 415) return CarrierErrorCategory.Validation;
  if (httpStatus === 410) return CarrierErrorCategory.NotFound;
  return categoryFromHttpStatus(httpStatus);
}

export function toMeestError(httpStatus: number, data: unknown): CarrierError {
  const env = isEnvelope(data) ? data : undefined;
  const { fieldName, message, details } = env ? describe(env) : {};
  return new CarrierError({
    carrier: MEEST_CARRIER,
    code: `${httpStatus}${fieldName ? `:${fieldName}` : ''}`,
    message: message ?? (typeof data === 'string' && data ? data.slice(0, 300) : `Meest returned HTTP ${httpStatus}`),
    category: categoryFor(httpStatus, fieldName),
    httpStatus,
    ...(fieldName ? { field: fieldName } : {}),
    raw: details !== undefined ? { body: data, details } : data,
  });
}

/** Success envelope -> `result`; `Error` envelope in a 2xx body -> CarrierError; binary and text pass through. */
export function unwrap(response: HttpResponse<unknown>): unknown {
  const { data } = response;
  if (!isEnvelope(data)) return data;
  if (!isOk(data)) throw toMeestError(response.status, data);
  return data.result;
}

export function mapError(response: HttpResponse<unknown>): CarrierError {
  return toMeestError(response.status, response.data);
}
