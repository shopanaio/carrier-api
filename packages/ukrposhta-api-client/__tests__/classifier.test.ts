import { CarrierErrorCategory } from '@shopana/carrier-core';
import { createUkrposhtaClassifierClient } from '../src';
import { entriesOf } from '../src/public/services/classifierService';
import { createMockTransport, fail, ok } from './helpers/mock';

const BASE = '/address-classifier-ws';
const entries = (...rows: Array<Record<string, string>>) =>
  ok({ Entries: { Entry: rows.length === 1 ? rows[0] : rows } });

function setup() {
  const mock = createMockTransport();
  const client = createUkrposhtaClassifierClient({
    transport: mock.transport,
    bearer: 'ecom-bearer',
    retry: { sleep: async () => undefined },
  });
  return { mock, client };
}

describe('ClassifierService', () => {
  it('asks for JSON and sends the eCom bearer', async () => {
    const { mock, client } = setup();
    mock.on({
      method: 'GET',
      path: `${BASE}/get_regions_by_region_ua`,
      respond: entries({ REGION_ID: '286', REGION_UA: 'Kyiv' }),
    });
    await client.classifier.getRegions({ regionName: 'Kyi' });
    expect(mock.last().headers).toMatchObject({ accept: 'application/json', authorization: 'Bearer ecom-bearer' });
    expect(mock.last().query).toEqual({ region_name: 'Kyi' });
  });

  it('turns a single hit into an array and keeps many hits as they are', async () => {
    const { mock, client } = setup();
    mock.on({ method: 'GET', path: `${BASE}/get_regions_by_region_ua`, respond: entries({ REGION_ID: '286' }) });
    expect(await client.classifier.getRegions({ regionName: 'a' })).toEqual([{ REGION_ID: '286' }]);
    mock.on({
      method: 'GET',
      path: `${BASE}/get_regions_by_region_ua`,
      respond: entries({ REGION_ID: '286' }, { REGION_ID: '270' }),
    });
    expect(await client.classifier.getRegions({ regionName: 'a' })).toHaveLength(2);
  });

  it('returns an empty list for an empty answer', async () => {
    const { mock, client } = setup();
    mock.on({ method: 'GET', path: `${BASE}/get_regions_by_region_ua`, respond: ok({}) });
    expect(await client.classifier.getRegions({ regionName: 'Nowhere' })).toEqual([]);
  });

  it('finds post offices by index', async () => {
    const { mock, client } = setup();
    mock.on({
      method: 'GET',
      path: `${BASE}/get_postoffices_by_postindex`,
      respond: entries({ ID: '2700', POSTINDEX: '01001', PO_SHORT: 'Kyiv 1' }),
    });
    const [office] = await client.classifier.getPostOffices({ postIndex: '01001' });
    expect(office).toMatchObject({ POSTINDEX: '01001', PO_SHORT: 'Kyiv 1' });
    expect(mock.last().query).toEqual({ pi: '01001' });
  });

  it('checks the courier area', async () => {
    const { mock, client } = setup();
    mock.on({
      method: 'GET',
      path: `${BASE}/get_courierarea_by_postindex`,
      respond: call =>
        entries({
          IS_COURIERAREA: call.query.postindex === '02223' ? '1' : '0',
          postindex: String(call.query.postindex),
        }),
    });
    expect(await client.classifier.isCourierArea('02223')).toBe(true);
    expect(await client.classifier.isCourierArea('99999')).toBe(false);
  });

  it('refuses a search without filters instead of sending it', async () => {
    const { mock, client } = setup();
    await expect(client.classifier.getCities({})).rejects.toThrow(/at least one filter/);
    await expect(client.classifier.getStreets({})).rejects.toThrow(/at least one filter/);
    expect(mock.calls).toHaveLength(0);
  });

  it('drops undefined parameters from the query', async () => {
    const { mock, client } = setup();
    mock.on({ method: 'GET', path: `${BASE}/get_postoffices_by_postindex`, respond: ok({}) });
    await client.classifier.getPostOffices({ postIndex: '01001', cityId: undefined });
    expect(mock.last().query).toEqual({ pi: '01001' });
  });

  it('maps a rejected bearer to an authentication error', async () => {
    const { mock, client } = setup();
    mock.on({ method: 'GET', path: `${BASE}/get_regions_by_region_ua`, respond: fail(401, 'UPE05001', 'Wrong token') });
    await expect(client.classifier.getRegions({ regionName: 'a' })).rejects.toMatchObject({
      category: CarrierErrorCategory.Authentication,
    });
  });
});

describe('entriesOf', () => {
  it('handles every shape the service produces', () => {
    expect(entriesOf(undefined)).toEqual([]);
    expect(entriesOf(null)).toEqual([]);
    expect(entriesOf('')).toEqual([]);
    expect(entriesOf({})).toEqual([]);
    expect(entriesOf({ Entries: null })).toEqual([]);
    expect(entriesOf({ Entries: {} })).toEqual([]);
    expect(entriesOf({ Entries: { Entry: { a: 1 } } })).toEqual([{ a: 1 }]);
    expect(entriesOf({ Entries: { Entry: [{ a: 1 }, { a: 2 }] } })).toHaveLength(2);
  });
});
