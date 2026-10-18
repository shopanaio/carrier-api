import { CarrierErrorCategory, isCarrierError } from '@shopana/carrier-core';
import { createUkrposhtaTrackingClient, effectiveEventCode, lifecycleStatusOf } from '../src';
import { statusEvent } from './helpers/fixtures';
import { createMockTransport, fail, ok } from './helpers/mock';

const BASE = '/status-tracking/0.0.1';

function setup() {
  const mock = createMockTransport();
  const client = createUkrposhtaTrackingClient({
    transport: mock.transport,
    bearer: 'tracking-bearer',
    retry: { sleep: async () => undefined },
  });
  return { mock, client };
}

describe('TrackingService', () => {
  it('sends the tracking bearer, not a counterparty token', async () => {
    const { mock, client } = setup();
    mock.on({
      method: 'GET',
      path: `${BASE}/statuses`,
      respond: ok([statusEvent('B1', 10100), statusEvent('B1', 41000)]),
    });
    const events = await client.tracking.getStatuses('B1');
    expect(events.map(e => e.event)).toEqual([10100, 41000]);
    expect(mock.last()).toMatchObject({
      method: 'GET',
      query: { barcode: 'B1' },
      headers: { authorization: 'Bearer tracking-bearer' },
    });
    expect(mock.last().query).not.toHaveProperty('token');
  });

  it('uses the production host by default and the sandbox host on request', async () => {
    const { mock, client } = setup();
    mock.on({ method: 'GET', path: `${BASE}/statuses/last`, respond: ok(statusEvent('B1', 10100)) });
    await client.tracking.getLastStatus('B1');
    expect(new URL(mock.last().request.url).origin).toBe('https://www.ukrposhta.ua');
    const sandbox = createUkrposhtaTrackingClient({ transport: mock.transport, bearer: 'b', environment: 'sandbox' });
    await sandbox.tracking.getLastStatus('B1');
    expect(new URL(mock.last().request.url).origin).toBe('https://dev.ukrposhta.ua');
  });

  it('passes the language', async () => {
    const { mock, client } = setup();
    mock.on({ method: 'GET', path: `${BASE}/statuses`, respond: ok([]) });
    await client.tracking.getStatuses('B1', { lang: 'en' });
    expect(mock.last().query).toEqual({ barcode: 'B1', lang: 'en' });
  });

  it('reads the last status', async () => {
    const { mock, client } = setup();
    mock.on({ method: 'GET', path: `${BASE}/statuses/last`, respond: ok(statusEvent('B1', 21700)) });
    await expect(client.tracking.getLastStatus('B1')).resolves.toMatchObject({ event: 21700 });
  });

  it('posts barcode lists for statuses and last statuses', async () => {
    const { mock, client } = setup();
    mock.on({ method: 'POST', path: `${BASE}/statuses`, respond: ok([statusEvent('B1', 10100)]) });
    mock.on({ method: 'POST', path: `${BASE}/statuses/last`, respond: ok([statusEvent('B1', 41000)]) });
    await client.tracking.getStatusesBatch(['B1', 'B2'], { lang: 'en' });
    expect(mock.last()).toMatchObject({
      method: 'POST',
      path: `${BASE}/statuses`,
      body: ['B1', 'B2'],
      query: { lang: 'en' },
    });
    await client.tracking.getLastStatusesBatch(['B1']);
    expect(mock.last()).toMatchObject({ path: `${BASE}/statuses/last`, body: ['B1'] });
  });

  it('splits found and not found barcodes', async () => {
    const { mock, client } = setup();
    const answer = { found: { B1: [statusEvent('B1', '41000')] }, notFound: ['GONE'] };
    mock.on({ method: 'POST', path: `${BASE}/statuses/with-not-found`, respond: ok(answer) });
    mock.on({ method: 'POST', path: `${BASE}/statuses/last/with-not-found`, respond: ok(answer) });
    expect(await client.tracking.getStatusesBatchWithNotFound(['B1', 'GONE'])).toEqual(answer);
    expect(await client.tracking.getLastStatusesBatchWithNotFound(['B1', 'GONE'])).toEqual(answer);
    expect(mock.last().path).toBe(`${BASE}/statuses/last/with-not-found`);
  });

  it('reads by recipient phone', async () => {
    const { mock, client } = setup();
    mock.on({ method: 'GET', path: `${BASE}/extra-statuses/last`, respond: ok(statusEvent('B1', 21700)) });
    mock.on({ method: 'POST', path: `${BASE}/extra-statuses/last`, respond: ok([statusEvent('B1', 21700)]) });
    await client.tracking.getLastStatusByPhone({ barcode: 'B1', recipientPhoneNumber: '380634440999' });
    expect(mock.last().query).toEqual({ barcode: 'B1', recipientPhoneNumber: '380634440999' });
    await client.tracking.getStatusesByPhoneBatch([{ barcode: 'B1', recipientPhoneNumber: '380634440999' }]);
    expect(mock.last().body).toEqual([{ barcode: 'B1', recipientPhoneNumber: '380634440999' }]);
  });

  it('reads the route in both languages', async () => {
    const { mock, client } = setup();
    mock.on({
      method: 'GET',
      path: `${BASE}/barcodes/{barcode}/route`,
      respond: ok({ from: 'UKRAINA m.Kyiv', to: 'UKRAINA s.Biliany' }),
    });
    mock.on({
      method: 'GET',
      path: `${BASE}/barcodes/{barcode}/route/in-lang/{lang}`,
      respond: ok({ from: 'UKRAINE Kyiv', to: 'UKRAINE Biliany' }),
    });
    await expect(client.tracking.getRoute('B1')).resolves.toEqual({ from: 'UKRAINA m.Kyiv', to: 'UKRAINA s.Biliany' });
    await expect(client.tracking.getRoute('B1', { lang: 'en' })).resolves.toMatchObject({ from: 'UKRAINE Kyiv' });
    expect(mock.last().path).toBe(`${BASE}/barcodes/B1/route/in-lang/EN`);
    await client.tracking.getRoute('B1', { lang: 'ua' });
    expect(mock.last().path).toBe(`${BASE}/barcodes/B1/route/in-lang/UA`);
  });

  it('maps an unknown barcode to a not_found CarrierError', async () => {
    const { mock, client } = setup();
    mock.on({ method: 'GET', path: `${BASE}/statuses`, respond: fail(404, 'UPE02002', 'Shipment not found') });
    const error = await client.tracking.getStatuses('NOPE').catch((e: unknown) => e);
    expect(isCarrierError(error)).toBe(true);
    expect(error).toMatchObject({ code: 'UPE02002', category: CarrierErrorCategory.NotFound, httpStatus: 404 });
  });

  it('maps a rejected bearer', async () => {
    const { mock, client } = setup();
    mock.on({ method: 'GET', path: `${BASE}/statuses`, respond: fail(401, 'UPE05001', 'Wrong token') });
    await expect(client.tracking.getStatuses('B1')).rejects.toMatchObject({
      category: CarrierErrorCategory.Authentication,
    });
  });

  it('retries a 503 on GET and on the read-only batch POSTs', async () => {
    const { mock, client } = setup();
    let attempts = 0;
    mock.on({
      method: 'GET',
      path: `${BASE}/statuses`,
      respond: () => (attempts++ === 0 ? fail(503, 'UPE08000', 'down') : ok([statusEvent('B1', 10100)])),
    });
    await expect(client.tracking.getStatuses('B1')).resolves.toHaveLength(1);
    expect(attempts).toBe(2);
    let batchAttempts = 0;
    mock.on({
      method: 'POST',
      path: `${BASE}/statuses/last`,
      respond: () => (batchAttempts++ === 0 ? fail(503, 'UPE08000', 'down') : ok([statusEvent('B1', 10100)])),
    });
    await expect(client.tracking.getLastStatusesBatch(['B1'])).resolves.toHaveLength(1);
    expect(batchAttempts).toBe(2);
  });

  it('rejects empty and oversized batches before sending', () => {
    const { mock, client } = setup();
    expect(() => client.tracking.getStatusesBatch([])).toThrow(/At least one barcode/);
    expect(() => client.tracking.getStatusesBatch(Array.from({ length: 51 }, (_, i) => `B${i}`))).toThrow(/At most 50/);
    expect(() => client.tracking.getLastStatusesBatch(Array.from({ length: 101 }, (_, i) => `B${i}`))).toThrow(
      /At most 100/,
    );
    expect(() => client.tracking.getStatusesByPhoneBatch([])).toThrow(/At least one/);
    expect(mock.calls).toHaveLength(0);
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
