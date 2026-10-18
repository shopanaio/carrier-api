# @shopana/ukrposhta-api-client

Typed client for the [Ukrposhta](https://dev.ukrposhta.ua/documentation) API, built on `@shopana/carrier-core`, with a `carrier-contracts` adapter.

Covered: addresses, clients, shipments (also several parcels), price calculation, shipment groups and form 103a, stickers and printed forms, courier collection, shipment management after dispatch, cash-on-delivery transfers, barcodes, banks, status tracking and the address classifier. Not yet: delivery notifications (forms 119/119e/20e as JSON), documents back, international shipments.

## Credentials

Ukrposhta issues credentials with the contract. Each service takes its own bearer:

| Service            | Credential                       | Client                            |
| ------------------ | -------------------------------- | --------------------------------- |
| Status tracking    | tracking bearer                  | `createUkrposhtaTrackingClient`   |
| Address classifier | eCom bearer                      | `createUkrposhtaClassifierClient` |
| eCom and forms     | eCom bearer + counterparty token | `createUkrposhtaContractClient`   |

The environment defaults to `production`: pass `environment: 'sandbox'` explicitly for tests, or a test shipment goes to the real service. The sandbox (`environment: 'sandbox'`, host `dev.ukrposhta.ua`) uses a separate bearer and token. The documentation names no sandbox for tracking and the classifier; pass `baseUrl` if you have one.

The eCom client adds the token (`?token=`) only to operations that take it. Pass the secrets as strings or as functions (`() => string | Promise<string>`); the bearer and the token are masked in logs.

## Entry points

```ts
import { createFetchTransport } from '@shopana/carrier-core';
import {
  AddressesService,
  ClientsService,
  ShipmentsService,
  PricingService,
  LabelsService,
  createUkrposhtaContractClient,
} from '@shopana/ukrposhta-api-client';

const client = createUkrposhtaContractClient({
  transport: createFetchTransport(),
  environment: 'sandbox',
  bearer: process.env.UKRPOSHTA_BEARER!,
  counterpartyToken: process.env.UKRPOSHTA_TOKEN!,
})
  .use(new AddressesService())
  .use(new ClientsService())
  .use(new ShipmentsService())
  .use(new PricingService())
  .use(new LabelsService());
```

Services are mounted with `.use(...)`, so only what you import is bundled. Subpaths: `/public` (tracking and classifier), `/contract` (eCom), `/adapter` (carrier-contracts).

| Namespace                            | Service                 | What it does                                                                       |
| ------------------------------------ | ----------------------- | ---------------------------------------------------------------------------------- |
| `addresses`                          | `AddressesService`      | create and read addresses, check a route between postcodes                         |
| `clients`                            | `ClientsService`        | senders and recipients, contact data, postpay recipients, prohibited phones        |
| `shipments`                          | `ShipmentsService`      | create (one or many), update, read, status, delete (only while `CREATED`), parcels |
| `pricing`                            | `PricingService`        | tariffs and the price of a domestic shipment                                       |
| `shipmentGroups`                     | `ShipmentGroupsService` | groups (the register of form 103a), paging through a group                         |
| `labels`                             | `LabelsService`         | stickers, form 103a, form 119; binary answers as `{ contentType, data }`           |
| `courier`                            | `CourierService`        | courier collection orders                                                          |
| `management`                         | `ManagementService`     | extend storage, change recipient, return order, forward, change cash on delivery   |
| `transfers`, `barcodes`, `reference` |                         | cash-on-delivery transfer status, barcode types, banks and error codes             |

## The flow

1. Create the sender's and recipient's addresses (`addresses.create`): the postcode is the delivery zone code from the classifier.
2. Create both clients (`clients.create`) with their address ids.
3. Create the shipment (`shipments.create`): the price comes back as `deliveryPrice`.
4. Print the sticker (`labels.getSticker`). To hand several shipments over at once: `shipmentGroups.create`, `addShipments`, `labels.getForm103a`.

Weights are in grams, sizes in centimeters (`length` is the longest side), prices in UAH. A shipment is deleted only while its status is `CREATED`; a group closes when its shipments are registered at a post office.

## Tracking

```ts
import { createUkrposhtaTrackingClient } from '@shopana/ukrposhta-api-client/public';

const tracking = createUkrposhtaTrackingClient({ transport, bearer: process.env.UKRPOSHTA_TRACKING_BEARER! });
const events = await tracking.tracking.getStatuses('0500100031143', { lang: 'en' });
const { found, notFound } = await tracking.tracking.getLastStatusesBatchWithNotFound(['0500100031143']);
```

A return to the sender arrives as event `41000` with `eventReason_id: 10`; `effectiveEventCode` turns it into `41010`. Batch limits are checked before sending: 50 barcodes for all statuses, 100 for last statuses.

## Address classifier

```ts
import { createUkrposhtaClassifierClient } from '@shopana/ukrposhta-api-client/public';

const classifier = createUkrposhtaClassifierClient({ transport, bearer: process.env.UKRPOSHTA_ECOM_BEARER! });
const offices = await classifier.classifier.getPostOffices({ postIndex: '01001' });
```

The service answers XML by default; the client asks for JSON and normalizes the envelope: no hits give `[]`, one hit gives `[hit]`. Search operations need at least one filter, otherwise the service returns an empty answer, so the client rejects the call instead.

## carrier-contracts adapter

```ts
import { createUkrposhtaAdapter } from '@shopana/ukrposhta-api-client/adapter';

const adapter = createUkrposhtaAdapter({ ecom: client, tracking, classifier });
const shipment = await adapter.createShipment({ sender, recipient, parcels });
const [result] = await adapter.track([shipment.trackingNumber]);
```

Pass the clients you have; a capability is declared only when the client behind it is present: `tracking` needs the tracking client, `shipments`, `rates`, `labels`, `cancel` and `manifest` the eCom client (with `CourierService` also `pickup`), `locations` and `addressValidation` the classifier.

How the adapter maps the model:

- **Parties.** A client and address are found or created from the party; a party with `externalId` is looked up first and reused, with `carrierRefs.ukrposhta.{clientUuid,addressId}` nothing is looked up. A `contact.company` makes a company (needs the EDRPOU in `taxId`), a ten-digit `taxId` a sole proprietor (tin). A plain `contact.name` is read as "Surname Name Patronymic".
- **Delivery type.** A door point is `D`, a carrier location `W` (the location id is the post office index): `D2D`, `D2W`, `W2D`, `W2W`.
- **Service.** `options.service` is `EXPRESS` (default), `STANDARD`, `DOCUMENT` or `CARGO`. Rates without a service return Express and Standard.
- **Money.** Everything is UAH; another currency is rejected before any request. Cash on delivery must not exceed the declared value of the parcels; the adapter rejects it instead of raising the declared value (which changes the fee).
- **Cancel.** Only a `CREATED` shipment can be deleted; any later status fails with `NOT_CANCELLABLE`.
- **Manifest.** Puts the shipments (one sender, one type, not yet registered) into a new group and returns form 103a.
- **Pickup.** The courier comes to the sender address of the shipments in one of three windows (09-12, 12-15, 15-18).
- **Tracking.** Statuses come from the event codes of the tracking documentation (`ukrposhtaStatusMap`); the raw code is always kept. Event times are local Kyiv time without a zone in the API and are returned as ISO strings with the real UTC offset.

## Errors

Every failure is a `CarrierError`. `UPExxxxx` codes from Annex J map to categories by group (validation, not found, status, PDF, authentication, database, invalid operation, internal); only 5xx and 429 answers are retryable. `createShipment` creates addresses and clients before the shipment; every local check runs first, but a carrier failure after that leaves those records behind. Input the adapter cannot map fails with `INVALID_INPUT` and the offending `field`, before anything is sent. A shipment creation is never repeated automatically after a server error or a lost connection: the carrier may have created it.

## Contracts

`contracts/ukrposhta-ecom.openapi.json` is the SwaggerHub snapshot of the eCom API; `contracts/README.md` lists where it disagrees with the documentation (the client follows the documentation).

## Tests

`yarn workspace @shopana/ukrposhta-api-client test` runs unit tests against plain HTTP mocks (`__tests__/helpers`). `yarn workspace @shopana/ukrposhta-api-client test:e2e` runs smoke tests against the real sandbox and is never part of the normal run: it skips every suite whose variables are not set (`UKRPOSHTA_SANDBOX_BEARER`, `UKRPOSHTA_SANDBOX_TOKEN`, `UKRPOSHTA_SANDBOX_TRACKING_BEARER`, `UKRPOSHTA_KNOWN_BARCODE`; see `e2e/env.ts`).
