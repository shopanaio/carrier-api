import { isPdf, Lifecycle, minimalPdf, SimClock, SimHttpError, SimStore } from '../src';

describe('SimStore', () => {
  it('stores rows per collection with deterministic ids', () => {
    const store = new SimStore();
    const shipments = store.collection<{ id: string; status: string }>('shipments');
    const id = store.ids.uuid('shipment');
    expect(id).toMatch(/^[0-9a-f]{8}-0000-4000-8000-000000000001$/);
    expect(store.ids.uuid('shipment')).toMatch(/-000000000002$/);
    expect(store.ids.sequence('barcode', { prefix: '05', pad: 11 })).toBe('0500000000001');
    expect(store.ids.sequence('n', { start: 100 })).toBe('100');

    shipments.insert(id, { id, status: 'CREATED' });
    expect(() => shipments.insert(id, { id, status: 'x' })).toThrow('duplicate id');
    expect(shipments.update(id, { status: 'REGISTERED' }).status).toBe('REGISTERED');
    expect(shipments.update(id, row => ({ ...row, status: 'DELIVERED' })).status).toBe('DELIVERED');
    shipments.upsert('2', { id: '2', status: 'CREATED' });
    expect(shipments.has('2')).toBe(true);
    expect(shipments.find(r => r.status === 'CREATED')!.id).toBe('2');
    expect(shipments.filter(() => true)).toHaveLength(2);
    expect(store.collection('shipments')).toBe(shipments);

    expect(() => shipments.require('missing')).toThrow(SimHttpError);
    expect(() => shipments.require('missing', () => new Error('custom'))).toThrow('custom');
    expect(shipments.delete('2')).toBe(true);
    store.reset();
    expect(shipments.size).toBe(0);
    expect(store.ids.sequence('barcode')).toBe('1');
  });
});

describe('Lifecycle', () => {
  const lifecycle = new Lifecycle<'CREATED' | 'REGISTERED' | 'DELIVERING' | 'DELIVERED' | 'CANCELLED' | 'RETURNED'>({
    CREATED: ['REGISTERED', 'CANCELLED'],
    REGISTERED: ['DELIVERING'],
    DELIVERING: ['DELIVERED', 'RETURNED'],
    DELIVERED: [],
    CANCELLED: [],
    RETURNED: [],
  });

  it('checks transitions and finds the shortest path', () => {
    expect(lifecycle.canTransition('CREATED', 'CANCELLED')).toBe(true);
    expect(lifecycle.canTransition('REGISTERED', 'CANCELLED')).toBe(false);
    expect(() => lifecycle.assertTransition('DELIVERED', 'CREATED')).toThrow('Illegal transition DELIVERED → CREATED');
    lifecycle.assertTransition('CREATED', 'REGISTERED');
    expect(lifecycle.path('CREATED', 'DELIVERED')).toEqual(['REGISTERED', 'DELIVERING', 'DELIVERED']);
    expect(lifecycle.path('CREATED', 'CREATED')).toEqual([]);
    expect(() => lifecycle.path('DELIVERED', 'CREATED')).toThrow('not reachable');
    expect(lifecycle.isFinal('RETURNED')).toBe(true);
    expect(lifecycle.isFinal('CREATED')).toBe(false);
  });
});

describe('SimClock and PDFs', () => {
  it('moves only forward and formats ISO time', async () => {
    const clock = new SimClock(new Date('2026-10-18T00:00:00Z'));
    clock.advance(1000);
    expect(clock.toISOString()).toBe('2026-10-18T00:00:01.000Z');
    await clock.sleep(-5);
    expect(() => clock.advance(-1)).toThrow(RangeError);
    clock.set(new Date('2027-01-01T00:00:00Z'));
    clock.set(0);
    expect(clock.now()).toBe(0);
  });

  it('builds a minimal PDF', () => {
    const pdf = new TextDecoder().decode(minimalPdf('label (05)'));
    expect(pdf.startsWith('%PDF-1.4')).toBe(true);
    expect(pdf).toContain('(label 05)');
    expect(pdf.trimEnd().endsWith('%%EOF')).toBe(true);
    expect(isPdf(new Uint8Array([1, 2, 3, 4, 5]))).toBe(false);
  });
});
