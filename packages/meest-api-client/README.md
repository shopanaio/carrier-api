# @shopana/meest-api-client

Typed, plugin-style client for the official [Meest open API](https://api.meest.com/v3.0/openAPI). The package mirrors the architecture of `@shopana/novaposhta-api-client`: a lightweight core `createClient` factory, pluggable namespaces, transport abstraction, and first-class TypeScript DTOs generated from the bundled Swagger document.

> **Status**: Phase 2 in progress (core infrastructure + authentication + search domains). Parcels, registers, print, tracking, and misc services are tracked for the next phases.

## Features

- Familiar `.use(new Service())` composition shared with the Nova Poshta client.
- Transport-agnostic HTTP layer (`HttpTransport`) with a default fetch helper and token-aware request builder.
- Auto-generated request/response DTOs derived from `docs/openapi.json` (`node scripts/generate-types.js`).
- Token manager with callbacks + helpers for manual refresh flows.
- Coverage (so far) for the authentication and search Swagger tags, including every filter and response field.

## Installation

```bash
# Install the client and transport
npm install @shopana/meest-api-client @shopana/carrier-transport

# Or with yarn
yarn add @shopana/meest-api-client @shopana/carrier-transport

# Or with pnpm
pnpm add @shopana/meest-api-client @shopana/carrier-transport
```

**Note:** The transport package is a peer dependency and must be installed separately.

## Usage

```ts
import { createClient, AuthService, SearchService } from '@shopana/meest-api-client';
import { createFetchTransport } from '@shopana/carrier-transport';

const client = createClient({
  transport: createFetchTransport({
    baseUrl: 'https://api.meest.com/v3.0/openAPI',
  }),
  token: process.env.MEEST_TOKEN,
});

client
  .use(new AuthService())
  .use(new SearchService());

async function bootstrap() {
  if (!process.env.MEEST_TOKEN) {
    const auth = await client.auth.login({ username: 'demo', password: 'secret' });
    console.log('Token expires in', auth.expiresIn);
  }

  const cities = await client.search.citySearch({
    filters: { cityDescr: 'Львів' },
    isDirectory: false,
  });
  console.log('Found', cities.length, 'cities');
}
```

### Transport

The client uses the universal `HttpTransport` interface from `@shopana/carrier-transport`, which provides:

- ✅ Fetch-based transport (works in browsers, Node.js 18+, and edge runtimes)
- ✅ Built-in retry logic
- ✅ Request/response interceptors
- ✅ Timeout support
- ✅ Mock transport for testing
- ✅ Compatible with custom implementations (axios, etc.)

```bash
npm install @shopana/carrier-transport
```

**Advanced features:**

```ts
import { createFetchTransport } from '@shopana/carrier-transport';

const transport = createFetchTransport({
  baseUrl: 'https://api.meest.com/v3.0/openAPI',
  retry: {
    maxRetries: 3,
    retryDelay: 1000,
  },
  interceptors: {
    request: async (req) => {
      // Add authentication
      return {
        ...req,
        headers: {
          ...req.headers,
          Authorization: `Bearer ${token}`,
        },
      };
    },
  },
});
```

**Backward compatibility:**

The built-in `createFetchHttpTransport` is still available but deprecated. It's recommended to migrate to `@shopana/carrier-transport` for better features and consistency across all carrier clients.

### Regenerating DTOs

```bash
yarn workspace @shopana/meest-api-client generate:types
```

The command parses `docs/openapi.json` and emits strongly typed request/response contracts under `src/types/generated.ts`. Manual edits will be overwritten.

## Roadmap

1. **Phase 3** – Parcels + register services with enums and tariff helpers.
2. **Phase 4** – Print + tracking namespaces with binary payload support.
3. **Phase 5** – Misc endpoints, documentation polish, production transport package.

Feel free to open an issue/PR if you need a specific endpoint prioritised.
