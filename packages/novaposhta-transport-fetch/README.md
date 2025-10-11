# @shopana/novaposhta-transport-fetch

A fetch-based HTTP transport implementation for `@shopana/novaposhta-api-client`. Uses `cross-fetch` for compatibility across Node.js and browser environments.

## Installation

```bash
yarn add @shopana/novaposhta-transport-fetch
# or
npm i @shopana/novaposhta-transport-fetch
```

## Usage

```ts
import { createClient } from '@shopana/novaposhta-api-client';
import { createFetchHttpTransport } from '@shopana/novaposhta-transport-fetch';

const client = createClient({
  transport: createFetchHttpTransport(),
  baseUrl: 'https://api.novaposhta.ua/v2.0/json/',
  apiKey: process.env.NP_API_KEY,
});
```

## Configuration

### Custom fetch implementation

You can provide your own fetch implementation (e.g., `node-fetch`, `undici`, or a custom wrapper):

```ts
import nodeFetch from 'node-fetch';

const transport = createFetchHttpTransport({
  fetchImpl: nodeFetch as unknown as typeof fetch,
});
```

### Custom headers

Add custom headers to all requests:

```ts
const transport = createFetchHttpTransport({
  baseHeaders: {
    'X-Custom-Header': 'value',
    'User-Agent': 'MyApp/1.0',
  },
});
```

### Full configuration example

```ts
const transport = createFetchHttpTransport({
  fetchImpl: customFetch,
  baseHeaders: {
    'X-Custom-Header': 'value',
  },
});

const client = createClient({
  transport,
  baseUrl: 'https://api.novaposhta.ua/v2.0/json/',
});
```

## Features

- **Cross-platform**: Works in Node.js and browsers via `cross-fetch`
- **Configurable**: Custom fetch implementation and headers support
- **Type-safe**: Fully typed with TypeScript
- **Lightweight**: Minimal dependencies
- **AbortSignal support**: Request cancellation out of the box

## Transport Interface

The transport implements the following interface:

```ts
type HttpTransport = <TReq, TRes>(args: {
  url: string;
  body: TReq;
  signal?: AbortSignal;
}) => Promise<{ status: number; data: TRes }>;
```

## Supported Environment

- Node.js 14+
- Modern browsers with fetch API
- Legacy environments via `cross-fetch` polyfill
