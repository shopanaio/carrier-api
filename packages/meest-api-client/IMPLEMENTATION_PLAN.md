# @shopana/meest-api-client — Implementation Plan

## 1. Goals & Success Criteria
- Mirror the public surface and modular architecture of `@shopana/novaposhta-api-client`:
  - `createClient` factory with `.use(new Service())` plugin pattern.
  - Dedicated `services/*` classes with `namespace` fields attached to the client instance.
  - `http/transport` interface for transport-agnostic usage (e.g., reuse `@shopana/novaposhta-transport-fetch`).
  - Rich type definitions & enums exposed from `src/index.ts`.
- Provide full coverage of the Meest OpenAPI v3.0 (48 operations across 7 functional blocks).
- Encapsulate token-based authentication (`token` header) and shared response envelope (`status/info/result`).
- Deliver documentation parity (README, QUICK_START, ARCHITECTURE) and tests patterned after the Nova Poshta client.

## 2. API Domain Overview (from `docs/openapi.json`)
| Domain (Swagger tag) | Namespace (planned) | Notes |
| --- | --- | --- |
| `authentication` | `auth` | `POST /auth`, `POST /refreshToken` (token lifecycle). |
| `search` | `search` | Location & infrastructure search (11 endpoints, mix of GET+POST). |
| `parcels` | `parcels` | CRUD for shipments, tariff calculation, locking (13 endpoints). |
| `registers` | `registers` | Pickup and branch register lifecycle (8 endpoints). |
| `print` | `print` | Binary outputs (PDF/ZPL) for declarations, CN23, registers, stickers (5 endpoints). |
| `tracking` | `tracking` | Tracking by barcode/period/status (5 endpoints). |
| `other` | `misc` | Returns, contract info, banners, phone checks (6 endpoints). |

All endpoints share base URL `https://api.meest.com/v3.0/openAPI` and require the `token` header (except `/auth`). Responses conform to:
```ts
type MeestResponse<T> = {
  status: 'OK' | 'Error';
  info?: string;
  fieldName?: string;
  message?: string;
  messageDetails?: string;
  result: T;
};
```

## 3. Package Structure (mirrors novaposhta client)
```
packages/meest-api-client/
├── src/
│   ├── core/
│   │   └── client.ts           # clone of NP client with Meest-specific context
│   ├── http/
│   │   └── transport.ts        # same interface as NP for transport reuse
│   ├── services/
│   │   ├── authService.ts
│   │   ├── searchService.ts
│   │   ├── parcelsService.ts
│   │   ├── registersService.ts
│   │   ├── printService.ts
│   │   ├── trackingService.ts
│   │   └── miscService.ts
│   ├── types/
│   │   ├── base.ts             # response envelope, shared primitives
│   │   ├── enums.ts            # pay types, services, parcel statuses, etc.
│   │   ├── auth.ts
│   │   ├── search.ts
│   │   ├── parcels.ts
│   │   ├── registers.ts
│   │   ├── print.ts
│   │   ├── tracking.ts
│   │   └── misc.ts
│   ├── errors/
│   │   └── index.ts            # error normalization similar to NP client
│   ├── utils/
│   │   ├── requestBuilder.ts   # base URL + path resolver
│   │   └── serializers.ts      # date/number normalization helpers
│   └── index.ts                # public exports (matching NP layout)
├── README.md / QUICK_START.md / ARCHITECTURE.md
├── IMPLEMENTATION_PLAN.md      # this document
└── docs/openapi.json           # current OpenAPI snapshot
```

## 4. Core Building Blocks
1. **Client factory (`core/client.ts`)**
   - Copy NP logic: `createClient({ transport, baseUrl, token, defaultHeaders })`.
   - Extend context with `tokenManager` (optional) to attach `token` header automatically and refresh via `authService`.

2. **HTTP layer (`http/transport.ts`)**
   - Re-export NP `HttpTransport` interface so callers can reuse `@shopana/novaposhta-transport-fetch`.
   - Provide helper `createDefaultTransport(fetchLike)` for tests/examples.

3. **Request builder**
   - Compose final URL: `${baseUrl.replace(/\\/$/, '')}${path}`.
   - Inject `token` header unless explicitly overridden.
   - Serialize query params for GET endpoints; body for POST/PUT requires JSON by default.
   - Support `responseType: 'json' | 'arraybuffer' | 'stream'` for print endpoints.

4. **Error normalization**
   - Convert transport-level errors and API envelope errors into typed exceptions (`AuthenticationError`, `ValidationError`, etc.), mirroring NP `types/errors`.
   - Provide helper `assertOk(response)` returning `result` or throwing with aggregated `message`/`fieldName`.

5. **Type exposures**
   - Export `MeestResponse`, request/response DTOs, enums (pay types, parcel statuses, branch types, etc.) from `src/index.ts`, analogous to NP exports.

## 5. Service Design & API Surface

### Shared conventions
- Each service class implements `PluggableNamedService`, sets `namespace`, and exposes only public API methods.
- Methods accept typed DTOs, call `this.transport.request` with `{ method, path, query, body }`.
- Responses resolve to already unwrapped `result` data; helper handles status checking.
- Optionally expose convenience helpers for simple cases (e.g., `trackNumber` vs full DTO).

### Service breakdown
| Service | Namespace | Endpoints & Notes |
| --- | --- | --- |
| `AuthService` | `auth` | `login(credentials)` → `/auth`; `refresh(token)` → `/refreshToken`. Should persist the `token` into shared context for downstream calls. |
| `SearchService` | `search` | Wraps 11 endpoints: address by coords, country/region/district/city search, ZIP search, branch search (incl. geo & pay terminals), branch types. Provide convenience DTOs for pagination/filter combos. |
| `ParcelsService` | `parcels` | Wraps CRUD + tariff ops: `getStatus`, `getStatusDetails`, `getParcel`, `create`, `update`, `delete`, `listByDate`, `calculate`, `orderDateInfo`, `specConditions`, `lock`, `unlock`. Manage enums for `payType`, `service`, `cargoType`, etc. |
| `RegistersService` | `registers` | Manage branch/pickup registers and available time slots. Provide typed responses for register IDs and statuses. |
| `PrintService` | `print` | Methods returning binary payloads or download URLs: `getDeclaration`, `getCn23`, `getRegister`, `getSticker100`, `getSticker100A4`. Accept `contentType` unions (`'pdf' | 'zpl' | 'png'`). |
| `TrackingService` | `tracking` | `getByTrackNumber`, `getByPeriod`, `getDelivered`, `getByDate`, `getParcelInfo`. Normalize status enums and date outputs. |
| `MiscService` | `misc` | `parcelReturn`, `parcelReturnReasons`, `contractClientInfo`, `checkPhoneOnParcel`, `validateContract`, `getBanners`. |

All namespaces should feel identical to the NP client: `client.parcels.create({...})`, `client.search.citySearch({...})`, etc.

## 6. Types & Modeling Strategy
1. **Base primitives**
   - `MeestId`, `ContractId`, `ParcelId`, `TrackNumber`, `Phone`, `Money`, `Weight`, `GeoPoint`, etc., defined in `types/base.ts`.
   - `PaginatedResponse<T>` and `ListResponse<T>` wrappers.

2. **Enums (from docs text)**
   - Payment types (`Sender`, `Recipient`, `ThirdParty`), receiver pay flags, service types (`Door`, `Branch`), delivery services, branch types, status codes (OK/Error), operation statuses (per tracking).

3. **DTOs per domain**
   - Manually crafted TypeScript interfaces referencing OpenAPI parameter tables.
   - Use composition to avoid duplication (e.g., `ContactInfo`, `AddressBlock`, `DateRange`).

4. **Model generation workflow**
   - Write a small Node script (optional) to extract OpenAPI schemas into intermediate JSON for manual typing.
   - Document derived fields in `ARCHITECTURE.md` for maintainers.

## 7. Auth & Token Lifecycle
- `createClient` accepts optional `token` and `onTokenChange`.
- `AuthService.login` stores `token` in shared `ClientContext`.
- Implement `TokenManager` helper in `core/client.ts` (or `utils/tokenManager.ts`) to:
  - Expose `getToken()`, `setToken()`, `clearToken()`.
  - Optionally handle automatic refresh when API responds with `401`/`status === 'Error'` & message indicates expiration (stretch goal).

## 8. Transport & Configuration
- Default config:
  ```ts
  const client = createClient({
    transport: createFetchHttpTransport(),
    baseUrl: 'https://api.meest.com/v3.0/openAPI',
    token: process.env.MEEST_TOKEN,
    defaultHeaders: { 'Content-Type': 'application/json' },
  });
  ```
- Provide ability to override `baseUrl` (e.g., staging sandbox) and `timeout`.
- Print endpoints need response transformations: allow `options: { responseType?: 'json' | 'arraybuffer' }` per call.

## 9. Testing & Tooling
- **Unit tests** (Jest, same setup as NP client):
  - Mock transport to verify payloads per service method.
  - Snapshot typed responses for complex DTOs (parcel creation, search results).
  - Ensure token injection occurs for all non-auth routes.
- **Integration tests (optional)**: Provide fixtures hitting a mocked server (similar to NP approach) to validate binary handling.
- **Lint/build**: Reuse repo-level TS + Rollup configs; adjust tsconfig paths.

## 10. Documentation & Examples
- `README.md`: adapt NP README, highlight differences (token auth, binary print).
- `QUICK_START.md`: show login + simple parcel creation + tracking flow.
- `ARCHITECTURE.md`: diagram core modules, request flow, and service namespaces.
- `docs/` folder: keep OpenAPI snapshot and any helper diagrams.
- Examples:
  - `examples/create-parcel.ts`
  - `examples/print-label.ts`
  - `examples/track-shipment.ts`

## 11. Delivery Phases
1. **Phase 1 – Scaffolding**
   - Copy NP package template (package.json, build config, README skeleton).
   - Implement `core`, `http`, `types/base`, `errors`.
2. **Phase 2 – Auth & Search**
   - Implement `AuthService`, token manager, search DTOs/services.
   - Add smoke tests.
3. **Phase 3 – Parcels & Registers**
   - Cover 21 operations (parcels + registers), add enums, thorough tests.
4. **Phase 4 – Print & Tracking**
   - Handle binary responses, date filters, tracking enums.
5. **Phase 5 – Misc + Polish**
   - Misc endpoints, README/Quick Start, architecture doc, CI hooks.

## 12. Open Questions / Follow-ups
- Confirm whether we should share transport package (`@shopana/novaposhta-transport-fetch`) or create `@shopana/meest-transport-fetch`.
- Need authoritative enum lists (pay types, service codes) beyond textual descriptions—verify with product team.
- Should the client auto-handle token refresh on `status === 'Error'` with code `TokenExpired`?
- Any need for rate-limiting helpers (API limit: 500 req/min)?

Once questions are clarified, implementation can proceed following the phased plan.
