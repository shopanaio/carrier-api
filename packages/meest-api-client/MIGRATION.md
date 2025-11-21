# Migration to Universal Transport

## Overview

Meest API client now supports the universal `@shopana/carrier-transport` package, which provides enhanced features and consistency across all carrier clients (Nova Poshta, Meest, and future integrations).

## Why Migrate?

The universal transport offers:

1. **Better Features**: Retry logic, interceptors, timeout support out of the box
2. **Consistency**: Same transport interface for Nova Poshta, Meest, and future carriers
3. **Flexibility**: Easy to swap implementations (fetch, axios, custom)
4. **Testing**: Built-in mock transport
5. **Active Development**: New features added to universal transport only

## Breaking Change

**IMPORTANT**: `createFetchHttpTransport` has been **completely removed** from `@shopana/meest-api-client`.

The transport is now provided by the separate `@shopana/carrier-transport` package, which is a **required peer dependency**.

## Migration Steps

### Step 1: Install Universal Transport

```bash
npm install @shopana/carrier-transport
# or
yarn add @shopana/carrier-transport
# or
pnpm add @shopana/carrier-transport
```

**Note:** This is now a **required** dependency. The package will not work without it.

### Step 2: Update Import

**Before (old code that will NOT work):**
```typescript
import { createClient, SearchService, createFetchHttpTransport } from '@shopana/meest-api-client';

const client = createClient({
  transport: createFetchHttpTransport(),
  token: process.env.MEEST_TOKEN,
});
```

**After (updated code):**
```typescript
import { createClient, SearchService } from '@shopana/meest-api-client';
import { createFetchTransport } from '@shopana/carrier-transport';

const client = createClient({
  transport: createFetchTransport({
    baseUrl: 'https://api.meest.com/v3.0/openAPI',
  }),
  token: process.env.MEEST_TOKEN,
});
```

### Step 3: Update Configuration (Optional)

Take advantage of new features:

```typescript
import { createFetchTransport } from '@shopana/carrier-transport';

const transport = createFetchTransport({
  baseUrl: 'https://api.meest.com/v3.0/openAPI',

  // Add retry logic
  retry: {
    maxRetries: 3,
    retryDelay: 1000,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  },

  // Add interceptors
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

  // Set default timeout
  defaultTimeout: 30000,
});

const client = createClient({
  transport,
  token: process.env.MEEST_TOKEN,
});
```

## API Compatibility

The `HttpTransport` interface is **100% compatible** between:
- `@shopana/meest-api-client` (old)
- `@shopana/carrier-transport` (new)

You can use any transport that implements the `HttpTransport` interface.

## Type Differences

The only minor difference is that `HttpRequest.method` is:
- **Old**: `HttpMethod` (required) - 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
- **New**: `HttpMethod` (optional, defaults to 'POST') - same values

This is fully backward compatible - if you pass `method`, it works the same way.

## Testing with Mock Transport

**Before** (custom mock):
```typescript
const mockTransport = {
  async request(req) {
    return { status: 200, data: { /* mock data */ } };
  },
};
```

**After** (built-in mock):
```typescript
import { createMockTransport } from '@shopana/carrier-transport';

const mockTransport = createMockTransport();

mockTransport
  .onRequest({ method: 'POST', url: /cities/ })
  .reply({
    status: 200,
    data: { /* mock data */ },
  });

// Check request log
const requests = mockTransport.getRequestLog();
expect(requests).toHaveLength(1);
```

## Custom Transport

If you have a custom transport implementation, it still works:

```typescript
import axios from 'axios';
import type { HttpTransport } from '@shopana/carrier-transport';

function createAxiosTransport(): HttpTransport {
  return {
    async request(req) {
      const response = await axios({
        method: req.method,
        url: req.url,
        data: req.body,
        headers: req.headers,
        signal: req.signal,
        timeout: req.timeoutMs,
      });

      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
      };
    },
  };
}

const client = createClient({
  transport: createAxiosTransport(),
  token: process.env.MEEST_TOKEN,
});
```

## Shared Transport Across Clients

Now you can use one transport for both Nova Poshta and Meest:

```typescript
import { createFetchTransport } from '@shopana/carrier-transport';
import { fromUniversalTransport } from '@shopana/novaposhta-api-client/adapters';
import { createClient as createNPClient } from '@shopana/novaposhta-api-client';
import { createClient as createMeestClient } from '@shopana/meest-api-client';

// Single transport with shared config
const baseTransport = createFetchTransport({
  retry: { maxRetries: 3, retryDelay: 1000 },
  interceptors: {
    request: async (req) => {
      console.log('Request:', req.method, req.url);
      return req;
    },
  },
});

// Nova Poshta client
const npClient = createNPClient({
  transport: fromUniversalTransport(baseTransport),
  baseUrl: 'https://api.novaposhta.ua/v2.0/json/',
  apiKey: process.env.NP_API_KEY,
});

// Meest client
const meestClient = createMeestClient({
  transport: baseTransport,
  baseUrl: 'https://api.meest.com/v3.0/openAPI',
  token: process.env.MEEST_TOKEN,
});
```

## Timeline

- **v0.0.1-alpha.0**: `createFetchHttpTransport` **completely removed**
- **Now**: Must use `@shopana/carrier-transport` (required peer dependency)
- **Going forward**: All transport features developed in carrier-transport package

## Questions?

If you have any issues with migration, please:
1. Check [carrier-transport README](https://github.com/shopanaio/carrier-api/tree/main/packages/carrier-transport)
2. Review [examples](https://github.com/shopanaio/carrier-api/tree/main/packages/carrier-transport/EXAMPLES.md)
3. Open an issue on GitHub

## Summary

✅ **Install**: `npm install @shopana/carrier-transport`
✅ **Import**: Change `createFetchHttpTransport` → `createFetchTransport`
✅ **Enhance**: Add retry, interceptors, timeouts as needed
✅ **Test**: Use built-in mock transport for testing

That's it! The migration is straightforward and brings many benefits.
