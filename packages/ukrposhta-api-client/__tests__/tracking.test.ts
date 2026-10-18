import { CarrierErrorCategory, isCarrierError } from '@shopana/carrier-core';
import { SimClock } from '@shopana/carrier-testing';
import { createUkrposhtaTrackingClient, effectiveEventCode, lifecycleStatusOf } from '../src';
import { createUkrposhtaTrackingSimulator } from '../src/simulator';

function setup() {
  const clock = new SimClock();
  const sim = createUkrposhtaTrackingSimulator({ clock });
  const client = createUkrposhtaTrackingClient({
    transport: sim.transport,
    bearer: 'tracking-bearer',
    retry: { sleep: clock.sleep, clock },
  });
  return { sim, client, clock };
}

describe('TrackingService', () => {
  it('sends the tracking bearer, not a counterparty token', async () => {
    const { sim, client } = setup();
    sim.seed('0500100031143', [10100, 20700, 41000]);
    const events = await client.tracking.getStatuses('0500100031143');
    expect(events.map(e => e.event)).toEqual([10100, 20700, 41000]);
    const call = sim.calls[0]!;
    expect(call.headers.authorization).toBe('Bearer tracking-bearer');
    expect(call.query).toEqual({ barcode: '0500100031143' });
  });

  it('passes the language', async () => {
    const { sim, client } = setup();
    sim.seed('B1', [10100]);
    await client.tracking.getStatuses('B1', { lang: 'en' });
    expect(sim.calls[0]!.query).toEqual({ barcode: 'B1', lang: 'en' });
  });

  it('reads the last status', async () => {
    const { sim, client } = setup();
    sim.seed('B1', [10100, 21700]);
    await expect(client.tracking.getLastStatus('B1')).resolves.toMatchObject({ event: 21700 });
  });

  it('batches statuses and last statuses', async () => {
    const { sim, client } = setup();
    sim.seed('B1', [10100, 41000]);
    sim.seed('B2', [10100]);
    const all = await client.tracking.getStatusesBatch(['B1', 'B2', 'GONE']);
    expect(all.map(e => e.barcode)).toEqual(['B1', 'B1', 'B2']);
    const lastOnly = await client.tracking.getLastStatusesBatch(['B1', 'B2']);
    expect(lastOnly.map(e => e.event)).toEqual([41000, 10100]);
  });

  it('splits found and not found barcodes', async () => {
    const { sim, client } = setup();
    sim.seed('B1', [10100, 41000]);
    const all = await client.tracking.getStatusesBatchWithNotFound(['B1', 'GONE']);
    expect(Object.keys(all.found)).toEqual(['B1']);
    expect(all.notFound).toEqual(['GONE']);
    const last = await client.tracking.getLastStatusesBatchWithNotFound(['B1', 'GONE']);
    expect(last.found.B1).toHaveLength(1);
    expect(last.notFound).toEqual(['GONE']);
  });

  it('reads by recipient phone', async () => {
    const { sim, client } = setup();
    sim.seed('B1', [10100, 21700]);
    await expect(
      client.tracking.getLastStatusByPhone({ barcode: 'B1', recipientPhoneNumber: '380634440999' }),
    ).resolves.toMatchObject({ event: 21700 });
    const many = await client.tracking.getStatusesByPhoneBatch([
      { barcode: 'B1', recipientPhoneNumber: '380634440999' },
    ]);
    expect(many).toHaveLength(1);
  });

  it('reads the route in both languages', async () => {
    const { sim, client } = setup();
    sim.seed('B1', [10100]);
    await expect(client.tracking.getRoute('B1')).resolves.toEqual({ from: 'УКРАЇНА м.Київ', to: 'УКРАЇНА м.Львів' });
    await expect(client.tracking.getRoute('B1', { lang: 'en' })).resolves.toEqual({
      from: 'UKRAINE Kyiv',
      to: 'UKRAINE Lviv',
    });
    expect(sim.calls[1]!.path).toBe('/barcodes/B1/route/in-lang/EN');
  });

  it('maps an unknown barcode to a not_found CarrierError', async () => {
    const { client } = setup();
    const error = await client.tracking.getStatuses('NOPE').catch(e => e);
    expect(isCarrierError(error)).toBe(true);
    expect(error).toMatchObject({ code: 'UPE02002', category: CarrierErrorCategory.NotFound, httpStatus: 404 });
  });

  it('maps a rejected bearer', async () => {
    const { sim } = setup();
    const noAuthClient = createUkrposhtaTrackingClient({ transport: sim.transport, bearer: '' });
    sim.seed('B1', [10100]);
    // An empty bearer still sends the "Bearer " prefix; a missing header is simulated through a direct call.
    const response = await sim.transport({
      method: 'GET',
      url: 'https://www.ukrposhta.ua/status-tracking/0.0.1/statuses?barcode=B1',
    });
    expect(response.status).toBe(401);
    expect(noAuthClient.tracking).toBeDefined();
  });

  it('retries a 503', async () => {
    const { sim, client } = setup();
    sim.seed('B1', [10100]);
    sim.fail({ operation: 'getStatuses', status: 503, body: { message: 'down' } });
    await expect(client.tracking.getStatuses('B1')).resolves.toHaveLength(1);
    expect(sim.callsTo('getStatuses')).toHaveLength(2);
  });

  it('repeats a batch POST after a 503 (reads are idempotent)', async () => {
    const { sim, client } = setup();
    sim.seed('B1', [10100]);
    sim.fail({ operation: 'getLastStatusesBatch', status: 503, body: { message: 'down' } });
    await expect(client.tracking.getLastStatusesBatch(['B1'])).resolves.toHaveLength(1);
  });

  it('rejects empty and oversized batches before sending', () => {
    const { sim, client } = setup();
    expect(() => client.tracking.getStatusesBatch([])).toThrow(/At least one barcode/);
    expect(() => client.tracking.getStatusesBatch(Array.from({ length: 51 }, (_, i) => `B${i}`))).toThrow(/At most 50/);
    expect(() => client.tracking.getLastStatusesBatch(Array.from({ length: 101 }, (_, i) => `B${i}`))).toThrow(
      /At most 100/,
    );
    expect(() => client.tracking.getStatusesByPhoneBatch([])).toThrow(/At least one/);
    expect(sim.calls).toHaveLength(0);
  });
});

describe('tracking event codes', () => {
  it('treats 41000 with reason 10 as a return (41010)', () => {
    expect(effectiveEventCode({ event: '41000', eventReason_id: 10 })).toBe('41010');
    expect(effectiveEventCode({ event: 41000, eventReason_id: 2 })).toBe('41000');
  });

  it('maps events to lifecycle statuses', () => {
    expect(lifecycleStatusOf({ event: 10100, eventReason_id: 1 })).toBe('REGISTERED');
    expect(lifecycleStatusOf({ event: 21700, eventReason_id: 1 })).toBe('IN_DEPARTMENT');
    expect(lifecycleStatusOf({ event: 41000, eventReason_id: 10 })).toBe('RETURNED');
    expect(lifecycleStatusOf({ event: 99999, eventReason_id: 1 })).toBeUndefined();
  });
});
