import { CarrierError } from '@shopana/carrier-core';
import { checkAdapterConformance, runAdapterConformance, SimClock, isPdf } from '../src';
import { createDemoAdapter, createDemoClient, createDemoSimulator, sampleShipment } from './fixtures/demoCarrier';

function setup(options: { tokenTtlSec?: number } = {}) {
  const clock = new SimClock();
  const sim = createDemoSimulator({ clock, ...options });
  const client = createDemoClient({ transport: sim.transport, clock });
  return { clock, sim, client, adapter: createDemoAdapter(client) };
}

describe('demo carrier against its simulator', () => {
  it('runs the full flow: auth → create → label → track → deliver', async () => {
    const { sim, client } = setup();
    const created = await client.shipments.create({
      sender: { name: 'Shop', phone: '+380501112233', branchId: 'b-1' },
      receiver: { name: 'Olena', phone: '+380671234567', branchId: 'b-3' },
      weight: 1.2,
    });
    expect(created).toMatchObject({ barcode: '0500000000001', status: 'CREATED', cost: 70 });

    const label = await client.shipments.label(created.id, 'A5');
    expect(label.contentType).toBe('application/pdf');
    expect(isPdf(label.data)).toBe(true);

    sim.advance(created.id, 'DELIVERED');
    const events = await client.tracking.byBarcode(created.barcode);
    expect(events.map(e => e.eventCode)).toEqual(['100', '200', '300', '400', '500']);

    expect(sim.callsTo('auth')).toHaveLength(1);
    expect(sim.calls.every(c => c.operationId !== 'label' || c.headers.token === 'tok-1')).toBe(true);
  });

  it('answers contract violations the way the carrier would, as CarrierError', async () => {
    const { sim, client } = setup();
    const error = await client.shipments
      .create({ sender: { name: 'Shop', phone: '0501112233', branchId: 'b-1' }, receiver: { name: 'O', phone: '+380671234567', branchId: 'b-3' }, weight: 1 })
      .catch(e => e);
    expect(error).toBeInstanceOf(CarrierError);
    expect(error).toMatchObject({ carrier: 'demo', category: 'validation', httpStatus: 400, field: 'phone' });
    expect(sim.calls.at(-1)).toMatchObject({ outcome: 'invalid' });

    const extra = await client.shipments.create({ sender: {}, receiver: {}, weight: 1, oops: true } as never).catch(e => e);
    expect(extra.raw.info.messageDetails.join(' ')).toMatch(/must NOT have additional properties|must have required property/);
  });

  it('refreshes an expired token once and retries the call', async () => {
    const { sim, client, clock } = setup({ tokenTtlSec: 3600 });
    await client.branches.list('Kyiv');
    const created = await client.shipments.create({ sender: { name: 'S', phone: '+380501112233', branchId: 'b-1' }, receiver: { name: 'R', phone: '+380501112234', branchId: 'b-2' }, weight: 2 });

    clock.advance(3_590_000); // inside the client's 60 s refresh skew, still valid on the server
    await client.shipments.get(created.id);
    expect(sim.callsTo('refreshToken')).toHaveLength(1);

    // Server-side revocation: the client still thinks the token is valid → 401 → refresh → retry.
    sim.state.collection('tokens').clear();
    await client.shipments.get(created.id);
    expect(sim.callsTo('refreshToken')).toHaveLength(2);
    expect(sim.callsTo('getShipment').map(c => c.status)).toEqual([200, 401, 200]);
    expect(sim.callsTo('auth')).toHaveLength(1);
  });

  it('falls back to a full login when the refresh token is rejected', async () => {
    const { sim, client } = setup();
    await client.tracking.byBarcode('x').catch(() => undefined);
    sim.state.collection('tokens').clear();
    sim.state.collection('refreshTokens').clear();
    await client.tracking.byBarcode('x').catch(() => undefined);
    expect(sim.callsTo('auth')).toHaveLength(2);
  });

  it('retries 5xx on GET but not on shipment creation', async () => {
    const { sim, client } = setup();
    await client.branches.list('Kyiv');
    sim.fail({ operation: 'branches', status: 503, times: 2 });
    expect(await client.branches.list('Lviv')).toHaveLength(1);
    expect(sim.callsTo('branches').map(c => c.status)).toEqual([200, 503, 503, 200]);

    sim.fail({ operation: 'POST /shipments', status: 502, body: { status: 'Error', info: { fieldName: null, message: 'Bad gateway' } } });
    const error = await client.shipments.create({ sender: { name: 'S', phone: '+380501112233', branchId: 'b-1' }, receiver: { name: 'R', phone: '+380501112234', branchId: 'b-2' }, weight: 1 }).catch(e => e);
    expect(error).toMatchObject({ category: 'server', retryable: true, httpStatus: 502 });
    expect(sim.callsTo('createShipment')).toHaveLength(1);
  });

  it('enforces the per-token rate limit with Retry-After, and the client waits it out', async () => {
    const { sim, client, clock } = setup();
    const start = clock.now();
    for (let i = 0; i < 101; i += 1) await client.tracking.byBarcode('none').catch(() => undefined);
    const limited = sim.calls.filter(c => c.outcome === 'rate_limited');
    expect(limited).toHaveLength(1);
    expect(sim.callsTo('tracking')).toHaveLength(102);
    expect(clock.now() - start).toBeGreaterThanOrEqual(60_000);
  });

  it('maps a deleted-after-registration attempt to a business error', async () => {
    const { sim, adapter } = setup();
    const shipment = await adapter.createShipment(sampleShipment);
    sim.advance(shipment.id, 'REGISTERED');
    await expect(adapter.cancelShipment(shipment.id)).rejects.toMatchObject({ httpStatus: 409, field: 'status' });
  });
});

describe('conformance', () => {
  it('reports every check for the demo adapter', async () => {
    const { sim, adapter } = setup();
    const report = await checkAdapterConformance(adapter, {
      shipment: sampleShipment,
      invalidShipment: { ...sampleShipment, parcels: [{ weight: { value: 99, unit: 'kg' } }] },
      label: { size: 'A4' },
      rateRequest: { sender: sampleShipment.sender, recipient: sampleShipment.recipient, parcels: sampleShipment.parcels },
      locationQuery: { city: 'Kyiv', limit: 5 },
      unknownTrackingNumber: '0599999999999',
      deliver: s => sim.advance(s.id, 'DELIVERED'),
      inspectShipment: s => ({ weightKg: sim.shipments.require(s.id).weight }),
      isCancelled: s => sim.shipments.require(s.id).status === 'CANCELLED',
    });
    expect(report.checks.filter(c => c.status === 'failed')).toEqual([]);
    expect(report.checks.filter(c => c.status === 'skipped')).toEqual([]);
    expect(report.passed).toBe(true);
  });
});

runAdapterConformance('demo', () => {
  const { sim, adapter } = setup();
  return { adapter, scenario: { shipment: sampleShipment, deliver: s => sim.advance(s.id, 'DELIVERED') } };
});
