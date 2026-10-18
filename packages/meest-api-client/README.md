# @shopana/meest-api-client

Typed clients for Meest (Meest Express, Ukraine) on top of [`@shopana/carrier-core`](../carrier-core).

| API | Base URL | Auth | Status |
| --- | --- | --- | --- |
| Public (`createMeestPublicClient`) | `https://publicapi.meest.com` | none | ready |
| Contract openAPI v3.0 (`createMeestContractClient`) | `https://api.meest.com/v3.0/openAPI` | login + password -> `token` header | ready (all 48 operations) |

## Public API

No credentials. Registers of localities and branches, one branch, nearest branches by address or coordinates.

```ts
import { createMeestPublicClient, createMemoryReferenceCache } from '@shopana/meest-api-client';

const meest = createMeestPublicClient({ cache: createMemoryReferenceCache() });

const lockers = await meest.branches.list({ city: 'Ternopil', type: 'poshtomat', lang: 'en' });
const branch = await meest.branches.get(8382);                        // by showcase number or br_id
const near = await meest.branches.nearestByCoords({ lat: 49.547, lng: 25.589 }, { type: 'poshtomat' });
const streets = await meest.geo.streets({ cityId: '80f55c6a-749b-11df-b112-00215aee3ebe' });
```

Things worth knowing:

- Failures come as HTTP 200 with `status: 0` and `msg.code`. "Nothing found" lists return `[]`; `branches.get` throws a `CarrierError` with `category: 'not_found'`.
- The registers are big and not paginated (localities about 6 MB, branches about 2.3 MB). Pass a `ReferenceCache` (get/set with TTL) and refresh once a day; `branches.find()` filters the cached register on the client.
- `geo.localities()` items are unwrapped from `{ data }`. `is_delivery_in_city: true` means address delivery is **not** available.
- Limits keep the API's spelling (`receiving_phone_reqired`, `cash_pay_unavailible`).
- The locator returns up to 10 branches in the full form, sorted by `distance` (km).

## Contract API

Needs the login and password Meest issues with the contract (and the `contractID` of the agreement).

```ts
import { createMeestContractClient } from '@shopana/meest-api-client';

const meest = createMeestContractClient({ username: process.env.MEEST_USERNAME!, password: process.env.MEEST_PASSWORD! });

const [quote] = await meest.pricing.calculate({
  sender: { branchID, cityID, service: 'Branch' },
  receiver: { branchID: lockerId, cityID: lockerCityId, service: 'Branch' },
  placesItems: [{ quantity: 1, weight: 1.5 }],
});
const parcel = await meest.parcels.create({ /* see CreateParcel in the Swagger */ } as ParcelRequestBody);
const sticker = await meest.print.sticker100(parcel.parcelID!);              // { contentType: 'application/pdf', data: Uint8Array }
const events = await meest.tracking.byNumber(parcel.barCode!);
```

Namespaces: `auth`, `search`, `parcels`, `pricing`, `print`, `tracking`, `registers`, `misc`. Request and result types are generated from the Swagger snapshot (`yarn generate:types`).

- **Token.** Logs in on the first call, sends it in the `token` header, renews it ahead of expiry and once after a 401 (refresh first, then a full login). Pass `tokenStore` to share tokens between processes.
- **Limits.** 100 requests a minute per user: the client throttles itself. 429 and 5xx are retried for reads; `POST /parcel` is **never** repeated automatically, check `parcels.get(number, 'parcelNumber')` before retrying yourself.
- **Errors.** Everything throws `CarrierError` (`carrier: 'meest'`, `code` is `HTTP status:fieldName`, `field`, `category`). Meest publishes no error catalog, so the category comes from the HTTP status.
- **Dates.** Methods take `Date | string`; a `Date` is formatted in Kyiv time as the endpoint expects (`dd.MM.yyyy`, `yyyy-MM-dd`, `yyyy-MM-dd HH:mm:ss`), a string is sent as is.
- **Sandbox.** The collection documents none. Pass the URL Meest gives you as `baseUrl`.
- **Swagger quirks.** Status is `OK`/`ok`, errors sit in `info` or in flat fields, `refresh_token` has two spellings, a few responses have no envelope, and the register bodies list a root `parcelID` as required although it only exists inside `parcelsItems`. The client reads all of these; the contract snapshot is sanitized for the last one (`scripts/contract-source.js`).

## Tests

`yarn workspace @shopana/meest-api-client test`: unit tests on a function-based mock transport (`__tests__/mock.ts`), no network. They check the request each method sends (method, path, query, headers, body), response and error mapping, the token flow, retries and throttling.

Smoke tests against the live APIs are in `e2e/` and run only on purpose: `MEEST_E2E=1 yarn workspace @shopana/meest-api-client test:e2e` (contract tests also need `MEEST_USERNAME`, `MEEST_PASSWORD`).
