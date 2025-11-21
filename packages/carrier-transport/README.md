# @shopana/carrier-transport

Universal HTTP transport abstraction for carrier API clients (Nova Poshta, Meest, and others).

## Features

- 🌐 **Universal**: Works in browsers, Node.js 18+, and edge runtimes
- 🔌 **Transport Agnostic**: Easy to swap fetch/axios/custom implementations
- 🎯 **Type-Safe**: Full TypeScript support
- 🔄 **Retry Logic**: Built-in retry support with exponential backoff
- 🎣 **Interceptors**: Request/response/error interceptors
- ⏱️ **Timeout Support**: Configurable request timeouts
- 🚫 **Abort Support**: AbortController integration
- 🪶 **Lightweight**: Zero dependencies

## Installation

```bash
npm install @shopana/carrier-transport
```

## Usage

### Basic Usage with Fetch

```typescript
import { createFetchTransport } from '@shopana/carrier-transport';

const transport = createFetchTransport({
  baseUrl: 'https://api.example.com',
  defaultHeaders: {
    'Authorization': 'Bearer token',
  },
});

const response = await transport.request({
  method: 'POST',
  url: '/endpoint',
  body: { foo: 'bar' },
});

console.log(response.data);
```

### With Retry Logic

```typescript
const transport = createFetchTransport({
  baseUrl: 'https://api.example.com',
  retry: {
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  },
});
```

### With Interceptors

```typescript
const transport = createFetchTransport({
  interceptors: {
    request: async (request) => {
      console.log('Sending request:', request.url);
      return request;
    },
    response: async (response) => {
      console.log('Received response:', response.status);
      return response;
    },
    error: async (error) => {
      console.error('Request failed:', error);
      throw error;
    },
  },
});
```

### With Custom Fetch Implementation

```typescript
import nodeFetch from 'node-fetch';

const transport = createFetchTransport({
  fetchImpl: nodeFetch as any,
});
```

### Request Cancellation

```typescript
const controller = new AbortController();

const promise = transport.request({
  url: '/endpoint',
  signal: controller.signal,
});

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
  await promise;
} catch (error) {
  console.log('Request cancelled');
}
```

### Different Response Formats

```typescript
// JSON response (default)
const jsonResponse = await transport.request({
  url: '/data.json',
  responseType: 'json',
});

// Binary data
const binaryResponse = await transport.request({
  url: '/file.pdf',
  responseType: 'arraybuffer',
});

// Streaming
const streamResponse = await transport.request({
  url: '/large-file',
  responseType: 'stream',
});
```

## Using with Carrier Clients

### Nova Poshta

```typescript
import { createClient } from '@shopana/novaposhta-api-client';
import { createNovaPoshtaTransport } from '@shopana/novaposhta-api-client/adapters';
import { createFetchTransport } from '@shopana/carrier-transport';

const transport = createFetchTransport();
const novaPoshtaTransport = createNovaPoshtaTransport(transport);

const client = createClient({
  transport: novaPoshtaTransport,
  baseUrl: 'https://api.novaposhta.ua/v2.0/json/',
  apiKey: process.env.NP_API_KEY,
});
```

### Meest

```typescript
import { createClient } from '@shopana/meest-api-client';
import { createFetchTransport } from '@shopana/carrier-transport';

const transport = createFetchTransport();

const client = createClient({
  transport,
  token: process.env.MEEST_TOKEN,
});
```

## API

### `createFetchTransport(options?)`

Creates a fetch-based HTTP transport.

**Options:**
- `baseUrl?: string` - Base URL for all requests
- `defaultHeaders?: Record<string, string>` - Default headers for all requests
- `defaultTimeout?: number` - Default timeout in milliseconds
- `fetchImpl?: FetchLike` - Custom fetch implementation
- `retry?: RetryOptions` - Retry configuration
- `interceptors?: Interceptors` - Request/response/error interceptors

### `HttpTransport.request<T>(request: HttpRequest): Promise<HttpResponse<T>>`

Execute an HTTP request.

**Request Options:**
- `method?: HttpMethod` - HTTP method (default: POST)
- `url: string` - URL or path
- `headers?: Record<string, string>` - Request headers
- `body?: unknown` - Request body
- `responseType?: ResponseFormat` - Expected response format (default: json)
- `signal?: AbortSignal` - AbortSignal for cancellation
- `timeoutMs?: number` - Request timeout
- `query?: Record<string, any>` - Query parameters

**Response:**
- `status: number` - HTTP status code
- `statusText?: string` - HTTP status text
- `headers?: Record<string, string>` - Response headers
- `data: T` - Response data

## Testing

Mock transport for testing:

```typescript
import type { HttpTransport } from '@shopana/carrier-transport';

const mockTransport: HttpTransport = {
  request: async (request) => ({
    status: 200,
    data: { success: true },
  }),
};

const client = createClient({ transport: mockTransport });
```

## License

Apache-2.0
