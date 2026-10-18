// code and comments in English
import { CarrierError, CarrierErrorCategory } from '@shopana/carrier-core';

/** Input the adapter cannot map to the Ukrposhta API; thrown before any request is sent. */
export function invalidInput(message: string, field?: string): CarrierError {
  return new CarrierError({
    carrier: 'ukrposhta',
    code: 'INVALID_INPUT',
    message,
    category: CarrierErrorCategory.Validation,
    ...(field ? { field } : {}),
  });
}

/** An operation the carrier forbids in the shipment's current state. */
export function notAllowed(code: string, message: string): CarrierError {
  return new CarrierError({ carrier: 'ukrposhta', code, message, category: CarrierErrorCategory.BusinessLogic });
}

export function isNotFound(error: unknown): boolean {
  return error instanceof CarrierError && error.category === CarrierErrorCategory.NotFound;
}
