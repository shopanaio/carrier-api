# @shopana/ukrposhta-api-client

Typed client for the [Ukrposhta](https://dev.ukrposhta.ua/documentation) API, built on `@shopana/carrier-core`, with a `carrier-contracts` adapter and a contract simulator for tests.

Status: **work in progress.** Available now: status tracking, address classifier, tracking adapter, simulators of both. The credentialed eCom API (addresses, clients, shipments, pricing, stickers, groups) is next.

## Credentials

Ukrposhta issues credentials with the contract. Each service takes its own bearer:

| Service              | Credential                       | Client                            |
| -------------------- | -------------------------------- | --------------------------------- |
| Status tracking      | `…BearerStatusTracking`          | `createUkrposhtaTrackingClient`   |
| Address classifier   | eCom bearer                      | `createUkrposhtaClassifierClient` |
| eCom, forms (coming) | eCom bearer + counterparty token | `createUkrposhtaContractClient`   |

The sandbox (`environment: 'sandbox'`, host `dev.ukrposhta.ua`) uses a separate bearer and token. The documentation names no sandbox for tracking and the classifier; pass `baseUrl` if you have one.

## Tracking

```ts
import { createFetchTransport } from '@shopana/carrier-core';
import { createUkrposhtaTrackingClient } from '@shopana/ukrposhta-api-client/public';

const client = createUkrposhtaTrackingClient({
  transport: createFetchTransport(),
  bearer: process.env.UKRPOSHTA_TRACKING_BEARER!,
});

const events = await client.tracking.getStatuses('0500100031143', { lang: 'en' });
const { found, notFound } = await client.tracking.getLastStatusesBatchWithNotFound(['0500100031143', '0500128254768']);
```

A return to the sender arrives as event `41000` with `eventReason_id: 10`; `effectiveEventCode` turns it into `41010`.

Batch limits are checked before sending: 50 barcodes for all statuses, 100 for last statuses.

## Address classifier

```ts
import { createUkrposhtaClassifierClient } from '@shopana/ukrposhta-api-client/public';

const client = createUkrposhtaClassifierClient({ transport, bearer: process.env.UKRPOSHTA_ECOM_BEARER! });
const offices = await client.classifier.getPostOffices({ postIndex: '01001' });
```

The service answers XML by default; the client asks for JSON and normalizes the envelope: no hits give `[]`, one hit gives `[hit]`. Search operations need at least one filter, otherwise the service returns an empty answer, so the client rejects the call instead.

## carrier-contracts adapter

```ts
import { createUkrposhtaAdapter } from '@shopana/ukrposhta-api-client/adapter';

const adapter = createUkrposhtaAdapter({ tracking: trackingClient });
const [result] = await adapter.track(['0500100031143']);
```

Statuses map from the event codes of Annex B (`ukrposhtaStatusMap`); the raw code is kept. Event times are local Kyiv time without a zone in the API and are returned as ISO strings with the real UTC offset.

## Errors

Every failure is a `CarrierError`. `UPExxxxx` codes from Annex J map to categories by group (validation, not found, status, PDF, authentication, database, invalid operation, internal); only 5xx and 429 answers are retryable.

## Testing

`@shopana/ukrposhta-api-client/simulator` (test-only, needs `@shopana/carrier-testing`) provides `createUkrposhtaTrackingSimulator`, `createUkrposhtaClassifierSimulator` and `createUkrposhtaPublicSimulator`, driven by contracts of the documented operations.
