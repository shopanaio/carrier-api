import { defineAdapter, latestStatus } from '../src';
import type { TrackingResult } from '../src';

describe('latestStatus with unparseable dates', () => {
  it('never lets an unparseable date beat a real one', () => {
    expect(
      latestStatus([
        { status: 'created', occurredAt: 'not a date' },
        { status: 'delivered', occurredAt: '2026-10-01T00:00:00Z' },
        { status: 'in_transit', occurredAt: '' },
      ]),
    ).toBe('delivered');
  });

  it('falls back to the last event when no date parses', () => {
    expect(
      latestStatus([
        { status: 'created', occurredAt: 'x' },
        { status: 'in_transit', occurredAt: 'y' },
      ]),
    ).toBe('in_transit');
  });
});

describe('defineAdapter with own getters', () => {
  it('keeps an own getter live instead of reading it once', () => {
    let maxPerCall = 5;
    const adapter = defineAdapter({
      carrier: 'demo',
      capabilities: ['tracking'],
      get trackingPolicy() {
        return { pollingAllowed: true, maxPerCall };
      },
      track: async (): Promise<TrackingResult[]> => [],
    });
    expect(adapter.trackingPolicy?.maxPerCall).toBe(5);
    maxPerCall = 10;
    expect(adapter.trackingPolicy?.maxPerCall).toBe(10);
  });
});
