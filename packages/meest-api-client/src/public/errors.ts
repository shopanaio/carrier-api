// code and comments in English
import { CarrierError, CarrierErrorCategory } from '@shopana/carrier-core';
import type { HttpResponse } from '@shopana/carrier-core';
import type { MeestPublicEnvelope } from './types';

export const MEEST_PUBLIC_CARRIER = 'meest';

/**
 * Error codes seen in the public API (`msg.code`). The API publishes no catalog: "not found" answers are
 * 10111 (branch), 10401 (region), 10431 (street); 10432 means a street lookup without `city_id`.
 */
const NOT_FOUND_CODES = new Set([10111, 10401, 10411, 10421, 10431]);
const VALIDATION_CODES = new Set([10432]);

export function isMeestNotFound(error: unknown): boolean {
  return error instanceof CarrierError && error.category === CarrierErrorCategory.NotFound;
}

/** Turns a `status: 0` envelope into a CarrierError. The API reports errors with HTTP 200. */
export function envelopeError(response: HttpResponse<unknown>): CarrierError {
  const env = response.data as MeestPublicEnvelope<unknown> | null;
  const code = env?.msg?.code;
  const category =
    code !== undefined && NOT_FOUND_CODES.has(code)
      ? CarrierErrorCategory.NotFound
      : code !== undefined && VALIDATION_CODES.has(code)
        ? CarrierErrorCategory.Validation
        : CarrierErrorCategory.BusinessLogic;
  return new CarrierError({
    carrier: MEEST_PUBLIC_CARRIER,
    code: code !== undefined ? String(code) : 'UNKNOWN',
    message:
      [env?.msg?.en, env?.msg?.ua, env?.msg?.ru].find(m => typeof m === 'string' && m !== '') ??
      'Meest public API returned an error',
    category,
    httpStatus: response.status,
    raw: response.data,
  });
}

/** Non-2xx answers (gateway errors) fall back to the generic status mapping in carrier-core. */
export function isEnvelope(data: unknown): data is MeestPublicEnvelope<unknown> {
  return typeof data === 'object' && data !== null && 'status' in data && 'result' in data;
}
