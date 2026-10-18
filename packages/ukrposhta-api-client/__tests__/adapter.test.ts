import { runAdapterConformance, SimClock } from '@shopana/carrier-testing';
import { createUkrposhtaAdapter, kyivLocalToIso, ukrposhtaStatusMap } from '../src/adapter';
import { createUkrposhtaTrackingClient } from '../src';
import { createUkrposhtaTrackingSimulator } from '../src/simulator';

function setup() {
  const clock = new SimClock();
  const sim = createUkrposhtaTrackingSimulator({ clock });
  const tracking = createUkrposhtaTrackingClient({
    transport: sim.transport,
    bearer: 'tracking-bearer',
    retry: { sleep: clock.sleep, clock },
  });
  return { sim, adapter: createUkrposhtaAdapter({ tracking }) };
}

describe('Ukrposhta adapter: tracking', () => {
  it('normalizes statuses and keeps raw codes, oldest first', async () => {
    const { sim, adapter } = setup();
    sim.seed('B1', [10100, 21700, { event: 41000, eventReason_id: 2 }]);
    const [result] = await adapter.track(['B1']);
    expect(result).toMatchObject({ trackingNumber: 'B1', carrier: 'ukrposhta', status: 'delivered', found: true });
    expect(result!.events.map(e => [e.rawCode, e.status])).toEqual([
      ['10100', 'in_transit'],
      ['21700', 'available_for_pickup'],
      ['41000', 'delivered'],
    ]);
  });

  it('recognises a return to the sender (41000 + reason 10)', async () => {
    const { sim, adapter } = setup();
    sim.seed('B1', [10100, { event: '41000', eventReason_id: 10 }]);
    const [result] = await adapter.track(['B1']);
    expect(result!.status).toBe('returned');
    expect(result!.events.at(-1)!.rawCode).toBe('41010');
  });

  it('reports unknown numbers as not found without failing the rest', async () => {
    const { sim, adapter } = setup();
    sim.seed('B1', [10100]);
    const results = await adapter.track(['B1', 'GONE', 'B1']);
    expect(results.map(r => [r.trackingNumber, r.found])).toEqual([
      ['B1', true],
      ['GONE', false],
      ['B1', true],
    ]);
  });

  it('chunks more than 50 numbers and asks once per number', async () => {
    const { sim, adapter } = setup();
    const numbers = Array.from({ length: 120 }, (_, i) => `B${i}`);
    numbers.forEach(n => sim.seed(n, [10100]));
    const results = await adapter.track(numbers);
    expect(results).toHaveLength(120);
    expect(sim.callsTo('getStatusesBatchWithNotFound')).toHaveLength(3);
  });

  it('puts event times on the Kyiv offset', async () => {
    const { sim, adapter } = setup();
    sim.seed('B1', [
      { event: 10100, date: '2026-07-27T16:33:00' },
      { event: 41000, date: '2026-01-15T10:00:00' },
    ]);
    const [result] = await adapter.track(['B1']);
    expect(result!.events.map(e => e.occurredAt).sort()).toEqual([
      '2026-01-15T10:00:00+02:00',
      '2026-07-27T16:33:00+03:00',
    ]);
  });

  it('keeps unknown codes as unknown', () => {
    expect(ukrposhtaStatusMap('12345')).toBe('unknown');
  });
});

describe('kyivLocalToIso', () => {
  it('uses +02:00 in winter and +03:00 in summer', () => {
    expect(kyivLocalToIso('2026-01-10T08:00:00')).toBe('2026-01-10T08:00:00+02:00');
    expect(kyivLocalToIso('2026-07-10T08:00:00')).toBe('2026-07-10T08:00:00+03:00');
  });

  it('handles the daylight saving switch days', () => {
    expect(kyivLocalToIso('2026-03-29T02:00:00')).toMatch(/\+0[23]:00$/);
    expect(kyivLocalToIso('2026-03-29T12:00:00')).toBe('2026-03-29T12:00:00+03:00');
    expect(kyivLocalToIso('2026-10-25T12:00:00')).toBe('2026-10-25T12:00:00+02:00');
  });

  it('leaves unparseable input alone', () => {
    expect(kyivLocalToIso('yesterday')).toBe('yesterday');
  });
});

runAdapterConformance('Ukrposhta', () => {
  const { sim, adapter } = setup();
  sim.seed('TN1', [10100]);
  return { adapter, scenario: { unknownTrackingNumber: 'NOPE' } };
});
