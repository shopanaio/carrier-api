# Quick Start

Follow these steps to call Meest endpoints with the client.

## 1. Install dependencies

```bash
# Install both client and transport
npm install @shopana/meest-api-client @shopana/carrier-transport

# Or with yarn
yarn add @shopana/meest-api-client @shopana/carrier-transport
```

## 2. Regenerate DTOs (optional, for contributors)

```bash
yarn workspace @shopana/meest-api-client generate:types
```

Use this whenever `docs/openapi.json` is updated.

## 3. Configure a transport

```ts
import { createFetchTransport } from '@shopana/carrier-transport';

const transport = createFetchTransport({
  baseUrl: 'https://api.meest.com/v3.0/openAPI',
  defaultHeaders: {
    'User-Agent': 'shopana-meest-sdk/0.0.1',
  },
  // Optional: add retry logic
  retry: {
    maxRetries: 3,
    retryDelay: 1000,
  },
});
```

## 4. Create the client + attach services

```ts
import { createClient, AuthService, SearchService } from '@shopana/meest-api-client';

const client = createClient({
  transport,
  token: process.env.MEEST_TOKEN,
  onTokenChange: (token) => console.log('Token updated', token),
})
  .use(new AuthService())
  .use(new SearchService());
```

## 5. Authenticate (optional)

```ts
const tokens = await client.auth.login({ username: 'demo', password: 'secret' });
console.log('Session expires in', tokens.expiresIn, 'seconds');
```

## 6. Run a search query

```ts
const branches = await client.search.branchSearch({
  filters: {
    cityDescr: 'Київ',
    includeInboundRestriction: false,
  },
});
```

`branches` is fully typed (`BranchSearchResult`) so you get IntelliSense for nested descriptors, geo info, working hours, etc.

## 7. Handle tokens manually

```ts
client.auth.logout(); // clears stored token
await client.auth.refresh({ refreshToken: tokens.refresh_token });
```

That is all you need to call any of the Meest API blocks. Add the remaining services (parcels, registers, print, tracking, misc) to the client the same way once they land.
