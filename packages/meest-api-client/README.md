# @shopana/meest-api-client

Typed clients for Meest (Meest Express, Ukraine) on top of [`@shopana/carrier-core`](../carrier-core).

| API                                                 | Base URL                             | Auth                               | Status                                           |
| --------------------------------------------------- | ------------------------------------ | ---------------------------------- | ------------------------------------------------ |
| Public (`createMeestPublicClient`)                  | `https://publicapi.meest.com`        | none                               | ready (all 8 endpoints)                          |
| Contract openAPI v3.0 (`createMeestContractClient`) | `https://api.meest.com/v3.0/openAPI` | login + password -> `token` header | ready (all 52 operations of the current Swagger) |

## A transparent wrapper

The clients send the documented requests and return what Meest answers, field for field:

- Every method returns the response body exactly as Meest sends it: the `{ status, info, result }` envelope of the contract API, the `{ status, msg, result }` envelope of the public API, or the bare payload where the Swagger documents no envelope. An `Error` envelope in a 2xx body is returned, not thrown.
- Only non-2xx HTTP answers throw (`CarrierError` with the raw body in `raw`), because retries and token renewal depend on the HTTP status.
- The client does no validation, caching, date conversion, filtering or default rate limiting. Inputs are what the endpoint takes: dates and ids are strings.
- Optional helpers are separate exports you opt into: `unwrapMeestResponse` / `unwrapMeestPublic` (result or exception).
- Request and response types are generated from the Swagger snapshot (`yarn generate:types`) and pinned field by field in `type-tests/` (see Tests).

Every method takes a trailing `{ signal }` (`AbortSignal`) that cancels the call, its retries and the wait for a rate-limit slot.

## Public API

No credentials. Registers of localities and branches, one branch, nearest branches by address or coordinates.

```ts
import { createMeestPublicClient } from '@shopana/meest-api-client';

const meest = createMeestPublicClient(); // optional: baseUrl, transport, retry, rateLimit, timeoutMs, logger

const lockers = await meest.branches.list({ city: 'Ternopil', type: 'poshtomat', lang: 'en' }); // short form
const full = await meest.branches.list({ city: 'Ternopil', viewdata: 'full' }); // full form
const branch = await meest.branches.get(8382); // by showcase number or br_id; the API answers with a list
const near = await meest.branches.nearestByCoords({ lat: 49.547, lng: 25.589 }, { type: 'poshtomat' });
const streets = await meest.geo.streets({ cityId: '80f55c6a-749b-11df-b112-00215aee3ebe' });
// { status: 1, msg: null, result: [...] } or { status: 0, msg: { code, ua, ru, en }, result: null }
```

- The locality register wraps every item in `data`. `is_delivery_in_city: true` means address delivery is **not** available.
- The short branch form has `num_showcase` and `parcel_max_kg`; the full form (`viewdata=full`, single branch, locator) has the address, working hours and `limits`. Limits keep the API's spelling (`receiving_phone_reqired`, `cash_pay_unavailible`). `parcel_max_kg: 0` means no limit.
- The locator returns up to 10 branches in the full form, with `distance` in km.

## Contract API

Needs the login and password Meest issues with the contract (and the `contractID` of the agreement).

```ts
import { createMeestContractClient } from '@shopana/meest-api-client';

const meest = createMeestContractClient({
  username: process.env.MEEST_USERNAME!,
  password: process.env.MEEST_PASSWORD!,
});

const quote = await meest.pricing.calculate({
  sender: { branchID, cityID, service: 'Branch' },
  receiver: { branchID: lockerId, cityID: lockerCityId, service: 'Branch' },
  placesItems: [{ quantity: 1, weight: 1.5 }],
});
const created = await meest.parcels.create(body); // { status, info, result: { parcelID, barCode, ... } }
const sticker = await meest.print.sticker100(created.result.parcelID!); // { contentType: 'application/pdf', data: Uint8Array }
const events = await meest.tracking.byNumber(created.result.barCode!);
```

Namespaces: `auth`, `search`, `parcels`, `pricing`, `print`, `tracking`, `registers`, `misc`.

- **Token.** Logs in on the first call, sends it in the `token` header, renews it ahead of expiry and once after a 401 (refresh first, then a full login). `auth.login()` and `auth.refresh()` return Meest's answer unchanged (`result.token`, `result.refresh_token`, `result.expiresIn`). Tokens are cached per account (base URL plus a hash of the login); pass `tokenStore` to share them between processes.
- **Limits.** Meest allows 100 requests a minute per user. The client applies no limit by default; pass `rateLimit: { limit: 100, intervalMs: 60_000 }` (or your own limiter) to throttle. 429 and 5xx are retried for reads; `POST /parcel` is **never** repeated automatically, check `parcels.get(number, 'parcelNumber')` before retrying yourself.
- **Forms.** `print.declaration` and `print.cn23` use the `declarationForm`/`cn23Form` endpoints, which take the phone number of the parcel's sender or recipient. `registers.availableTimeSlots` takes `{ type: 'PickUp' | 'Delivery', streetId, cityId }` as the endpoint does.
- **Sandbox.** The collection documents none. Pass the URL Meest gives you as `baseUrl`.
- **Swagger quirks.** `status` is `OK`/`ok`/`Error`, errors sit in `info` or in flat fields, and a few responses have no envelope. The register bodies list a root `parcelID` as required although it only exists inside `parcelsItems`; the snapshot is sanitized for that one (`scripts/contract-source.js`).

## Tests

`yarn workspace @shopana/meest-api-client test`: unit tests on a function-based mock transport (`__tests__/mock.ts`), no network. They check the request each method sends (method, path, query, headers, body), that responses come back untouched, the token flow, retries and throttling. `__tests__/contractCoverage.test.ts` ties every operation of the Swagger snapshot to a client call and its documented query parameters.

`yarn workspace @shopana/meest-api-client type-check` also compiles `type-tests/`: `fields.generated.ts` walks the Swagger and pins the exact field names, optionality and primitive types of every request and response type; `public.ts` does the same for the public API types from its documentation and live answers.

Smoke tests against the live APIs are in `e2e/` and run only on purpose: `MEEST_E2E=1 yarn workspace @shopana/meest-api-client test:e2e` (contract tests also need `MEEST_USERNAME`, `MEEST_PASSWORD`).
