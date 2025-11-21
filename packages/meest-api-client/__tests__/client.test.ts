import { createClient, DEFAULT_BASE_URL } from '../src/core/client';
import type { ClientContext, PluggableNamedService } from '../src/core/client';
import type { HttpTransport, HttpRequest, HttpResponse } from '../src/http/transport';
import { BaseService } from '../src/services/baseService';

describe('createClient', () => {
  let mockTransport: jest.Mocked<HttpTransport>;

  beforeEach(() => {
    mockTransport = {
      request: jest.fn(),
    };
  });

  describe('Client creation', () => {
    it('should create client with required transport', () => {
      const client = createClient({ transport: mockTransport });
      expect(client).toBeDefined();
      expect(typeof client.use).toBe('function');
    });

    it('should throw error if transport is not provided', () => {
      expect(() => createClient({} as any)).toThrow('Meest client requires a transport implementation');
    });

    it('should use default base URL if not provided', () => {
      const client = createClient({ transport: mockTransport });
      expect(DEFAULT_BASE_URL).toBe('https://api.meest.com/v3.0/openAPI');
    });

    it('should use custom base URL if provided', () => {
      const customUrl = 'https://custom.api.com';
      const client = createClient({
        transport: mockTransport,
        baseUrl: customUrl,
      });
      expect(client).toBeDefined();
    });

    it('should accept initial token', () => {
      const client = createClient({
        transport: mockTransport,
        token: 'initial-token',
      });
      expect(client).toBeDefined();
    });

    it('should accept default headers', () => {
      const client = createClient({
        transport: mockTransport,
        defaultHeaders: { 'X-Custom': 'value' },
      });
      expect(client).toBeDefined();
    });

    it('should accept onTokenChange callback', () => {
      const onTokenChange = jest.fn();
      const client = createClient({
        transport: mockTransport,
        onTokenChange,
      });
      expect(client).toBeDefined();
    });
  });

  describe('Service registration', () => {
    class TestService extends BaseService {
      readonly namespace = 'test' as const;

      async getData() {
        return this.send({
          method: 'GET',
          path: '/test',
        });
      }
    }

    it('should register service via .use()', () => {
      const client = createClient({ transport: mockTransport });
      const service = new TestService();
      const clientWithService = client.use(service);

      expect(clientWithService.test).toBeDefined();
      expect(clientWithService.test).toBe(service);
    });

    it('should call attach() on service', () => {
      const client = createClient({ transport: mockTransport });
      const service = new TestService();
      const attachSpy = jest.spyOn(service, 'attach');

      client.use(service);

      expect(attachSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          transport: mockTransport,
          requestBuilder: expect.any(Object),
          tokenManager: expect.any(Object),
        }),
      );
    });

    it('should throw error if service has no namespace', () => {
      const client = createClient({ transport: mockTransport });
      const invalidService = {} as any;

      expect(() => client.use(invalidService)).toThrow('Service must provide a namespace');
    });

    it('should throw error if namespace is already registered', () => {
      const client = createClient({ transport: mockTransport });
      const service1 = new TestService();
      const service2 = new TestService();

      client.use(service1);

      expect(() => client.use(service2)).toThrow('Namespace already installed on client: test');
    });

    it('should allow chaining multiple services', () => {
      class Service1 extends BaseService {
        readonly namespace = 'service1' as const;
      }

      class Service2 extends BaseService {
        readonly namespace = 'service2' as const;
      }

      const client = createClient({ transport: mockTransport });
      const result = client.use(new Service1()).use(new Service2());

      expect(result.service1).toBeDefined();
      expect(result.service2).toBeDefined();
    });

    it('should maintain type safety with multiple services', () => {
      class AuthService extends BaseService {
        readonly namespace = 'auth' as const;
        async login() {
          return { token: 'abc' };
        }
      }

      class UserService extends BaseService {
        readonly namespace = 'users' as const;
        async getUser() {
          return { id: '1' };
        }
      }

      const client = createClient({ transport: mockTransport })
        .use(new AuthService())
        .use(new UserService());

      // Type check - these should be accessible
      expect(typeof client.auth.login).toBe('function');
      expect(typeof client.users.getUser).toBe('function');
    });
  });

  describe('Service context', () => {
    class ContextTestService extends BaseService {
      readonly namespace = 'contextTest' as const;

      getContext(): ClientContext {
        return {
          transport: this.transport,
          requestBuilder: this.requestBuilder,
          tokenManager: this.tokenManager,
        };
      }
    }

    it('should provide transport to service', () => {
      const client = createClient({ transport: mockTransport });
      const service = new ContextTestService();
      client.use(service);

      const context = service.getContext();
      expect(context.transport).toBe(mockTransport);
    });

    it('should provide requestBuilder to service', () => {
      const client = createClient({ transport: mockTransport });
      const service = new ContextTestService();
      client.use(service);

      const context = service.getContext();
      expect(context.requestBuilder).toBeDefined();
      expect(typeof context.requestBuilder.build).toBe('function');
    });

    it('should provide tokenManager to service', () => {
      const client = createClient({ transport: mockTransport, token: 'test-token' });
      const service = new ContextTestService();
      client.use(service);

      const context = service.getContext();
      expect(context.tokenManager).toBeDefined();
      expect(context.tokenManager.getToken()).toBe('test-token');
    });

    it('should share tokenManager across services', () => {
      class Service1 extends BaseService {
        readonly namespace = 'service1' as const;
        setToken(token: string) {
          this.tokenManager.setToken(token);
        }
      }

      class Service2 extends BaseService {
        readonly namespace = 'service2' as const;
        getToken() {
          return this.tokenManager.getToken();
        }
      }

      const client = createClient({ transport: mockTransport })
        .use(new Service1())
        .use(new Service2());

      client.service1.setToken('shared-token');
      expect(client.service2.getToken()).toBe('shared-token');
    });
  });

  describe('Token management', () => {
    it('should notify onTokenChange when token is set', () => {
      const onTokenChange = jest.fn();
      const client = createClient({
        transport: mockTransport,
        onTokenChange,
      });

      class TokenService extends BaseService {
        readonly namespace = 'token' as const;
        updateToken(token: string) {
          this.tokenManager.setToken(token);
        }
      }

      const tokenService = new TokenService();
      client.use(tokenService);
      tokenService.updateToken('new-token');

      expect(onTokenChange).toHaveBeenCalledWith('new-token');
    });

    it('should notify onTokenChange when token is cleared', () => {
      const onTokenChange = jest.fn();
      const client = createClient({
        transport: mockTransport,
        token: 'initial',
        onTokenChange,
      });

      class TokenService extends BaseService {
        readonly namespace = 'token' as const;
        clearToken() {
          this.tokenManager.clearToken();
        }
      }

      const tokenService = new TokenService();
      client.use(tokenService);
      tokenService.clearToken();

      expect(onTokenChange).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Service without attach method', () => {
    it('should handle service without attach method', () => {
      const client = createClient({ transport: mockTransport });
      const service: PluggableNamedService = {
        namespace: 'simple' as const,
      };

      const result = client.use(service);
      expect(result.simple).toBe(service);
    });
  });

  describe('Integration with real services', () => {
    it('should work with services that make requests', async () => {
      mockTransport.request.mockResolvedValue({
        status: 200,
        data: { status: 'OK', result: { id: '123' } },
      });

      class DataService extends BaseService {
        readonly namespace = 'data' as const;

        async fetchData() {
          return this.send<{ id: string }>({
            method: 'GET',
            path: '/data',
          });
        }
      }

      const client = createClient({
        transport: mockTransport,
        token: 'test-token',
      });

      const service = new DataService();
      client.use(service);

      const result = await service.fetchData();

      expect(result).toEqual({ id: '123' });
      expect(mockTransport.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: expect.stringContaining('/data'),
          headers: expect.objectContaining({
            token: 'test-token',
          }),
        }),
      );
    });
  });
});
