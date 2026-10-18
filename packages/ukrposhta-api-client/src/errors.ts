// code and comments in English
import { CarrierError, CarrierErrorCategory, categoryFromHttpStatus } from '@shopana/carrier-core';
import type { HttpResponse } from '@shopana/carrier-core';

/** Error groups of Annex J of the Ukrposhta API documentation, keyed by the `UPExx` prefix. */
export const UKRPOSHTA_ERROR_GROUPS: Readonly<Record<string, { name: string; category: CarrierErrorCategory }>> = {
  UPE01: { name: 'Validation', category: CarrierErrorCategory.Validation },
  UPE02: { name: 'Not found', category: CarrierErrorCategory.NotFound },
  UPE03: { name: 'Status', category: CarrierErrorCategory.BusinessLogic },
  UPE04: { name: 'PDF', category: CarrierErrorCategory.Server },
  UPE05: { name: 'Authentication', category: CarrierErrorCategory.Authentication },
  UPE06: { name: 'Database', category: CarrierErrorCategory.Server },
  UPE07: { name: 'Invalid operation', category: CarrierErrorCategory.BusinessLogic },
  UPE08: { name: 'Internal', category: CarrierErrorCategory.Server },
};

/** Codes whose meaning differs from their group's default. */
const CODE_CATEGORY_OVERRIDES: Readonly<Record<string, CarrierErrorCategory>> = {
  // "Can't perform an operation with the object with current state" is a business rule, not a malformed input.
  UPE01001: CarrierErrorCategory.BusinessLogic,
  // Wrong token, role or user state: the credentials, not the request, are at fault.
  UPE05000: CarrierErrorCategory.Authentication,
};

/** English messages of the documented codes (Annex J). */
export const UKRPOSHTA_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  UPE01000: 'General validation error',
  UPE01001: "Can't perform an operation with the object with current state",
  UPE01002: 'Input data validation error',
  UPE01003: 'Constraint validation error',
  UPE01004: 'Entity or its property is not unique',
  UPE02000: 'General not found error',
  UPE02001: "Can't find an object by id or uuid",
  UPE02002: "Can't find an object by field or property",
  UPE02003: "Can't find by linked object",
  UPE03000: 'General status error',
  UPE04000: 'General PDF error',
  UPE05000: 'General authentication error',
  UPE05001: 'Wrong token',
  UPE05002: 'Wrong role',
  UPE05003: 'Wrong state of the user',
  UPE06000: 'General database error',
  UPE06001: "Can't generate a value from the database",
  UPE07000: 'General invalid operations error',
  UPE07001: "Can't remove or delete object or property",
  UPE07002: "Can't change or delete object or property",
  UPE07003: 'Operation is not supported',
  UPE08000: 'General internal error',
};

const CODE_PATTERN = /^UPE\d{5}$/;

/** Category for a `UPExxxxx` code; falls back to the HTTP status when the code is unknown. */
export function categoryOfUkrposhtaCode(code: string | undefined, httpStatus: number): CarrierErrorCategory {
  if (code !== undefined && CODE_PATTERN.test(code)) {
    const override = CODE_CATEGORY_OVERRIDES[code] as CarrierErrorCategory | undefined;
    if (override !== undefined) return override;
    const group = UKRPOSHTA_ERROR_GROUPS[code.slice(0, 5)] as { category: CarrierErrorCategory } | undefined;
    if (group !== undefined) return group.category;
  }
  return categoryFromHttpStatus(httpStatus);
}

/** One entry of `validationProblems` (UPE10002, international documentation section 6): a hint for one parcel item. */
export interface UkrposhtaValidationProblem {
  /** The description that was sent; the partner service's key. */
  description: string;
  /** Status of the description from the partner service, e.g. `INCOMPLETE`. */
  status: string;
  /** What to clarify in the description. */
  clarifications: string[];
}

/** The documented error body; `CarrierError.raw` holds it as the service sent it. */
export interface UkrposhtaErrorResponse {
  code?: string;
  message?: string;
  field?: string;
  /** UPE10002 only. */
  validationProblems?: UkrposhtaValidationProblem[];
}

interface UkrposhtaErrorBody {
  code?: unknown;
  message?: unknown;
  field?: unknown;
  error?: unknown;
}

/**
 * Maps a non-2xx response to CarrierError. The service answers `{ "code": "UPE...", "message": "..." }`
 * (older routes only `{ "message": "..." }`). Only 5xx answers are retryable: every UPE error repeats identically.
 */
export function mapUkrposhtaError(response: HttpResponse<unknown>): CarrierError {
  const body = (typeof response.data === 'object' && response.data !== null ? response.data : {}) as UkrposhtaErrorBody;
  const rawCode = nonEmptyString(body.code);
  const text = typeof response.data === 'string' ? nonEmptyString(response.data.trim())?.slice(0, 500) : undefined;
  const message =
    nonEmptyString(body.message) ??
    nonEmptyString(body.error) ??
    text ??
    (rawCode === undefined ? undefined : UKRPOSHTA_ERROR_MESSAGES[rawCode]) ??
    `HTTP ${response.status}`;

  return new CarrierError({
    carrier: 'ukrposhta',
    code: rawCode ?? `HTTP_${response.status}`,
    message,
    category: categoryOfUkrposhtaCode(rawCode, response.status),
    retryable: response.status >= 500 || response.status === 429,
    httpStatus: response.status,
    ...(nonEmptyString(body.field) === undefined ? {} : { field: nonEmptyString(body.field) }),
    raw: response.data,
  });
}

function nonEmptyString(value: unknown): string | undefined {
  return typeof value === 'string' && value !== '' ? value : undefined;
}
