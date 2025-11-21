import {
  serializeQueryParams,
  normalizePathSegment,
  trimTrailingSlash,
  ensureLeadingSlash,
  normalizeDateInput,
} from '../src/utils/serializers';

describe('serializers', () => {
  describe('serializeQueryParams', () => {
    it('should serialize simple key-value pairs', () => {
      const result = serializeQueryParams({ foo: 'bar', baz: 'qux' });
      expect(result).toBe('?foo=bar&baz=qux');
    });

    it('should handle numeric values', () => {
      const result = serializeQueryParams({ page: 1, limit: 10 });
      expect(result).toBe('?page=1&limit=10');
    });

    it('should handle boolean values', () => {
      const result = serializeQueryParams({ active: true, deleted: false });
      expect(result).toBe('?active=true&deleted=false');
    });

    it('should skip undefined values', () => {
      const result = serializeQueryParams({ foo: 'bar', skip: undefined });
      expect(result).toBe('?foo=bar');
    });

    it('should skip null values', () => {
      const result = serializeQueryParams({ foo: 'bar', skip: null });
      expect(result).toBe('?foo=bar');
    });

    it('should handle empty object', () => {
      const result = serializeQueryParams({});
      expect(result).toBe('');
    });

    it('should handle array values', () => {
      const result = serializeQueryParams({ tags: ['a', 'b', 'c'] });
      expect(result).toBe('?tags=a&tags=b&tags=c');
    });

    it('should skip undefined and null in arrays', () => {
      const result = serializeQueryParams({ tags: ['a', null, 'b', undefined, 'c'] });
      expect(result).toBe('?tags=a&tags=b&tags=c');
    });

    it('should handle Date objects', () => {
      const date = new Date('2024-01-15T10:30:00.000Z');
      const result = serializeQueryParams({ created: date });
      // URLSearchParams encodes colons as %3A
      expect(result).toBe('?created=2024-01-15T10%3A30%3A00.000Z');
    });

    it('should URL-encode special characters', () => {
      const result = serializeQueryParams({ query: 'hello world', path: '/api/v1' });
      expect(result).toBe('?query=hello+world&path=%2Fapi%2Fv1');
    });

    it('should handle mixed types', () => {
      const result = serializeQueryParams({
        str: 'text',
        num: 42,
        bool: true,
        arr: [1, 2],
        skip: null,
      });
      expect(result).toContain('str=text');
      expect(result).toContain('num=42');
      expect(result).toContain('bool=true');
      expect(result).toContain('arr=1&arr=2');
      expect(result).not.toContain('skip');
    });

    it('should handle empty arrays', () => {
      const result = serializeQueryParams({ tags: [] });
      expect(result).toBe('');
    });

    it('should handle object with only null/undefined values', () => {
      const result = serializeQueryParams({ a: null, b: undefined });
      expect(result).toBe('');
    });
  });

  describe('normalizePathSegment', () => {
    it('should add leading slash if missing', () => {
      expect(normalizePathSegment('users')).toBe('/users');
    });

    it('should keep leading slash if present', () => {
      expect(normalizePathSegment('/users')).toBe('/users');
    });

    it('should handle empty string', () => {
      expect(normalizePathSegment('')).toBe('/');
    });

    it('should handle path with multiple segments', () => {
      expect(normalizePathSegment('api/v1/users')).toBe('/api/v1/users');
    });
  });

  describe('trimTrailingSlash', () => {
    it('should remove single trailing slash', () => {
      expect(trimTrailingSlash('https://api.com/')).toBe('https://api.com');
    });

    it('should remove multiple trailing slashes', () => {
      expect(trimTrailingSlash('https://api.com///')).toBe('https://api.com');
    });

    it('should not modify string without trailing slash', () => {
      expect(trimTrailingSlash('https://api.com')).toBe('https://api.com');
    });

    it('should handle empty string', () => {
      expect(trimTrailingSlash('')).toBe('');
    });

    it('should handle single slash', () => {
      expect(trimTrailingSlash('/')).toBe('');
    });

    it('should preserve internal slashes', () => {
      expect(trimTrailingSlash('https://api.com/v1/')).toBe('https://api.com/v1');
    });
  });

  describe('ensureLeadingSlash', () => {
    it('should add leading slash if missing', () => {
      expect(ensureLeadingSlash('users')).toBe('/users');
    });

    it('should keep existing leading slash', () => {
      expect(ensureLeadingSlash('/users')).toBe('/users');
    });

    it('should handle empty string', () => {
      expect(ensureLeadingSlash('')).toBe('/');
    });

    it('should handle path with query params', () => {
      expect(ensureLeadingSlash('users?page=1')).toBe('/users?page=1');
    });
  });

  describe('normalizeDateInput', () => {
    it('should convert Date to ISO string', () => {
      const date = new Date('2024-01-15T10:30:00.000Z');
      expect(normalizeDateInput(date)).toBe('2024-01-15T10:30:00.000Z');
    });

    it('should convert timestamp to ISO string', () => {
      const timestamp = new Date('2024-01-15T10:30:00.000Z').getTime();
      expect(normalizeDateInput(timestamp)).toBe('2024-01-15T10:30:00.000Z');
    });

    it('should return string as-is', () => {
      expect(normalizeDateInput('2024-01-15')).toBe('2024-01-15');
    });

    it('should handle ISO string', () => {
      const isoString = '2024-01-15T10:30:00.000Z';
      expect(normalizeDateInput(isoString)).toBe(isoString);
    });

    it('should handle custom date format string', () => {
      expect(normalizeDateInput('15/01/2024')).toBe('15/01/2024');
    });
  });
});
