import { appendQuery, expandPath, joinUrl } from '../src';

describe('url helpers', () => {
  it('joins base and path without doubling slashes', () => {
    expect(joinUrl('https://x.test/ecom/0.0.1/', '/shipments')).toBe('https://x.test/ecom/0.0.1/shipments');
    expect(joinUrl('https://x.test/api', 'a/b')).toBe('https://x.test/api/a/b');
    expect(joinUrl('https://x.test/api', '')).toBe('https://x.test/api');
    expect(joinUrl('https://x.test/api', 'https://other.test/x')).toBe('https://other.test/x');
  });

  it('expands and encodes path params, rejecting missing ones', () => {
    expect(expandPath('/parcel/{id}/{kind}', { id: 'a b/c', kind: 1 })).toBe('/parcel/a%20b%2Fc/1');
    expect(() => expandPath('/parcel/{id}', {})).toThrow('Missing path parameter "id"');
  });

  it('appends query, skipping nullish and repeating arrays', () => {
    expect(appendQuery('https://x.test/s', { a: 1, b: undefined, c: null, d: [true, 'x y'] })).toBe(
      'https://x.test/s?a=1&d=true&d=x%20y',
    );
    expect(appendQuery('https://x.test/s?z=1#frag', { a: 'b' })).toBe('https://x.test/s?z=1&a=b#frag');
    expect(appendQuery('https://x.test/s', {})).toBe('https://x.test/s');
    expect(appendQuery('https://x.test/s', undefined)).toBe('https://x.test/s');
  });
});
