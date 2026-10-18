import { mapDemoPostError } from '../src/contract';

describe('mapDemoPostError', () => {
  it('takes code, message and field from the error body', () => {
    const error = mapDemoPostError({
      status: 400,
      headers: {},
      data: { code: 'VALIDATION', message: 'bad phone', field: 'phone' },
    });
    expect(error).toMatchObject({
      carrier: 'demo-post',
      code: 'VALIDATION',
      message: 'bad phone',
      field: 'phone',
      category: 'validation',
      httpStatus: 400,
    });
  });

  it('falls back to the HTTP status when the body has no details', () => {
    const error = mapDemoPostError({ status: 503, headers: {}, data: undefined });
    expect(error).toMatchObject({ code: 'HTTP_503', message: 'HTTP 503', category: 'server', retryable: true });
    expect(error.field).toBeUndefined();
  });
});
