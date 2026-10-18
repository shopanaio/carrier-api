# @shopana/demo-post-api-client

Typed Demo Post API client for Node.js, built on `@shopana/carrier-core`.

| Entry | What |
|---|---|
| `@shopana/demo-post-api-client/public` | API that needs no contract credentials |
| `@shopana/demo-post-api-client/contract` | Credentialed API |
| `@shopana/demo-post-api-client/adapter` | `carrier-contracts` adapter |
| `@shopana/demo-post-api-client/simulator` | Contract simulator for tests (needs `@shopana/carrier-testing`) |

## Getting access

Describe how to get credentials (contract, sandbox, certification), which API each credential unlocks, and the rate limits.

## Usage

```ts
import { createFetchTransport } from '@shopana/carrier-core';
import { createDemoPostContractClient, TrackingService } from '@shopana/demo-post-api-client/contract';

const client = createDemoPostContractClient({ transport: createFetchTransport(), apiKey: process.env.DEMO_POST_API_KEY! })
  .use(new TrackingService());

const events = await client.tracking.getEvents('TRACKING_NUMBER');
```

## Testing

Unit and conformance tests run against `src/simulator` built from `contracts/`; no network. Smoke tests against the live API live in `e2e/__tests__/demo-post/` and run only on explicit request.

## Known limitations and deprecations

List API sunsets and missing operations here.
