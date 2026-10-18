// code and comments in English
// Test-only entry point: depends on @shopana/carrier-testing.
import { SimClock, SimStore, createSimulator, httpError, json } from '@shopana/carrier-testing';
import { DEMOPOST_BASE_URLS } from '../contract/config';
import { demoPostContract } from './contract';

export { demoPostContract } from './contract';

interface ShipmentRow {
  trackingNumber: string;
  events: Array<{ code: string; date: string }>;
}

/** Contract simulator for Demo Post. Handlers hold only business logic; validation comes from the contract. */
export function createDemoPostSimulator(options: { clock?: SimClock; state?: SimStore; baseUrl?: string } = {}) {
  const clock = options.clock ?? new SimClock();
  const state = options.state ?? new SimStore();
  const shipments = state.collection<ShipmentRow>('shipments');

  const sim = createSimulator({
    contract: demoPostContract,
    baseUrl: options.baseUrl ?? [DEMOPOST_BASE_URLS.production, DEMOPOST_BASE_URLS.sandbox],
    clock,
    state,
    auth: ctx =>
      ctx.headers.authorization?.startsWith('Bearer ')
        ? undefined
        : { status: 401, body: { code: 'UNAUTHORIZED', message: 'Missing bearer token' } },
    invalidRequest: issues => ({
      status: 400,
      body: { code: 'VALIDATION', message: issues[0].message, field: issues[0].field },
    }),
    handlers: {
      getTracking: ctx => {
        const row = shipments.get(String(ctx.params.trackingNumber));
        if (!row) throw httpError(404, { code: 'NOT_FOUND', message: 'Unknown tracking number' });
        return json(row.events);
      },
    },
  });

  /** Seeds a shipment with events, for tests. */
  const seed = (trackingNumber: string, codes: string[]) => {
    const events = codes.map(code => {
      clock.advance(3_600_000);
      return { code, date: clock.toISOString() };
    });
    return shipments.upsert(trackingNumber, { trackingNumber, events });
  };

  return Object.assign(sim, { seed });
}
