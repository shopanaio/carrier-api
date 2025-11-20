# @shopana/carrier-api

A monorepo containing type-safe API clients for various shipping carriers. Each carrier client features plugin architecture, full TypeScript support, and transport-agnostic design.

## Packages

### Carrier API Clients

#### [@shopana/novaposhta-api-client](./packages/novaposhta-api-client)

[![npm version](https://img.shields.io/npm/v/@shopana/novaposhta-api-client.svg)](https://www.npmjs.com/package/@shopana/novaposhta-api-client)

Type-safe Nova Poshta API client with plugin architecture. Features:

- **Plugin-based services**: Address, Reference, Tracking, and Waybill services
- **Namespaced API**: Clean API like `client.address.*`, `client.reference.*`, etc.
- **Type-safe**: Full TypeScript support with strict typing
- **Transport-agnostic**: Inject any HTTP transport implementation
- **Tree-shakeable**: Only bundle the services you use

```bash
npm i @shopana/novaposhta-api-client @shopana/novaposhta-transport-fetch
```

[Read more →](./packages/novaposhta-api-client/README.md)

### Transport Implementations

#### [@shopana/novaposhta-transport-fetch](./packages/novaposhta-transport-fetch)

[![npm version](https://img.shields.io/npm/v/@shopana/novaposhta-transport-fetch.svg)](https://www.npmjs.com/package/@shopana/novaposhta-transport-fetch)

Fetch-based HTTP transport implementation for Nova Poshta API client. Features:

- **Cross-platform**: Works in Node.js and browsers via `cross-fetch`
- **Configurable**: Custom fetch implementation and headers
- **AbortSignal support**: Built-in request cancellation
- **Lightweight**: Minimal dependencies

```bash
npm i @shopana/novaposhta-transport-fetch
```

[Read more →](./packages/novaposhta-transport-fetch/README.md)

## Quick Start

### Nova Poshta

```ts
import { createClient, AddressService, ReferenceService } from '@shopana/novaposhta-api-client';
import { createFetchHttpTransport } from '@shopana/novaposhta-transport-fetch';

const client = createClient({
  transport: createFetchHttpTransport(),
  baseUrl: 'https://api.novaposhta.ua/v2.0/json/',
  apiKey: process.env.NP_API_KEY,
})
  .use(new AddressService())
  .use(new ReferenceService());

// Use the API
const cities = await client.address.getCities({});
const cargoTypes = await client.reference.getCargoTypes();
```

## Architecture

All carrier clients in this monorepo follow a consistent design pattern:

- **Plugin-based**: Connect only the services you need
- **Type-safe**: Full TypeScript support with strict typing
- **Transport-agnostic**: Bring your own HTTP transport
- **Tree-shakeable**: Optimal bundle size
- **Namespaced API**: Clean, organized method calls

## Development

```bash
# Install dependencies
yarn install

# Build all packages
yarn build

# Run tests
yarn test
```

## License

Apache-2.0
