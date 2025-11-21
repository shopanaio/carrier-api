# Universal Carrier Transport Architecture

## Overview

`@shopana/carrier-transport` provides a universal HTTP transport abstraction that works across all carrier API clients (Nova Poshta, Meest, and future integrations). This document explains the architecture, design decisions, and integration patterns.

## Problem Statement

Different carrier APIs have different requirements:

- **Nova Poshta**: Simple POST-only API with JSON payloads
- **Meest**: RESTful API with multiple HTTP methods, different response formats
- **Future carriers**: Unknown requirements

Without a unified approach:
- Each client implements its own transport layer
- Hard to share transport implementations (fetch, axios, etc.)
- Difficult to add cross-cutting concerns (logging, retries, testing)
- Users must learn different patterns for each client

## Solution Architecture

### Three-Layer Architecture

```
┌─────────────────────────────────────────────────┐
│         Carrier API Clients                      │
│  (novaposhta-api-client, meest-api-client)      │
│                                                   │
│  Client-specific APIs, Services, Types           │
└───────────────┬─────────────────────────────────┘
                │
                │ Uses (via adapters)
                │
┌───────────────▼─────────────────────────────────┐
│      Universal Transport Layer                   │
│      (@shopana/carrier-transport)                │
│                                                   │
│  - HttpTransport interface                       │
│  - Fetch/Axios/Mock implementations              │
│  - Retry, timeout, interceptors                  │
└───────────────┬─────────────────────────────────┘
                │
                │ Built on top of
                │
┌───────────────▼─────────────────────────────────┐
│      HTTP Implementations                        │
│                                                   │
│  - fetch (browser/Node.js 18+)                   │
│  - axios, node-fetch, etc.                       │
│  - Custom implementations                         │
└─────────────────────────────────────────────────┘
```

### Core Components

#### 1. HttpTransport Interface

The universal transport interface that all implementations must follow:

```typescript
interface HttpTransport {
  request<T = unknown>(request: HttpRequest): Promise<HttpResponse<T>>;
}
```

This interface is:
- **Flexible**: Supports all HTTP methods, response types, and options
- **Simple**: Single method to implement
- **Testable**: Easy to mock and stub
- **Type-safe**: Full TypeScript support

#### 2. HttpRequest & HttpResponse

Universal request/response types that work for all carriers:

```typescript
interface HttpRequest {
  method?: HttpMethod;              // GET, POST, PUT, etc.
  url: string;                      // Full URL or path
  headers?: Record<string, string>;
  body?: unknown;
  responseType?: ResponseFormat;    // json, arraybuffer, etc.
  signal?: AbortSignal;             // Cancellation support
  timeoutMs?: number;
  query?: Record<string, any>;      // Query parameters
}

interface HttpResponse<T = unknown> {
  status: number;
  statusText?: string;
  headers?: Record<string, string>;
  data: T;
}
```

#### 3. Transport Implementations

**Fetch Transport** (`createFetchTransport`):
- Works in browsers and Node.js 18+
- Zero dependencies
- Full feature support

**Mock Transport** (`createMockTransport`):
- For testing
- Request matching and logging
- Configurable responses

**Custom Transports**:
- Users can implement axios, node-fetch, or any HTTP client
- Just implement the `HttpTransport` interface

#### 4. Adapters

Adapters convert between client-specific formats and universal transport:

**Nova Poshta Adapter** (`fromUniversalTransport`):
```typescript
// Nova Poshta uses simple POST JSON
type NovaPoshtaTransport = <TReq, TRes>(args: {
  url: string;
  body: TReq;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}) => Promise<{ status: number; data: TRes }>;

// Adapter converts universal → Nova Poshta format
function fromUniversalTransport(
  transport: HttpTransport
): NovaPoshtaTransport;
```

**Meest Integration**:
- Meest already uses `HttpTransport` interface
- No adapter needed
- Direct compatibility

## Design Decisions

### 1. Single `request()` Method

**Decision**: Use one method instead of separate `get()`, `post()`, etc.

**Rationale**:
- Simpler interface to implement
- All HTTP methods supported via `method` parameter
- Easier to add middleware/interceptors
- Consistent error handling

### 2. Optional `method` Parameter

**Decision**: Make `method` optional, default to `POST`

**Rationale**:
- Nova Poshta only uses POST
- Common case is POST with JSON
- Still supports all methods when needed

### 3. Flexible Body Type

**Decision**: Accept `unknown` for body, handle serialization internally

**Rationale**:
- Supports JSON objects, FormData, strings, binary data
- Transport handles JSON.stringify when appropriate
- Type safety maintained via generics

### 4. Adapter Pattern

**Decision**: Use adapters instead of modifying clients

**Rationale**:
- Clients maintain their existing APIs
- Backward compatibility preserved
- Users can gradually migrate
- Each client can optimize for its use case

### 5. Feature-Rich Base Transport

**Decision**: Include retry, timeout, interceptors in base transport

**Rationale**:
- Common needs across all carriers
- Avoid reimplementing in each client
- Opt-in: disabled by default
- Composable: can be layered

## Integration Patterns

### Pattern 1: Direct Usage (Meest)

Meest client directly accepts universal transport:

```typescript
import { createClient } from '@shopana/meest-api-client';
import { createFetchTransport } from '@shopana/carrier-transport';

const client = createClient({
  transport: createFetchTransport(),
  token: 'xxx',
});
```

### Pattern 2: Adapter Usage (Nova Poshta)

Nova Poshta uses an adapter:

```typescript
import { createClient } from '@shopana/novaposhta-api-client';
import { fromUniversalTransport } from '@shopana/novaposhta-api-client/adapters';
import { createFetchTransport } from '@shopana/carrier-transport';

const transport = createFetchTransport();

const client = createClient({
  transport: fromUniversalTransport(transport),
  apiKey: 'xxx',
});
```

### Pattern 3: Shared Transport

One transport for multiple clients:

```typescript
const baseTransport = createFetchTransport({
  retry: { maxRetries: 3, retryDelay: 1000 },
  interceptors: {
    request: async (req) => {
      console.log('Request:', req.url);
      return req;
    },
  },
});

const npClient = createNPClient({
  transport: fromUniversalTransport(baseTransport),
});

const meestClient = createMeestClient({
  transport: baseTransport,
});
```

## Extension Points

### 1. Custom Transport

Implement `HttpTransport` interface:

```typescript
const customTransport: HttpTransport = {
  async request(request) {
    // Your implementation
    return { status: 200, data: {} };
  },
};
```

### 2. Interceptors

Add request/response/error interceptors:

```typescript
const transport = createFetchTransport({
  interceptors: {
    request: async (req) => {
      // Modify request
      return req;
    },
    response: async (res) => {
      // Modify response
      return res;
    },
    error: async (err) => {
      // Handle errors
      throw err;
    },
  },
});
```

### 3. Transport Wrapper

Wrap any transport to add behavior:

```typescript
function withLogging(transport: HttpTransport): HttpTransport {
  return {
    async request(req) {
      console.log('→', req.method, req.url);
      const res = await transport.request(req);
      console.log('←', res.status);
      return res;
    },
  };
}

const transport = withLogging(createFetchTransport());
```

## Testing Strategy

### Unit Tests

Mock transport for isolated testing:

```typescript
const mock = createMockTransport();
mock.onRequest({ url: '/api' }).reply({ status: 200, data: {} });

const client = createClient({ transport: mock });
const result = await client.someMethod();

expect(mock.getRequestLog()).toHaveLength(1);
```

### Integration Tests

Use real transport with test API:

```typescript
const transport = createFetchTransport({
  baseUrl: 'https://test-api.example.com',
});

const client = createClient({ transport });
// Test against real API
```

## Future Enhancements

### 1. Metrics & Observability

```typescript
const transport = createFetchTransport({
  metrics: {
    onRequest: (req) => metrics.increment('http.requests'),
    onResponse: (res) => metrics.timing('http.latency', res.duration),
  },
});
```

### 2. Caching Layer

```typescript
const transport = createFetchTransport({
  cache: {
    enabled: true,
    ttl: 300000, // 5 minutes
    key: (req) => `${req.method}:${req.url}`,
  },
});
```

### 3. Rate Limiting

```typescript
const transport = createFetchTransport({
  rateLimit: {
    maxRequests: 10,
    perSeconds: 1,
  },
});
```

### 4. Request Batching

```typescript
const transport = createFetchTransport({
  batching: {
    enabled: true,
    maxBatchSize: 10,
    flushInterval: 100,
  },
});
```

## Migration Guide

### Existing Nova Poshta Users

**Before**:
```typescript
import { createFetchHttpTransport } from '@shopana/novaposhta-transport-fetch';

const client = createClient({
  transport: createFetchHttpTransport(),
  apiKey: 'xxx',
});
```

**After**:
```typescript
import { createFetchTransport } from '@shopana/carrier-transport';
import { fromUniversalTransport } from '@shopana/novaposhta-api-client/adapters';

const transport = fromUniversalTransport(createFetchTransport());

const client = createClient({
  transport,
  apiKey: 'xxx',
});
```

### Existing Meest Users

No changes needed - already compatible!

## Performance Considerations

### Bundle Size

- Core transport: ~2KB gzipped
- Fetch implementation: ~1KB gzipped
- Mock transport: ~1KB gzipped
- Total: ~4KB for basic usage

### Runtime Overhead

- Adapter overhead: negligible (<1ms per request)
- Retry logic: only when configured
- Interceptors: executed in order, minimal overhead

### Tree Shaking

All exports are tree-shakeable:

```typescript
// Only imports what you use
import { createFetchTransport } from '@shopana/carrier-transport';
// Mock transport not included in bundle
```

## Conclusion

The universal transport architecture provides:

1. **Unified Interface**: One transport works for all carriers
2. **Flexibility**: Easy to swap implementations
3. **Extensibility**: Interceptors, retry, timeout, etc.
4. **Testability**: Built-in mocking support
5. **Type Safety**: Full TypeScript support
6. **Zero Lock-in**: Clients can opt-in gradually

This architecture allows the carrier-api ecosystem to grow while maintaining consistency and ease of use.
