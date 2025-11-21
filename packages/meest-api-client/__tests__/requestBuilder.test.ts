import { RequestBuilder } from '../src/utils/requestBuilder';
import { TokenManager } from '../src/core/tokenManager';

describe('RequestBuilder', () => {
  let tokenManager: TokenManager;

  beforeEach(() => {
    tokenManager = new TokenManager();
  });

  describe('URL construction', () => {
    it('should build URL with base URL and path', () => {
      const builder = new RequestBuilder({
        baseUrl: 'https://api.test.com',
        tokenManager,
      });

      const request = builder.build({
        method: 'GET',
        path: '/users',
      });

      expect(request.url).toBe('https://api.test.com/users');
    });

    it('should ensure leading slash on path', () => {
      const builder = new RequestBuilder({
        baseUrl: 'https://api.test.com',
        tokenManager,
      });

      const request = builder.build({
        method: 'GET',
        path: 'users',
      });

      expect(request.url).toBe('https://api.test.com/users');
    });

    it('should trim trailing slash from base URL', () => {
      const builder = new RequestBuilder({
        baseUrl: 'https://api.test.com/',
        tokenManager,
      });

      const request = builder.build({
        method: 'GET',
        path: '/users',
      });

      expect(request.url).toBe('https://api.test.com/users');
    });

    it('should append query parameters', () => {
      const builder = new RequestBuilder({
        baseUrl: 'https://api.test.com',
        tokenManager,
      });

      const request = builder.build({
        method: 'GET',
        path: '/users',
        query: { page: 1, limit: 10 },
      });

      expect(request.url).toBe('https://api.test.com/users?page=1&limit=10');
    });

    it('should handle empty query parameters', () => {
      const builder = new RequestBuilder({
        baseUrl: 'https://api.test.com',
        tokenManager,
      });

      const request = builder.build({
        method: 'GET',
        path: '/users',
        query: {},
      });

      expect(request.url).toBe('https://api.test.com/users');
    });

    it('should use default base URL if not provided', () => {
      const builder = new RequestBuilder({
        baseUrl: '',
        tokenManager,
      });

      const request = builder.build({
        method: 'GET',
        path: '/test',
      });

      // RequestBuilder uses 'https://api.meest.com/v3.0/openAPI' as default when empty string is passed
      expect(request.url).toBe('https://api.meest.com/v3.0/openAPI/test');
    });
  });

  describe('Headers', () => {
    it('should include default headers', () => {
      const builder = new RequestBuilder({
        baseUrl: 'https://api.test.com',
        tokenManager,
      });

      const request = builder.build({
        method: 'POST',
        path: '/users',
      });

      expect(request.headers).toMatchObject({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      });
    });

    it('should merge custom default headers', () => {
      const builder = new RequestBuilder({
        baseUrl: 'https://api.test.com',
        tokenManager,
        defaultHeaders: { 'X-Custom': 'value' },
      });

      const request = builder.build({
        method: 'GET',
        path: '/users',
      });

      expect(request.headers).toMatchObject({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Custom': 'value',
      });
    });

    it('should merge request-specific headers', () => {
      const builder = new RequestBuilder({
        baseUrl: 'https://api.test.com',
        tokenManager,
      });

      const request = builder.build({
        method: 'GET',
        path: '/users',
        headers: { 'X-Request-ID': '123' },
      });

      expect(request.headers).toMatchObject({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Request-ID': '123',
      });
    });

    it('should allow request headers to override defaults', () => {
      const builder = new RequestBuilder({
        baseUrl: 'https://api.test.com',
        tokenManager,
        defaultHeaders: { 'Content-Type': 'text/plain' },
      });

      const request = builder.build({
        method: 'POST',
        path: '/users',
        headers: { 'Content-Type': 'application/xml' },
      });

      expect(request.headers?.['Content-Type']).toBe('application/xml');
    });
  });

  describe('Token injection', () => {
    it('should inject token from tokenManager', () => {
      tokenManager.setToken('test-token-123');
      const builder = new RequestBuilder({
        baseUrl: 'https://api.test.com',
        tokenManager,
      });

      const request = builder.build({
        method: 'GET',
        path: '/protected',
      });

      expect(request.headers?.token).toBe('test-token-123');
    });

    it('should not inject token if skipAuth is true', () => {
      tokenManager.setToken('test-token-123');
      const builder = new RequestBuilder({
        baseUrl: 'https://api.test.com',
        tokenManager,
      });

      const request = builder.build({
        method: 'POST',
        path: '/auth/login',
        skipAuth: true,
      });

      expect(request.headers?.token).toBeUndefined();
    });

    it('should not inject token if tokenManager has no token', () => {
      const builder = new RequestBuilder({
        baseUrl: 'https://api.test.com',
        tokenManager,
      });

      const request = builder.build({
        method: 'GET',
        path: '/public',
      });

      expect(request.headers?.token).toBeUndefined();
    });

    it('should update token dynamically', () => {
      const builder = new RequestBuilder({
        baseUrl: 'https://api.test.com',
        tokenManager,
      });

      tokenManager.setToken('token-1');
      const request1 = builder.build({ method: 'GET', path: '/test' });
      expect(request1.headers?.token).toBe('token-1');

      tokenManager.setToken('token-2');
      const request2 = builder.build({ method: 'GET', path: '/test' });
      expect(request2.headers?.token).toBe('token-2');
    });
  });

  describe('Request properties', () => {
    it('should include method', () => {
      const builder = new RequestBuilder({
        baseUrl: 'https://api.test.com',
        tokenManager,
      });

      const request = builder.build({
        method: 'POST',
        path: '/users',
      });

      expect(request.method).toBe('POST');
    });

    it('should include body', () => {
      const builder = new RequestBuilder({
        baseUrl: 'https://api.test.com',
        tokenManager,
      });

      const body = { name: 'John', email: 'john@example.com' };
      const request = builder.build({
        method: 'POST',
        path: '/users',
        body,
      });

      expect(request.body).toEqual(body);
    });

    it('should include responseType', () => {
      const builder = new RequestBuilder({
        baseUrl: 'https://api.test.com',
        tokenManager,
      });

      const request = builder.build({
        method: 'GET',
        path: '/download',
        responseType: 'arraybuffer',
      });

      expect(request.responseType).toBe('arraybuffer');
    });

    it('should include signal', () => {
      const builder = new RequestBuilder({
        baseUrl: 'https://api.test.com',
        tokenManager,
      });

      const controller = new AbortController();
      const request = builder.build({
        method: 'GET',
        path: '/users',
        signal: controller.signal,
      });

      expect(request.signal).toBe(controller.signal);
    });
  });
});
