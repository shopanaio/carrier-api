// code and comments in English
import type {
  AdapterBase,
  Address,
  Capability,
  CreateShipmentInput,
  Label,
  LabelRequest,
  LocationQuery,
  Party,
  RateRequest,
  Shipment,
  TrackingResult,
} from '@shopana/carrier-contracts';
import {
  CAPABILITY_METHODS,
  TRACKING_STATUSES,
  isTrackingStatus,
  latestStatus,
  toKg,
} from '@shopana/carrier-contracts';
import { isPdf } from './responses';

/** Inputs for the conformance run. Checks whose inputs or capabilities are missing are skipped. */
export interface ConformanceScenario {
  /** A valid shipment the carrier (or its simulator) accepts. */
  shipment?: CreateShipmentInput;
  /** A shipment the carrier must reject; the adapter must throw a CarrierError. */
  invalidShipment?: CreateShipmentInput;
  label?: Omit<LabelRequest, 'shipmentId' | 'trackingNumber'>;
  rateRequest?: RateRequest;
  locationQuery?: LocationQuery;
  /** A number the carrier does not know: expect `found: false` or a `not_found` CarrierError. */
  unknownTrackingNumber?: string;
  /** Moves the created shipment to delivered (e.g. `sim.advance(...)`); enables the delivered check. */
  deliver?: (shipment: Shipment) => void | Promise<void>;
  /**
   * Reads what actually reached the carrier for a created shipment (usually from simulator state).
   * Enables the weight and address mapping checks.
   */
  inspectShipment?: (shipment: Shipment) => WireShipmentView | Promise<WireShipmentView>;
  /**
   * Whether a cancelled shipment is cancelled on the carrier side; without it `getShipment` is used.
   * With neither, the cancel check is skipped.
   */
  isCancelled?: (shipment: Shipment) => boolean | Promise<boolean>;
}

/** The carrier-side view of a shipment, in canonical units, for mapping checks. Omitted fields are not checked. */
export interface WireShipmentView {
  /** Total weight the carrier received, in kilograms. */
  weightKg?: number;
  sender?: Partial<Pick<Address, 'country' | 'postalCode' | 'city'>>;
  recipient?: Partial<Pick<Address, 'country' | 'postalCode' | 'city'>>;
}

const WEIGHT_TOLERANCE_KG = 0.001;

export interface ConformanceCheck {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  message?: string;
}

export interface ConformanceReport {
  carrier: string;
  passed: boolean;
  checks: ConformanceCheck[];
}

type AnyAdapter = AdapterBase<Capability> & Record<string, unknown>;

/** Runs the shared adapter checks and returns a report; framework-agnostic. */
export async function checkAdapterConformance(
  adapter: AdapterBase<Capability>,
  scenario: ConformanceScenario = {},
): Promise<ConformanceReport> {
  const a = adapter as AnyAdapter;
  const checks: ConformanceCheck[] = [];
  const has = (c: Capability) => adapter.capabilities instanceof Set && adapter.capabilities.has(c);

  const run = async (name: string, enabled: boolean, body: () => void | Promise<void>) => {
    if (!enabled) {
      checks.push({ name, status: 'skipped' });
      return;
    }
    try {
      await body();
      checks.push({ name, status: 'passed' });
    } catch (error) {
      checks.push({ name, status: 'failed', message: error instanceof Error ? error.message : String(error) });
    }
  };

  await run('declares carrier and capabilities', true, () => {
    assert(typeof adapter.carrier === 'string' && adapter.carrier.length > 0, 'carrier must be a non-empty string');
    assert(adapter.capabilities instanceof Set, 'capabilities must be a Set');
    for (const capability of Array.from(adapter.capabilities) as Capability[]) {
      const methods = CAPABILITY_METHODS[capability];
      assert(methods !== undefined, `unknown capability "${String(capability)}"`);
      for (const method of methods)
        assert(typeof a[method] === 'function', `"${capability}" is declared but ${method}() is missing`);
    }
  });

  await run('tracking policy is well-formed', adapter.trackingPolicy !== undefined, () => {
    const policy = adapter.trackingPolicy!;
    assert(typeof policy.pollingAllowed === 'boolean', 'trackingPolicy.pollingAllowed must be boolean');
    if (policy.maxPerCall !== undefined)
      assert(Number.isInteger(policy.maxPerCall) && policy.maxPerCall > 0, 'maxPerCall must be a positive integer');
    if (policy.minIntervalSec !== undefined) assert(policy.minIntervalSec >= 0, 'minIntervalSec must be >= 0');
  });

  let shipment: Shipment | undefined;
  await run('createShipment returns ids and the carrier slug', has('shipments') && !!scenario.shipment, async () => {
    shipment = (await call(a, 'createShipment', scenario.shipment)) as Shipment;
    assert(isNonEmptyString(shipment?.id), 'shipment.id must be a non-empty string');
    assert(isNonEmptyString(shipment.trackingNumber), 'shipment.trackingNumber must be a non-empty string');
    assert(
      shipment.carrier === adapter.carrier,
      `shipment.carrier must be "${adapter.carrier}", got "${shipment.carrier}"`,
    );
    if (shipment.status !== undefined)
      assert(isTrackingStatus(shipment.status), `shipment.status "${shipment.status}" is not a normalized status`);
    if (shipment.price) assertMoney(shipment.price, 'shipment.price');
  });

  await run('weight and addresses reach the carrier as given', !!shipment && !!scenario.inspectShipment, async () => {
    const view = await scenario.inspectShipment!(shipment!);
    assertWireMatches(view, scenario.shipment!);
  });

  await run(
    'weights in other units are converted to the carrier unit',
    has('shipments') && !!shipment && !!scenario.inspectShipment,
    async () => {
      // Same shipment with every weight expressed in grams: the carrier must receive the same kilograms.
      const input = scenario.shipment!;
      const inGrams: CreateShipmentInput = {
        ...input,
        parcels: input.parcels.map(parcel => ({ ...parcel, weight: { value: toKg(parcel.weight) * 1000, unit: 'g' } })),
      };
      const created = (await call(a, 'createShipment', inGrams)) as Shipment;
      assertWireMatches(await scenario.inspectShipment!(created), input);
    },
  );

  await run(
    'invalid shipment is rejected with CarrierError',
    has('shipments') && !!scenario.invalidShipment,
    async () => {
      const error = await call(a, 'createShipment', scenario.invalidShipment).then(
        () => undefined,
        (e: unknown) => e,
      );
      assert(error !== undefined, 'createShipment accepted an invalid shipment');
      assertCarrierError(error, adapter.carrier);
    },
  );

  await run('getLabel returns a usable label', has('labels') && !!shipment, async () => {
    const label = (await call(a, 'getLabel', {
      shipmentId: shipment!.id,
      trackingNumber: shipment!.trackingNumber,
      ...(scenario.label ?? {}),
    })) as Label;
    assert(['PDF', 'PNG', 'ZPL', 'EPL', 'HTML'].includes(label?.format), `unknown label format "${label?.format}"`);
    if (label.encoding === 'binary') {
      assert(
        label.data instanceof Uint8Array && label.data.length > 0,
        'binary label data must be a non-empty Uint8Array',
      );
      if (label.format === 'PDF') assert(isPdf(label.data), 'PDF label does not start with %PDF');
    } else if (label.encoding === 'base64') {
      assert(isNonEmptyString(label.data) && /^[A-Za-z0-9+/=\s]+$/.test(label.data), 'base64 label data is not base64');
    } else if (label.encoding === 'url') {
      assert(/^https?:\/\//.test(label.data), 'label url must be http(s)');
    } else {
      throw new Error(`unknown label encoding "${(label as { encoding?: string }).encoding}"`);
    }
  });

  await run('track returns normalized results for a created shipment', has('tracking') && !!shipment, async () => {
    const results = (await call(a, 'track', [shipment!.trackingNumber])) as TrackingResult[];
    assert(Array.isArray(results) && results.length === 1, 'track must return one result per tracking number');
    assertTrackingResult(results[0], shipment!.trackingNumber, adapter.carrier);
  });

  await run('delivered shipment tracks as delivered', has('tracking') && !!shipment && !!scenario.deliver, async () => {
    await scenario.deliver!(shipment!);
    const [result] = (await call(a, 'track', [shipment!.trackingNumber])) as TrackingResult[];
    assertTrackingResult(result, shipment!.trackingNumber, adapter.carrier);
    assert(result.status === 'delivered', `expected status "delivered", got "${result.status}"`);
  });

  await run(
    'unknown tracking number is reported, not invented',
    has('tracking') && !!scenario.unknownTrackingNumber,
    async () => {
      const outcome = await call(a, 'track', [scenario.unknownTrackingNumber]).then(
        r => ({ results: r as TrackingResult[] }),
        (e: unknown) => ({ error: e }),
      );
      if ('error' in outcome) {
        assertCarrierError(outcome.error, adapter.carrier);
        assert((outcome.error as { category?: string }).category === 'not_found', 'expected a not_found CarrierError');
      } else {
        assert(
          outcome.results.length === 1 && outcome.results[0].found === false,
          'unknown number must yield found: false',
        );
      }
    },
  );

  await run('getRates returns priced options', has('rates') && !!scenario.rateRequest, async () => {
    const rates = (await call(a, 'getRates', scenario.rateRequest)) as Array<{
      carrier: string;
      service: string;
      total: unknown;
    }>;
    assert(Array.isArray(rates) && rates.length > 0, 'getRates must return at least one rate');
    for (const rate of rates) {
      assert(rate.carrier === adapter.carrier, 'rate.carrier must match the adapter');
      assert(isNonEmptyString(rate.service), 'rate.service must be a non-empty string');
      assertMoney(rate.total, 'rate.total');
    }
  });

  await run('findLocations returns addressed locations', has('locations') && !!scenario.locationQuery, async () => {
    const locations = (await call(a, 'findLocations', scenario.locationQuery)) as Array<{
      id: string;
      name: string;
      carrier: string;
      address?: { country?: string };
    }>;
    assert(Array.isArray(locations), 'findLocations must return an array');
    for (const location of locations) {
      assert(isNonEmptyString(location.id) && isNonEmptyString(location.name), 'location needs id and name');
      assert(location.carrier === adapter.carrier, 'location.carrier must match the adapter');
      assert(/^[A-Z]{2}$/.test(location.address?.country ?? ''), 'location.address.country must be ISO 3166-1 alpha-2');
    }
  });

  // Without a way to read the shipment back, a resolved cancelShipment proves nothing: skip instead of passing.
  const canVerifyCancel = !!scenario.isCancelled || typeof a.getShipment === 'function';
  await run(
    'cancelShipment cancels a fresh shipment',
    has('cancel') && has('shipments') && !!scenario.shipment && canVerifyCancel,
    async () => {
      const fresh = (await call(a, 'createShipment', scenario.shipment)) as Shipment;
      await call(a, 'cancelShipment', fresh.id);
      if (scenario.isCancelled) {
        assert(
          await scenario.isCancelled(fresh),
          'cancelShipment resolved but the carrier still has the shipment active',
        );
      } else {
        const outcome = await call(a, 'getShipment', fresh.id).then(
          r => ({ shipment: r as Shipment }),
          (e: unknown) => ({ error: e }),
        );
        if ('error' in outcome) {
          assertCarrierError(outcome.error, adapter.carrier);
          assert(
            (outcome.error as { category?: string }).category === 'not_found',
            'a cancelled shipment must read as cancelled or not_found',
          );
        } else {
          assert(
            outcome.shipment.status === 'cancelled',
            `a cancelled shipment must have status "cancelled", got "${String(outcome.shipment.status)}"`,
          );
        }
      }
    },
  );

  return { carrier: adapter.carrier, passed: checks.every(c => c.status !== 'failed'), checks };
}

/**
 * Registers the conformance checks as Jest/Vitest tests (uses the global `describe`/`it`/`beforeAll`).
 * Pass a factory so every run starts from a fresh simulator.
 */
export function runAdapterConformance(
  name: string,
  factory: () =>
    | { adapter: AdapterBase<Capability>; scenario?: ConformanceScenario }
    | Promise<{ adapter: AdapterBase<Capability>; scenario?: ConformanceScenario }>,
): void {
  const g = globalThis as unknown as {
    describe: (name: string, fn: () => void) => void;
    it: (name: string, fn: () => void | Promise<void>) => void;
    beforeAll: (fn: () => Promise<void>) => void;
  };
  if (typeof g.describe !== 'function')
    throw new Error('runAdapterConformance needs a test runner with global describe/it');

  g.describe(`${name} adapter conformance`, () => {
    let report: ConformanceReport;
    g.beforeAll(async () => {
      const { adapter, scenario } = await factory();
      report = await checkAdapterConformance(adapter, scenario);
    });
    g.it('passes every applicable check', () => {
      const failed = report.checks.filter(c => c.status === 'failed');
      if (failed.length) {
        throw new Error(
          `Conformance failures for ${report.carrier}:\n${failed.map(c => `  - ${c.name}: ${c.message}`).join('\n')}`,
        );
      }
    });
  });
}

function call(adapter: AnyAdapter, method: string, arg: unknown): Promise<unknown> {
  const fn = adapter[method] as (arg: unknown) => Promise<unknown>;
  return Promise.resolve().then(() => fn.call(adapter, arg));
}

function assertTrackingResult(result: TrackingResult, trackingNumber: string, carrier: string): void {
  assert(result.trackingNumber === trackingNumber, `result.trackingNumber must be "${trackingNumber}"`);
  assert(result.carrier === carrier, 'result.carrier must match the adapter');
  assert(typeof result.found === 'boolean', 'result.found must be boolean');
  assert(
    isTrackingStatus(result.status),
    `result.status "${result.status}" is not one of ${TRACKING_STATUSES.join(', ')}`,
  );
  assert(Array.isArray(result.events), 'result.events must be an array');
  let previous = -Infinity;
  for (const event of result.events) {
    assert(isTrackingStatus(event.status), `event.status "${event.status}" is not a normalized status`);
    assert(isNonEmptyString(event.rawCode), 'event.rawCode must keep the carrier code');
    const at = Date.parse(event.occurredAt);
    assert(!Number.isNaN(at), `event.occurredAt "${event.occurredAt}" is not a date`);
    assert(at >= previous, 'events must be sorted oldest first');
    previous = at;
  }
  if (result.events.length) {
    assert(
      result.status === latestStatus(result.events),
      `result.status "${result.status}" must equal the latest event status`,
    );
  }
}

function assertWireMatches(view: WireShipmentView, input: CreateShipmentInput): void {
  if (view.weightKg !== undefined) {
    const expected = input.parcels.reduce((sum, parcel) => sum + toKg(parcel.weight), 0);
    assert(
      Math.abs(view.weightKg - expected) <= WEIGHT_TOLERANCE_KG,
      `carrier received ${view.weightKg} kg, expected ${expected} kg (weights must be converted to kilograms)`,
    );
  }
  assertAddressMatches(view.sender, input.sender, 'sender');
  assertAddressMatches(view.recipient, input.recipient, 'recipient');
}

function assertAddressMatches(view: WireShipmentView['sender'], party: Party, label: string): void {
  const address = party.point.address;
  if (!view || !address) return;
  for (const field of ['country', 'postalCode', 'city'] as const) {
    if (view[field] === undefined || address[field] === undefined) continue;
    assert(
      view[field] === address[field],
      `${label}.${field}: carrier received "${view[field]}", expected "${address[field]}"`,
    );
  }
}

function assertCarrierError(error: unknown, carrier: string): void {
  const e = error as { name?: string; carrier?: string; category?: string; code?: string };
  assert(
    e?.name === 'CarrierError',
    `expected CarrierError, got ${e?.name ?? typeof error}: ${String((error as Error)?.message ?? error)}`,
  );
  assert(e.carrier === carrier, `CarrierError.carrier must be "${carrier}"`);
  assert(isNonEmptyString(e.code) && isNonEmptyString(e.category), 'CarrierError needs code and category');
}

function assertMoney(value: unknown, label: string): void {
  const m = value as { amount?: unknown; currency?: unknown };
  assert(typeof m?.amount === 'string' && /^-?\d+(\.\d+)?$/.test(m.amount), `${label}.amount must be a decimal string`);
  assert(typeof m.currency === 'string' && /^[A-Z]{3}$/.test(m.currency), `${label}.currency must be ISO 4217`);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function assert(condition: unknown, message: string): asserts condition {
  // Plain truthiness on purpose: callers pass booleans, strings and objects alike.
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!condition) throw new Error(message);
}
