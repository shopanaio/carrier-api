# Architecture

## High-level layout

```
src/
├── core/           # client factory + token manager
├── http/           # transport interface + default fetch helper
├── services/       # pluggable namespaces (Auth, Search, ...)
├── types/          # base primitives, enums, and auto-generated DTOs
├── utils/          # request builder + serializers
├── errors/         # shared error hierarchy + response guards
└── index.ts        # public exports
```

Each service mirrors the Nova Poshta client: `createClient` returns a mutable object where services attach themselves via `.use(new Service())`. Namespaces (`auth`, `search`, …) become properties on the client instance.

## Request flow

1. Service calls `this.send({ method, path, body, query })` (provided by `BaseService`).
2. `RequestBuilder` composes the final URL (`baseUrl + path + query`) and injects the `token` header unless `skipAuth` is set (Auth routes).
3. `HttpTransport` executes the HTTP request. Only an interface lives here so any fetch/xhr/axios implementation can be plugged in. `createFetchHttpTransport` is a stopgap until `@shopana/meest-transport-fetch` ships.
4. Responses flow through `assertOk`, which unwraps the standard Meest envelope (`status/info/message/result`) and throws typed errors when `status === 'Error'`.
5. Services return the plain `result` object/array described by the OpenAPI schema.

## Token lifecycle

`TokenManager` stores the active token, exposes `setToken/clearToken`, and notifies listeners (e.g. `onTokenChange`).

- `AuthService.login` / `refresh` both store incoming tokens automatically.
- `RequestBuilder` reads the token per request and writes it into the `token` header.
- No auto-refresh is attempted yet (explicit requirement); future work can plug it into `BaseService.send` by checking response metadata.

## Types & generation

- `docs/openapi.json` is the only source of truth.
- `scripts/generate-types.js` walks every path/method, flattens request bodies, parameters, and response payloads into TypeScript aliases in `src/types/generated.ts`.
- Domain-specific type modules (e.g. `types/search.ts`) re-export the relevant pieces, keeping service files tidy.
- When the Swagger spec changes, run `yarn workspace @shopana/meest-api-client generate:types` and commit the regenerated file.

## Testing

- Jest + ts-jest (aligned with the Nova Poshta client setup).
- Unit tests currently cover token injection and service wiring (`AuthService`, `SearchService`).
- Future phases will add fixtures covering parcels/register flows and binary print endpoints (ArrayBuffer handling).

## Next phases

1. Implement `parcelsService`, `registersService`, `printService`, `trackingService`, `miscService` backed by the already generated DTOs.
2. Expand tests to cover error normalization and binary responses.
3. Publish `@shopana/meest-transport-fetch` for parity with the Nova Poshta client.
4. Wire documentation examples (parcel creation, register creation, label printing) once those services land.
