import { CarrierErrorCategory } from '@shopana/carrier-core';
import { categoryOfUkrposhtaCode, mapUkrposhtaError } from '../src/errors';

const map = (status: number, data: unknown) => mapUkrposhtaError({ status, headers: {}, data });

describe('mapUkrposhtaError', () => {
  it('takes code and message from the error body', () => {
    expect(map(400, { code: 'UPE01002', message: 'bad phone' })).toMatchObject({
      carrier: 'ukrposhta',
      code: 'UPE01002',
      message: 'bad phone',
      category: CarrierErrorCategory.Validation,
      httpStatus: 400,
      retryable: false,
    });
  });

  it.each([
    ['UPE01001', CarrierErrorCategory.BusinessLogic],
    ['UPE01004', CarrierErrorCategory.Validation],
    ['UPE02001', CarrierErrorCategory.NotFound],
    ['UPE03003', CarrierErrorCategory.BusinessLogic],
    ['UPE04002', CarrierErrorCategory.Server],
    ['UPE05001', CarrierErrorCategory.Authentication],
    ['UPE06001', CarrierErrorCategory.Server],
    ['UPE07001', CarrierErrorCategory.BusinessLogic],
    ['UPE08011', CarrierErrorCategory.Server],
  ])('puts %s into %s', (code, category) => {
    expect(categoryOfUkrposhtaCode(code, 400)).toBe(category);
  });

  it('falls back to the HTTP status for unknown or missing codes', () => {
    expect(categoryOfUkrposhtaCode('UPE99999', 404)).toBe(CarrierErrorCategory.NotFound);
    expect(categoryOfUkrposhtaCode(undefined, 401)).toBe(CarrierErrorCategory.Authentication);
    expect(categoryOfUkrposhtaCode('boom', 429)).toBe(CarrierErrorCategory.RateLimit);
  });

  it('accepts the older message-only body', () => {
    const error = map(400, { message: 'Address has not been saved! PostOffice 66666 not found!' });
    expect(error).toMatchObject({
      code: 'HTTP_400',
      message: 'Address has not been saved! PostOffice 66666 not found!',
    });
  });

  it('uses the catalog message when the body only has a code', () => {
    expect(map(404, { code: 'UPE02001' }).message).toBe("Can't find an object by id or uuid");
  });

  it('retries only server errors and rate limits', () => {
    expect(map(503, undefined)).toMatchObject({ code: 'HTTP_503', message: 'HTTP 503', retryable: true });
    expect(map(429, undefined).retryable).toBe(true);
    expect(map(500, { code: 'UPE08000' }).retryable).toBe(true);
    expect(map(400, { code: 'UPE04000' }).retryable).toBe(false);
  });

  it('keeps a text body as the message and the raw payload', () => {
    const error = map(502, 'Bad gateway');
    expect(error.message).toBe('Bad gateway');
    expect(error.raw).toBe('Bad gateway');
  });

  it('reports the blamed field', () => {
    expect(map(400, { code: 'UPE01002', message: 'x', field: 'postcode' }).field).toBe('postcode');
  });
});
