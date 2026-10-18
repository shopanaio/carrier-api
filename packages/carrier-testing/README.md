# @shopana/carrier-testing

Contract-driven carrier API simulator and adapter conformance checks. Use it as a devDependency: unit and scenario tests run against a simulator built from the same contract as the client types, with no network and no hand-written mocks.

## Simulator

```ts
import { contractFromOpenApi, createSimulator, json, SimClock } from '@shopana/carrier-testing';

const clock = new SimClock();
const sim = createSimulator({
  contract: contractFromOpenApi(swaggerSnapshot),        // or defineContract({...}) by hand
  clock,
  auth: ctx => (ctx.headers.authorization ? undefined : { status: 401, body: { message: 'Unauthorized' } }),
  invalidRequest: issues => ({ status: 400, body: { code: 'UPE01002', message: issues[0].message } }),
  rateLimit: { limit: 100, windowMs: 60_000, key: ctx => ctx.headers.token },
  handlers: {
    getShipment: ctx => json(ctx.state.collection('shipments').require(String(ctx.params.uuid))),
  },
});

const client = createMyCarrierClient({ transport: sim.transport, clock });
```

- Routes by method + path template from the contract; static segments win over parameters.
- Validates path, query, header and body against the contract (Ajv, OpenAPI `$ref` to `#/components/...` supported; Swagger 2.0 snapshots are converted, `#/definitions/...` included). An invalid request gets the carrier-shaped answer from `invalidRequest`, so a wrong field name surfaces as the carrier's error, not as a crash.
- Validates every carrier-shaped answer (handler, `httpError`, `auth`, `invalidRequest`, `rateLimit.response`) against the declared schema and throws `SimulatorError` when it drifts from the contract; statuses the contract does not declare are rejected too (declare them or a `default` entry; `strictResponses: false` turns this off). Request bodies reach handlers as they would travel over the wire (JSON round-tripped, form records copied), and any exception from a handler, `auth` or validation surfaces as `SimulatorError` with the original as `cause`. Unknown routes and missing handlers also throw (set `strictRoutes: false` to answer 404 instead). `SimulatorError` reaches the test as is: the client neither retries it nor wraps it as a network error.
- Decodes bodies exactly like the fetch transport: a PDF requested without `responseType: 'binary'` arrives as text, as it would in production.
- State: `SimStore` with collections and deterministic ids (`ids.uuid()`, `ids.sequence('barcode', { prefix: '05', pad: 11 })`); share one store between several simulators of a carrier and route with `combineSimulators(ecom, forms, tracking)`.
- Time: `SimClock` drives token TTLs and rate-limit windows; pass `clock` and `clock.sleep` to the client's retry and token options so tests never wait.
- Lifecycles: `new Lifecycle({ CREATED: ['REGISTERED', 'CANCELLED'], ... })` checks transitions and gives `path(from, to)` to walk a shipment to a status, one tracking event per step.
- Faults: `sim.fail({ operation: 'POST /statuses', status: 503, times: 2, headers: { 'Retry-After': '1' } })`, `networkError`, `delayMs`, `hang` (for timeouts).
- Inspection: `sim.calls` / `sim.callsTo(id)` with the outcome of each request (`handled`, `invalid`, `unauthorized`, `rate_limited`, `fault`, ...).
- Helpers: `json`, `binary`, `noContent`, `httpError`, `minimalPdf`, `isPdf`.

## Conformance

```ts
import { runAdapterConformance } from '@shopana/carrier-testing';

runAdapterConformance('ukrposhta', () => {
  const sim = createUkrposhtaSimulator();
  const adapter = createUkrposhtaAdapter(createClient({ transport: sim.transport }));
  return {
    adapter,
    scenario: { shipment, invalidShipment, rateRequest, locationQuery, unknownTrackingNumber: '0599999999999', deliver: s => sim.advance(s.id, 'DELIVERED') },
  };
});
```

Checks declared capabilities, shipment ids and carrier slug, label format/encoding (PDF magic bytes), tracking results (normalized statuses, raw codes kept, events oldest first, overall status equals the latest event), delivery after `deliver`, unknown numbers, rates, locations, cancel (verified with `isCancelled` or `getShipment`), and that rejected input throws `CarrierError`. With `inspectShipment` (what the carrier received, read from simulator state) it also checks that weights arrive in kilograms, the same shipment in grams included, and that sender and recipient country, postal code and city are passed through. `checkAdapterConformance` returns the same checks as a report for other test runners.

`__tests__/fixtures/demoCarrier.ts` is a complete worked example: contract, simulator handlers, a raw client on `carrier-core` with a login token, and an adapter that passes conformance.
