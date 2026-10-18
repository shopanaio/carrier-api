import { CarrierErrorCategory } from '@shopana/carrier-core';
import { formatDate, formatDateTime, formatIsoDate, toMeestError } from '../src';

describe('dates', () => {
  const winter = new Date('2026-01-31T22:30:15Z'); // already 01 Feb in Kyiv
  const summer = new Date('2026-07-15T21:30:00Z'); // UTC+3

  it('formats in Kyiv time', () => {
    expect(formatDate(winter)).toBe('01.02.2026');
    expect(formatIsoDate(winter)).toBe('2026-02-01');
    expect(formatDateTime(winter)).toBe('2026-02-01 00:30:15');
    expect(formatDateTime(summer)).toBe('2026-07-16 00:30:00');
  });

  it('passes strings through and rejects invalid dates', () => {
    expect(formatDate('19.03.2019')).toBe('19.03.2019');
    expect(formatIsoDate('2019-03-19')).toBe('2019-03-19');
    expect(() => formatDateTime(new Date('x'))).toThrow('Invalid date');
  });
});

describe('error mapping', () => {
  it('reads both envelope spellings and keeps details', () => {
    const nested = toMeestError(400, { status: 'Error', info: { fieldName: 'receiver.phone', message: 'Bad phone', messageDetails: 'x' }, result: null });
    expect(nested).toMatchObject({ code: '400:receiver.phone', field: 'receiver.phone', message: 'Bad phone', category: CarrierErrorCategory.Validation });
    expect((nested.raw as { details: unknown }).details).toBe('x');

    const flat = toMeestError(401, { status: 'Error', fieldName: 'token', message: 'Expired', result: null });
    expect(flat).toMatchObject({ code: '401:token', category: CarrierErrorCategory.Authentication });

    const text = toMeestError(500, { status: 'Error', info: 'Boom', result: null });
    expect(text).toMatchObject({ message: 'Boom', category: CarrierErrorCategory.Server, retryable: true });
  });

  it('maps the documented HTTP statuses and non-envelope bodies', () => {
    const cat = (s: number, body: unknown = null) => toMeestError(s, body).category;
    expect(cat(404)).toBe(CarrierErrorCategory.NotFound);
    expect(cat(410)).toBe(CarrierErrorCategory.NotFound);
    expect(cat(405)).toBe(CarrierErrorCategory.Validation);
    expect(cat(415)).toBe(CarrierErrorCategory.Validation);
    expect(cat(429)).toBe(CarrierErrorCategory.RateLimit);
    expect(cat(200, { status: 'Error', info: { message: 'no field' } })).toBe(CarrierErrorCategory.BusinessLogic);
    expect(toMeestError(502, '<html>Bad gateway</html>').message).toBe('<html>Bad gateway</html>');
    expect(toMeestError(500, null).message).toBe('Meest returned HTTP 500');
  });
});
