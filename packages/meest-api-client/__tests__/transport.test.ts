import { createFetchHttpTransport } from '../src/http/transport';
import type { HttpRequest } from '../src/http/transport';

describe('createFetchHttpTransport', () => {
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = jest.fn();
  });

  const createMockResponse = (data: any, status = 200, headers: Record<string, string> = {}) => ({
    status,
    headers: new Map(Object.entries(headers)),
    json: jest.fn().mockResolvedValue(data),
    arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
    body: 'stream-body',
  });

  describe('Basic requests', () => {
    it('should make GET request with correct URL', async () => {
      const transport = createFetchHttpTransport({ fetchImpl: mockFetch });
      const mockResponse = createMockResponse({ success: true });
      mockFetch.mockResolvedValue(mockResponse);

      const request: HttpRequest = {
        method: 'GET',
        url: 'https://api.test.com/users',
      };

      await transport.request(request);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/users',
        expect.objectContaining({
          method: 'GET',
        }),
      );
    });

    it('should make POST request with body', async () => {
      const transport = createFetchHttpTransport({ fetchImpl: mockFetch });
      const mockResponse = createMockResponse({ id: '123' });
      mockFetch.mockResolvedValue(mockResponse);

      const body = { name: 'John', email: 'john@test.com' };
      const request: HttpRequest = {
        method: 'POST',
        url: 'https://api.test.com/users',
        body,
      };

      await transport.request(request);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        }),
      );
    });

    it('should make PUT request', async () => {
      const transport = createFetchHttpTransport({ fetchImpl: mockFetch });
      const mockResponse = createMockResponse({ updated: true });
      mockFetch.mockResolvedValue(mockResponse);

      const request: HttpRequest = {
        method: 'PUT',
        url: 'https://api.test.com/users/123',
        body: { name: 'Updated' },
      };

      await transport.request(request);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/users/123',
        expect.objectContaining({ method: 'PUT' }),
      );
    });

    it('should make DELETE request', async () => {
      const transport = createFetchHttpTransport({ fetchImpl: mockFetch });
      const mockResponse = createMockResponse({ deleted: true });
      mockFetch.mockResolvedValue(mockResponse);

      const request: HttpRequest = {
        method: 'DELETE',
        url: 'https://api.test.com/users/123',
      };

      await transport.request(request);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/users/123',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  describe('Headers', () => {
    it('should include default headers', async () => {
      const transport = createFetchHttpTransport({ fetchImpl: mockFetch });
      const mockResponse = createMockResponse({});
      mockFetch.mockResolvedValue(mockResponse);

      const request: HttpRequest = {
        method: 'GET',
        url: 'https://api.test.com/users',
      };

      await transport.request(request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('should merge custom base headers', async () => {
      const transport = createFetchHttpTransport({
        fetchImpl: mockFetch,
        baseHeaders: { 'X-Custom': 'value' },
      });
      const mockResponse = createMockResponse({});
      mockFetch.mockResolvedValue(mockResponse);

      const request: HttpRequest = {
        method: 'GET',
        url: 'https://api.test.com/users',
      };

      await transport.request(request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom': 'value',
          }),
        }),
      );
    });

    it('should merge request headers', async () => {
      const transport = createFetchHttpTransport({ fetchImpl: mockFetch });
      const mockResponse = createMockResponse({});
      mockFetch.mockResolvedValue(mockResponse);

      const request: HttpRequest = {
        method: 'GET',
        url: 'https://api.test.com/users',
        headers: { 'Authorization': 'Bearer token123' },
      };

      await transport.request(request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer token123',
          }),
        }),
      );
    });

    it('should allow request headers to override base headers', async () => {
      const transport = createFetchHttpTransport({ fetchImpl: mockFetch });
      const mockResponse = createMockResponse({});
      mockFetch.mockResolvedValue(mockResponse);

      const request: HttpRequest = {
        method: 'POST',
        url: 'https://api.test.com/users',
        headers: { 'Content-Type': 'application/xml' },
      };

      await transport.request(request);

      const callArgs = mockFetch.mock.calls[0][1];
      expect(callArgs.headers['Content-Type']).toBe('application/xml');
    });
  });

  describe('Body handling', () => {
    it('should stringify object body when Content-Type is JSON', async () => {
      const transport = createFetchHttpTransport({ fetchImpl: mockFetch });
      const mockResponse = createMockResponse({});
      mockFetch.mockResolvedValue(mockResponse);

      const body = { foo: 'bar', num: 42 };
      const request: HttpRequest = {
        method: 'POST',
        url: 'https://api.test.com/data',
        body,
      };

      await transport.request(request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(body),
        }),
      );
    });

    it('should send string body as-is', async () => {
      const transport = createFetchHttpTransport({ fetchImpl: mockFetch });
      const mockResponse = createMockResponse({});
      mockFetch.mockResolvedValue(mockResponse);

      const request: HttpRequest = {
        method: 'POST',
        url: 'https://api.test.com/data',
        body: 'plain text',
      };

      await transport.request(request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: 'plain text',
        }),
      );
    });

    it('should send ArrayBuffer body as-is', async () => {
      const transport = createFetchHttpTransport({ fetchImpl: mockFetch });
      const mockResponse = createMockResponse({});
      mockFetch.mockResolvedValue(mockResponse);

      const arrayBuffer = new ArrayBuffer(8);
      const request: HttpRequest = {
        method: 'POST',
        url: 'https://api.test.com/upload',
        body: arrayBuffer,
      };

      await transport.request(request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: arrayBuffer,
        }),
      );
    });

    it('should send Uint8Array body as-is', async () => {
      const transport = createFetchHttpTransport({ fetchImpl: mockFetch });
      const mockResponse = createMockResponse({});
      mockFetch.mockResolvedValue(mockResponse);

      const uint8Array = new Uint8Array([1, 2, 3, 4]);
      const request: HttpRequest = {
        method: 'POST',
        url: 'https://api.test.com/upload',
        body: uint8Array,
      };

      await transport.request(request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: uint8Array,
        }),
      );
    });

    it('should handle undefined body', async () => {
      const transport = createFetchHttpTransport({ fetchImpl: mockFetch });
      const mockResponse = createMockResponse({});
      mockFetch.mockResolvedValue(mockResponse);

      const request: HttpRequest = {
        method: 'GET',
        url: 'https://api.test.com/users',
        body: undefined,
      };

      await transport.request(request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: undefined,
        }),
      );
    });

    it('should handle null body', async () => {
      const transport = createFetchHttpTransport({ fetchImpl: mockFetch });
      const mockResponse = createMockResponse({});
      mockFetch.mockResolvedValue(mockResponse);

      const request: HttpRequest = {
        method: 'POST',
        url: 'https://api.test.com/users',
        body: null,
      };

      await transport.request(request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: undefined,
        }),
      );
    });
  });

  describe('Response handling', () => {
    it('should return JSON response by default', async () => {
      const transport = createFetchHttpTransport({ fetchImpl: mockFetch });
      const responseData = { id: '123', name: 'Test' };
      const mockResponse = createMockResponse(responseData);
      mockFetch.mockResolvedValue(mockResponse);

      const request: HttpRequest = {
        method: 'GET',
        url: 'https://api.test.com/users/123',
      };

      const result = await transport.request(request);

      expect(mockResponse.json).toHaveBeenCalled();
      expect(result.data).toEqual(responseData);
      expect(result.status).toBe(200);
    });

    it('should return ArrayBuffer when responseType is arraybuffer', async () => {
      const transport = createFetchHttpTransport({ fetchImpl: mockFetch });
      const mockResponse = createMockResponse(null);
      mockFetch.mockResolvedValue(mockResponse);

      const request: HttpRequest = {
        method: 'GET',
        url: 'https://api.test.com/download',
        responseType: 'arraybuffer',
      };

      const result = await transport.request(request);

      expect(mockResponse.arrayBuffer).toHaveBeenCalled();
      expect(result.data).toBeInstanceOf(ArrayBuffer);
    });

    it('should return stream when responseType is stream', async () => {
      const transport = createFetchHttpTransport({ fetchImpl: mockFetch });
      const mockResponse = createMockResponse(null);
      mockFetch.mockResolvedValue(mockResponse);

      const request: HttpRequest = {
        method: 'GET',
        url: 'https://api.test.com/stream',
        responseType: 'stream',
      };

      const result = await transport.request(request);

      expect(result.data).toBe('stream-body');
    });

    it('should include response headers', async () => {
      const transport = createFetchHttpTransport({ fetchImpl: mockFetch });
      const mockResponse = createMockResponse({}, 200, {
        'Content-Type': 'application/json',
        'X-Request-Id': 'abc123',
      });
      mockFetch.mockResolvedValue(mockResponse);

      const request: HttpRequest = {
        method: 'GET',
        url: 'https://api.test.com/users',
      };

      const result = await transport.request(request);

      expect(result.headers).toEqual({
        'Content-Type': 'application/json',
        'X-Request-Id': 'abc123',
      });
    });

    it('should include response status', async () => {
      const transport = createFetchHttpTransport({ fetchImpl: mockFetch });
      const mockResponse = createMockResponse({}, 201);
      mockFetch.mockResolvedValue(mockResponse);

      const request: HttpRequest = {
        method: 'POST',
        url: 'https://api.test.com/users',
        body: {},
      };

      const result = await transport.request(request);

      expect(result.status).toBe(201);
    });
  });

  describe('AbortSignal', () => {
    it('should use provided signal', async () => {
      const transport = createFetchHttpTransport({ fetchImpl: mockFetch });
      const mockResponse = createMockResponse({});
      mockFetch.mockResolvedValue(mockResponse);

      const controller = new AbortController();
      const request: HttpRequest = {
        method: 'GET',
        url: 'https://api.test.com/users',
        signal: controller.signal,
      };

      await transport.request(request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: controller.signal,
        }),
      );
    });

    it('should handle request without signal', async () => {
      const transport = createFetchHttpTransport({ fetchImpl: mockFetch });
      const mockResponse = createMockResponse({});
      mockFetch.mockResolvedValue(mockResponse);

      const request: HttpRequest = {
        method: 'GET',
        url: 'https://api.test.com/users',
      };

      await transport.request(request);

      const callArgs = mockFetch.mock.calls[0][1];
      expect(callArgs.signal).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should throw error when fetch is not available', () => {
      // Create transport without providing fetchImpl and in an environment without global fetch
      const originalFetch = global.fetch;
      delete (global as any).fetch;

      expect(() => createFetchHttpTransport()).toThrow('Global fetch is not available');

      global.fetch = originalFetch;
    });

    it('should propagate fetch errors', async () => {
      const transport = createFetchHttpTransport({ fetchImpl: mockFetch });
      mockFetch.mockRejectedValue(new Error('Network error'));

      const request: HttpRequest = {
        method: 'GET',
        url: 'https://api.test.com/users',
      };

      await expect(transport.request(request)).rejects.toThrow('Network error');
    });
  });
});
