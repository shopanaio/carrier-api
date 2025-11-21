# Usage Examples

## Basic Usage

### With Nova Poshta

```typescript
import { createClient, AddressService } from '@shopana/novaposhta-api-client';
import { fromUniversalTransport } from '@shopana/novaposhta-api-client/adapters';
import { createFetchTransport } from '@shopana/carrier-transport';

// Create universal transport
const transport = createFetchTransport({
  baseUrl: 'https://api.novaposhta.ua/v2.0/json/',
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
});

// Convert to Nova Poshta format
const npTransport = fromUniversalTransport(transport);

// Create client
const client = createClient({
  transport: npTransport,
  baseUrl: 'https://api.novaposhta.ua/v2.0/json/',
  apiKey: process.env.NP_API_KEY,
}).use(new AddressService());

// Use client
const cities = await client.address.searchCities({
  FindByString: 'Kyiv',
  Limit: 10,
});
```

### With Meest

```typescript
import { createClient, SearchService } from '@shopana/meest-api-client';
import { createFetchTransport } from '@shopana/carrier-transport';

// Meest client directly accepts universal transport
const transport = createFetchTransport({
  baseUrl: 'https://api.meest.com/v3.0/openAPI',
  defaultHeaders: {
    'Authorization': `Bearer ${process.env.MEEST_TOKEN}`,
  },
});

const client = createClient({
  transport,
  token: process.env.MEEST_TOKEN,
}).use(new SearchService());

const cities = await client.search.citySearch({
  filters: { cityDescr: 'Львів' },
  isDirectory: false,
});
```

## Advanced Features

### With Retry Logic

```typescript
import { createFetchTransport } from '@shopana/carrier-transport';

const transport = createFetchTransport({
  baseUrl: 'https://api.example.com',
  retry: {
    maxRetries: 3,
    retryDelay: 1000,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  },
});
```

### With Interceptors

```typescript
import { createFetchTransport } from '@shopana/carrier-transport';

const transport = createFetchTransport({
  baseUrl: 'https://api.example.com',
  interceptors: {
    request: async (request) => {
      console.log('Sending request:', request.url);
      // Add authentication token
      return {
        ...request,
        headers: {
          ...request.headers,
          'Authorization': `Bearer ${getToken()}`,
        },
      };
    },
    response: async (response) => {
      console.log('Response status:', response.status);
      return response;
    },
    error: async (error) => {
      console.error('Request failed:', error);
      // Handle token refresh on 401
      if (error.status === 401) {
        await refreshToken();
      }
      throw error;
    },
  },
});
```

### With Custom Timeout

```typescript
const transport = createFetchTransport({
  baseUrl: 'https://api.example.com',
  defaultTimeout: 30000, // 30 seconds
});

// Or per-request
await transport.request({
  url: '/slow-endpoint',
  timeoutMs: 60000, // 60 seconds for this request
});
```

### Request Cancellation

```typescript
const controller = new AbortController();

const promise = transport.request({
  url: '/endpoint',
  body: { foo: 'bar' },
  signal: controller.signal,
});

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
  await promise;
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Request cancelled');
  }
}
```

## Testing with Mock Transport

```typescript
import { createMockTransport } from '@shopana/carrier-transport';

const mockTransport = createMockTransport();

// Setup mock responses
mockTransport
  .onRequest({ method: 'POST', url: '/api/cities' })
  .reply({
    status: 200,
    data: {
      success: true,
      data: [{ Ref: 'city-1', Description: 'Kyiv' }],
    },
  });

// Use with client
const client = createClient({
  transport: fromUniversalTransport(mockTransport),
  baseUrl: 'https://api.example.com',
});

// Test
const result = await client.address.searchCities({
  FindByString: 'Kyiv',
});

expect(result.data).toHaveLength(1);

// Check request log
const requests = mockTransport.getRequestLog();
expect(requests).toHaveLength(1);
expect(requests[0].url).toBe('/api/cities');
```

## Custom Transport Implementation

### Using Axios

```typescript
import axios from 'axios';
import type { HttpTransport } from '@shopana/carrier-transport';

function createAxiosTransport(config = {}): HttpTransport {
  const instance = axios.create(config);

  return {
    async request(request) {
      const response = await instance.request({
        method: request.method ?? 'POST',
        url: request.url,
        headers: request.headers,
        data: request.body,
        params: request.query,
        signal: request.signal,
        timeout: request.timeoutMs,
        responseType: request.responseType === 'arraybuffer' ? 'arraybuffer' : 'json',
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

// Use with Nova Poshta
const transport = createAxiosTransport({
  baseURL: 'https://api.novaposhta.ua/v2.0/json/',
});

const client = createClient({
  transport: fromUniversalTransport(transport),
  apiKey: process.env.NP_API_KEY,
});
```

### Using React Query

```typescript
import { useMutation } from '@tanstack/react-query';
import { createFetchTransport } from '@shopana/carrier-transport';

const transport = createFetchTransport({
  baseUrl: 'https://api.novaposhta.ua/v2.0/json/',
});

function useTrackDocument() {
  return useMutation({
    mutationFn: async (trackingNumber: string) => {
      const response = await transport.request({
        method: 'POST',
        url: '',
        body: {
          apiKey: process.env.NP_API_KEY,
          modelName: 'TrackingDocument',
          calledMethod: 'getStatusDocuments',
          methodProperties: {
            Documents: [{ DocumentNumber: trackingNumber }],
          },
        },
      });
      return response.data;
    },
  });
}
```

## Shared Transport for Multiple Clients

```typescript
import { createFetchTransport } from '@shopana/carrier-transport';
import { fromUniversalTransport } from '@shopana/novaposhta-api-client/adapters';
import { createClient as createNPClient } from '@shopana/novaposhta-api-client';
import { createClient as createMeestClient } from '@shopana/meest-api-client';

// Single transport with shared configuration
const baseTransport = createFetchTransport({
  retry: {
    maxRetries: 3,
    retryDelay: 1000,
  },
  interceptors: {
    request: async (request) => {
      // Shared logging
      console.log('Request:', request.method, request.url);
      return request;
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

## Environment-Specific Configuration

```typescript
import { createFetchTransport } from '@shopana/carrier-transport';

const isDev = process.env.NODE_ENV === 'development';

const transport = createFetchTransport({
  baseUrl: isDev
    ? 'https://api-dev.example.com'
    : 'https://api.example.com',
  defaultTimeout: isDev ? 60000 : 30000,
  interceptors: {
    request: isDev
      ? async (req) => {
          console.log('DEV REQUEST:', req);
          return req;
        }
      : undefined,
  },
});
```
