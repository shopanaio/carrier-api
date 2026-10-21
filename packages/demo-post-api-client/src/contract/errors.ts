// code and comments in English
import { CarrierError, categoryFromHttpStatus } from '@shopana/carrier-core';
import type { HttpResponse } from '@shopana/carrier-core';

/** Maps a non-2xx Demo Post response to CarrierError. Extend with the carrier's error catalog. */
export function mapDemoPostError(response: HttpResponse<unknown>): CarrierError {
  const body = (response.data ?? {}) as { code?: string; message?: string; field?: string };
  return new CarrierError({
    carrier: 'demo-post',
    code: body.code ?? `HTTP_${response.status}`,
    message: body.message ?? `HTTP ${response.status}`,
    category: categoryFromHttpStatus(response.status),
    httpStatus: response.status,
    ...(body.field ? { field: body.field } : {}),
    raw: response.data,
  });
}
