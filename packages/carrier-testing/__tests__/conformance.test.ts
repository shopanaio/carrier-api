import { CarrierError, CarrierErrorCategory } from '@shopana/carrier-core';
import type { AdapterBase, Capability, CreateShipmentInput } from '@shopana/carrier-contracts';
import { checkAdapterConformance, minimalPdf } from '../src';

const shipment = {} as CreateShipmentInput;
const base = (capabilities: Capability[], methods: Record<string, unknown>) =>
  ({ carrier: 'x', capabilities: new Set(capabilities), ...methods }) as unknown as AdapterBase<Capability>;

const failures = async (adapter: AdapterBase<Capability>, scenario: Parameters<typeof checkAdapterConformance>[1] = {}) =>
  (await checkAdapterConformance(adapter, scenario)).checks.filter(c => c.status === 'failed').map(c => `${c.name}: ${c.message}`);

describe('checkAdapterConformance catches broken adapters', () => {
  it('declarations and tracking policy', async () => {
    expect(await failures(base(['labels'], {}))).toEqual(['declares carrier and capabilities: "labels" is declared but getLabel() is missing']);
    expect(await failures({ carrier: '', capabilities: [] } as never)).toEqual(['declares carrier and capabilities: carrier must be a non-empty string']);
    expect(await failures({ carrier: 'x', capabilities: [] } as never)).toEqual(['declares carrier and capabilities: capabilities must be a Set']);
    expect(await failures(base(['teleport' as Capability], {}))).toEqual(['declares carrier and capabilities: unknown capability "teleport"']);
    expect(await failures({ ...base([], {}), trackingPolicy: { pollingAllowed: 'yes' } } as never)).toHaveLength(1);
    expect(await failures({ ...base([], {}), trackingPolicy: { pollingAllowed: true, maxPerCall: 0 } } as never)).toHaveLength(1);
    expect(await failures({ ...base([], {}), trackingPolicy: { pollingAllowed: true, minIntervalSec: -1 } } as never)).toHaveLength(1);
  });

  it('shipments, labels and tracking shape', async () => {
    const createShipment = async () => ({ id: 's1', trackingNumber: 't1', carrier: 'x', status: 'bogus', price: { amount: '1.5', currency: 'UAH' } });
    expect(await failures(base(['shipments'], { createShipment }), { shipment })).toEqual([
      'createShipment returns ids and the carrier slug: shipment.status "bogus" is not a normalized status',
    ]);
    expect(await failures(base(['shipments'], { createShipment: async () => ({ id: 's', trackingNumber: 't', carrier: 'y' }) }), { shipment })).toHaveLength(1);
    expect(await failures(base(['shipments'], { createShipment: async () => ({ id: 's', trackingNumber: 't', carrier: 'x', price: { amount: 1, currency: 'UAH' } }) }), { shipment })).toEqual([
      'createShipment returns ids and the carrier slug: shipment.price.amount must be a decimal string',
    ]);

    const good = async () => ({ id: 's1', trackingNumber: 't1', carrier: 'x' });
    const label = (value: unknown) => base(['shipments', 'labels'], { createShipment: good, getLabel: async () => value });
    expect(await failures(label({ format: 'PDF', encoding: 'binary', data: new Uint8Array([1, 2, 3, 4, 5]) }), { shipment })).toEqual([
      'getLabel returns a usable label: PDF label does not start with %PDF',
    ]);
    expect(await failures(label({ format: 'PDF', encoding: 'binary', data: minimalPdf() }), { shipment })).toEqual([]);
    expect(await failures(label({ format: 'ZPL', encoding: 'base64', data: '^XA' }), { shipment })).toHaveLength(1);
    expect(await failures(label({ format: 'ZPL', encoding: 'base64', data: 'XlhB' }), { shipment })).toEqual([]);
    expect(await failures(label({ format: 'PDF', encoding: 'url', data: 'ftp://x' }), { shipment })).toHaveLength(1);
    expect(await failures(label({ format: 'PDF', encoding: 'url', data: 'https://x' }), { shipment })).toEqual([]);
    expect(await failures(label({ format: 'PDF', encoding: 'smoke', data: '' }), { shipment })).toEqual(['getLabel returns a usable label: unknown label encoding "smoke"']);
    expect(await failures(label({ format: 'GIF', encoding: 'url', data: 'https://x' }), { shipment })).toHaveLength(1);

    const track = (result: unknown) => base(['shipments', 'tracking'], { createShipment: good, track: async () => [result] });
    const ev = (status: string, at: string, rawCode = '1') => ({ status, rawCode, occurredAt: at });
    expect(await failures(track({ trackingNumber: 't1', carrier: 'x', status: 'delivered', found: true, events: [ev('delivered', '2026-01-02'), ev('in_transit', '2026-01-01')] }), { shipment })).toEqual([
      'track returns normalized results for a created shipment: events must be sorted oldest first',
    ]);
    expect(await failures(track({ trackingNumber: 't1', carrier: 'x', status: 'in_transit', found: true, events: [ev('delivered', '2026-01-02')] }), { shipment })).toHaveLength(1);
    expect(await failures(track({ trackingNumber: 't1', carrier: 'x', status: 'delivered', found: true, events: [ev('delivered', 'yesterday')] }), { shipment })).toHaveLength(1);
    expect(await failures(track({ trackingNumber: 't1', carrier: 'x', status: 'delivered', found: true, events: [ev('delivered', '2026-01-01', '')] }), { shipment })).toHaveLength(1);
    expect(await failures(track({ trackingNumber: 't1', carrier: 'x', status: 'delivered', found: true, events: [ev('gone', '2026-01-01')] }), { shipment })).toHaveLength(1);
    expect(await failures(track({ trackingNumber: 't2', carrier: 'x', status: 'unknown', found: false, events: [] }), { shipment })).toHaveLength(1);
    expect(await failures(track({ trackingNumber: 't1', carrier: 'x', status: 'unknown', found: 'no', events: [] }), { shipment })).toHaveLength(1);
    expect(await failures(track({ trackingNumber: 't1', carrier: 'x', status: 'nope', found: true, events: [] }), { shipment })).toHaveLength(1);
    expect(await failures(track({ trackingNumber: 't1', carrier: 'x', status: 'unknown', found: true, events: null }), { shipment })).toHaveLength(1);
    expect(
      await failures(track({ trackingNumber: 't1', carrier: 'x', status: 'in_transit', found: true, events: [ev('in_transit', '2026-01-01')] }), {
        shipment,
        deliver: () => undefined,
      }),
    ).toEqual(['delivered shipment tracks as delivered: expected status "delivered", got "in_transit"']);
  });

  it('errors, unknown numbers, rates, locations and cancel', async () => {
    const carrierError = (category: CarrierErrorCategory, carrier = 'x') => new CarrierError({ carrier, code: 'E', message: 'm', category });
    const accepting = base(['shipments'], { createShipment: async () => ({ id: 's', trackingNumber: 't', carrier: 'x' }) });
    expect(await failures(accepting, { invalidShipment: shipment })).toEqual(['invalid shipment is rejected with CarrierError: createShipment accepted an invalid shipment']);
    const plainError = base(['shipments'], { createShipment: async () => { throw new Error('boom'); } });
    expect((await failures(plainError, { invalidShipment: shipment }))[0]).toMatch(/expected CarrierError, got Error: boom/);
    const wrongCarrier = base(['shipments'], { createShipment: async () => { throw carrierError(CarrierErrorCategory.Validation, 'y'); } });
    expect(await failures(wrongCarrier, { invalidShipment: shipment })).toHaveLength(1);

    const trackThrows = (category: CarrierErrorCategory) => base(['tracking'], { track: async () => { throw carrierError(category); } });
    expect(await failures(trackThrows(CarrierErrorCategory.NotFound), { unknownTrackingNumber: 'z' })).toEqual([]);
    expect(await failures(trackThrows(CarrierErrorCategory.Server), { unknownTrackingNumber: 'z' })).toHaveLength(1);
    expect(await failures(base(['tracking'], { track: async () => [{ found: true }] }), { unknownTrackingNumber: 'z' })).toHaveLength(1);

    const rates = (value: unknown) => base(['rates'], { getRates: async () => value });
    const rateRequest = {} as never;
    expect(await failures(rates([]), { rateRequest })).toHaveLength(1);
    expect(await failures(rates([{ carrier: 'x', service: '', total: { amount: '1', currency: 'UAH' } }]), { rateRequest })).toHaveLength(1);
    expect(await failures(rates([{ carrier: 'x', service: 's', total: { amount: '1', currency: 'uah' } }]), { rateRequest })).toHaveLength(1);
    expect(await failures(rates([{ carrier: 'y', service: 's', total: { amount: '1', currency: 'UAH' } }]), { rateRequest })).toHaveLength(1);

    const locations = (value: unknown) => base(['locations'], { findLocations: async () => value });
    const locationQuery = {};
    expect(await failures(locations({}), { locationQuery })).toHaveLength(1);
    expect(await failures(locations([{ id: '1', name: 'n', carrier: 'x', address: { country: 'Ukraine' } }]), { locationQuery })).toHaveLength(1);
    expect(await failures(locations([{ id: '', name: 'n', carrier: 'x', address: { country: 'UA' } }]), { locationQuery })).toHaveLength(1);
    expect(await failures(locations([{ id: '1', name: 'n', carrier: 'y', address: { country: 'UA' } }]), { locationQuery })).toHaveLength(1);

    const cancel = base(['shipments', 'cancel'], { createShipment: async () => ({ id: 's', trackingNumber: 't', carrier: 'x' }), cancelShipment: async () => { throw new Error('nope'); } });
    expect(await failures(cancel, { shipment, isCancelled: () => true })).toEqual(['cancelShipment cancels a fresh shipment: nope']);
  });

  it('weight and address mapping', async () => {
    const input = {
      sender: { contact: {}, point: { type: 'door', address: { country: 'UA', city: 'Kyiv', postalCode: '01001' } } },
      recipient: { contact: {}, point: { type: 'door', address: { country: 'UA', city: 'Lviv', postalCode: '79000' } } },
      parcels: [{ weight: { value: 1.5, unit: 'kg' } }, { weight: { value: 500, unit: 'g' } }],
    } as CreateShipmentInput;
    const received: Record<string, number> = {};
    const adapterSumming = (toKgValue: (w: { value: number; unit: string }) => number) =>
      base(['shipments'], {
        createShipment: async (s: CreateShipmentInput) => {
          const id = `s${Object.keys(received).length + 1}`;
          received[id] = s.parcels.reduce((sum, p) => sum + toKgValue(p.weight), 0);
          return { id, trackingNumber: id, carrier: 'x' };
        },
      });
    const inspectShipment = (s: { id: string }) => ({ weightKg: received[s.id], recipient: { city: 'Lviv', country: 'UA' } });

    const correct = adapterSumming(w => (w.unit === 'g' ? w.value / 1000 : w.value));
    expect(await failures(correct, { shipment: input, inspectShipment })).toEqual([]);

    // Sends weight.value as is, ignoring the unit: 1.5 kg + 500 g becomes 501.5 "kg".
    const ignoresUnits = adapterSumming(w => w.value);
    const reported = await failures(ignoresUnits, { shipment: input, inspectShipment });
    expect(reported).toHaveLength(2);
    expect(reported[0]).toMatch(/carrier received 501.5 kg, expected 2 kg/);

    const wrongCity = await failures(correct, { shipment: input, inspectShipment: s => ({ ...inspectShipment(s), recipient: { city: 'Odesa' } }) });
    expect(wrongCity[0]).toMatch(/recipient.city: carrier received "Odesa", expected "Lviv"/);
  });

  it('cancel is verified on the carrier side', async () => {
    const createShipment = async () => ({ id: 's', trackingNumber: 't', carrier: 'x' });
    const cancelShipment = async () => undefined;
    const noop = base(['shipments', 'cancel'], { createShipment, cancelShipment });
    expect(await failures(noop, { shipment, isCancelled: () => false })).toEqual([
      'cancelShipment cancels a fresh shipment: cancelShipment resolved but the carrier still has the shipment active',
    ]);
    expect(await failures(noop, { shipment, isCancelled: () => true })).toEqual([]);

    // Neither isCancelled nor getShipment: the check is skipped, not vacuously passed.
    const report = await checkAdapterConformance(noop, { shipment });
    expect(report.checks.find(c => c.name === 'cancelShipment cancels a fresh shipment')).toMatchObject({ status: 'skipped' });

    const withGet = (getShipment: () => Promise<unknown>) => base(['shipments', 'cancel'], { createShipment, cancelShipment, getShipment });
    expect(await failures(withGet(async () => ({ id: 's', trackingNumber: 't', carrier: 'x', status: 'cancelled' })), { shipment })).toEqual([]);
    expect(await failures(withGet(async () => ({ id: 's', trackingNumber: 't', carrier: 'x', status: 'pre_transit' })), { shipment })).toHaveLength(1);
    const notFound = new CarrierError({ carrier: 'x', code: 'NF', message: 'gone', category: CarrierErrorCategory.NotFound });
    expect(await failures(withGet(async () => { throw notFound; }), { shipment })).toEqual([]);
  });
});

describe('runAdapterConformance', () => {
  it('requires a test runner', () => {
    const g = globalThis as { describe?: unknown };
    const saved = g.describe;
    g.describe = undefined;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { runAdapterConformance } = require('../src');
      expect(() => runAdapterConformance('x', () => ({ adapter: base([], {}) }))).toThrow('needs a test runner');
    } finally {
      g.describe = saved;
    }
  });
});
