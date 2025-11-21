# Transport Implementations Comparison

## Overview

This document compares the transport implementations across the carrier-api ecosystem.

## Transport Implementations

| Feature | meest-api-client (old) | carrier-transport (new) | novaposhta-api-client |
|---------|------------------------|-------------------------|------------------------|
| **Interface** | `HttpTransport` | `HttpTransport` | `HttpPostJsonTransport` (adapter available) |
| **Fetch Support** | ✅ `createFetchHttpTransport` | ✅ `createFetchTransport` | Via adapter |
| **HTTP Methods** | GET, POST, PUT, PATCH, DELETE | GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS | POST only |
| **Retry Logic** | ❌ | ✅ Built-in | ❌ |
| **Interceptors** | ❌ | ✅ Request/Response/Error | ❌ |
| **Timeout** | Basic (AbortController) | ✅ Built-in + AbortController | Basic |
| **Mock Transport** | Manual | ✅ Built-in with request matching | Manual |
| **Response Types** | json, arraybuffer, stream | json, text, arraybuffer, blob, stream | json only |
| **Query Params** | Manual | ✅ Auto-append | Manual |
| **Base URL** | Manual | ✅ Auto-resolve | Manual |
| **Bundle Size** | ~1KB | ~4KB (with all features) | N/A (uses external) |
| **Dependencies** | Zero | Zero | Zero |
| **Status** | ⚠️ Deprecated | ✅ Active | ✅ Active (with adapter) |

## Interface Compatibility

### HttpTransport Interface

Both old and new transports use compatible `HttpTransport` interfaces:

```typescript
interface HttpTransport {
  request<T = unknown>(request: HttpRequest): Promise<HttpResponse<T>>;
}
```

**Key differences:**

| Property | meest-api-client | carrier-transport |
|----------|------------------|-------------------|
| `HttpRequest.method` | Required | Optional (defaults to 'POST') |
| `HttpRequest.query` | ❌ Not available | ✅ Available |
| `HttpResponse.statusText` | ❌ Not available | ✅ Available |

Despite these differences, the interfaces are **100% compatible** for typical usage.

## Feature Comparison

### 1. Retry Logic

**Old (meest-api-client):**
```typescript
// Not available - must implement manually
```

**New (carrier-transport):**
```typescript
const transport = createFetchTransport({
  retry: {
    maxRetries: 3,
    retryDelay: 1000,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  },
});
```

### 2. Interceptors

**Old (meest-api-client):**
```typescript
// Not available - must wrap transport manually
```

**New (carrier-transport):**
```typescript
const transport = createFetchTransport({
  interceptors: {
    request: async (req) => {
      console.log('→', req.method, req.url);
      return req;
    },
    response: async (res) => {
      console.log('←', res.status);
      return res;
    },
    error: async (err) => {
      console.error('Error:', err);
      throw err;
    },
  },
});
```

### 3. Testing

**Old (meest-api-client):**
```typescript
const mockTransport = {
  async request(req) {
    return { status: 200, data: {} };
  },
};
```

**New (carrier-transport):**
```typescript
import { createMockTransport } from '@shopana/carrier-transport';

const mock = createMockTransport();
mock.onRequest({ url: /cities/ }).reply({ status: 200, data: {} });

// Check logs
const requests = mock.getRequestLog();
```

### 4. Base URL Resolution

**Old (meest-api-client):**
```typescript
// Must provide full URLs
await transport.request({
  url: 'https://api.meest.com/v3.0/openAPI/cities',
});
```

**New (carrier-transport):**
```typescript
const transport = createFetchTransport({
  baseUrl: 'https://api.meest.com/v3.0/openAPI',
});

// Auto-resolves relative URLs
await transport.request({
  url: '/cities', // → https://api.meest.com/v3.0/openAPI/cities
});
```

### 5. Query Parameters

**Old (meest-api-client):**
```typescript
// Must build URL manually
await transport.request({
  url: 'https://api.meest.com/cities?limit=10&page=1',
});
```

**New (carrier-transport):**
```typescript
await transport.request({
  url: '/cities',
  query: { limit: 10, page: 1 }, // Auto-appended
});
```

## Migration Path

### For Meest Users

```typescript
// Old
import { createFetchHttpTransport } from '@shopana/meest-api-client';
const transport = createFetchHttpTransport();

// New
import { createFetchTransport } from '@shopana/carrier-transport';
const transport = createFetchTransport({
  baseUrl: 'https://api.meest.com/v3.0/openAPI',
});
```

### For Nova Poshta Users

```typescript
// Old
import { createFetchHttpTransport } from '@shopana/novaposhta-transport-fetch';
const transport = createFetchHttpTransport();

// New
import { createFetchTransport } from '@shopana/carrier-transport';
import { fromUniversalTransport } from '@shopana/novaposhta-api-client/adapters';

const transport = fromUniversalTransport(
  createFetchTransport({
    baseUrl: 'https://api.novaposhta.ua/v2.0/json/',
  })
);
```

## Performance Impact

| Metric | meest-api-client | carrier-transport | Difference |
|--------|------------------|-------------------|------------|
| Bundle Size | ~1KB | ~4KB | +3KB for all features |
| Request Overhead | ~0ms | <1ms | Negligible |
| Memory Usage | Minimal | Minimal | Same |
| Startup Time | <1ms | <1ms | Same |

**Note**: The extra 3KB includes:
- Retry logic with exponential backoff
- Interceptor system
- Mock transport for testing
- URL resolution and query param handling

Tree-shaking will remove unused features.

## Recommendations

### When to Use Universal Transport

✅ **Use `@shopana/carrier-transport`** if you need:
- Retry logic
- Request/response interceptors
- Built-in testing support
- Multiple carrier clients in one project
- Consistent interface across all carriers
- Future-proof solution

### When to Keep Old Transport

⚠️ **Keep old transport** only if:
- You have a very simple use case
- Bundle size is critical (need <1KB)
- No plan to use multiple carriers

**But note**: Old transport is deprecated and will be removed in future versions.

## Cross-Client Compatibility

The universal transport works seamlessly across all carrier clients:

```typescript
import { createFetchTransport } from '@shopana/carrier-transport';
import { fromUniversalTransport } from '@shopana/novaposhta-api-client/adapters';
import { createClient as createNPClient } from '@shopana/novaposhta-api-client';
import { createClient as createMeestClient } from '@shopana/meest-api-client';

// One transport, multiple clients
const baseTransport = createFetchTransport({
  retry: { maxRetries: 3, retryDelay: 1000 },
});

const npClient = createNPClient({
  transport: fromUniversalTransport(baseTransport),
  apiKey: process.env.NP_API_KEY,
});

const meestClient = createMeestClient({
  transport: baseTransport,
  token: process.env.MEEST_TOKEN,
});
```

## Conclusion

The universal transport (`@shopana/carrier-transport`) is the **recommended choice** for all new projects and migrations. It provides:

1. **Consistency**: Same interface for all carriers
2. **Features**: Retry, interceptors, testing built-in
3. **Flexibility**: Easy to extend and customize
4. **Future-proof**: All new features added here

Old transport implementations are maintained for backward compatibility but will be removed in future major versions.
