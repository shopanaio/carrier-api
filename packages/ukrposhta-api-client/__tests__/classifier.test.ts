import { CarrierErrorCategory } from '@shopana/carrier-core';
import { createUkrposhtaClassifierClient } from '../src';
import { entriesOf } from '../src';
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

  it('returns the answer of the service as it is', async () => {
    const { mock, client } = setup();
    mock.on({ method: 'GET', path: `${BASE}/get_regions_by_region_ua`, respond: entries({ REGION_ID: '286' }) });
    // One hit stays one object, as the service sends it.
    expect(await client.classifier.getRegions({ regionName: 'a' })).toEqual({
      Entries: { Entry: { REGION_ID: '286' } },
    });
    mock.on({
      method: 'GET',
      path: `${BASE}/get_regions_by_region_ua`,
      respond: entries({ REGION_ID: '286' }, { REGION_ID: '270' }),
    });
    expect(await client.classifier.getRegions({ regionName: 'a' })).toEqual({
      Entries: { Entry: [{ REGION_ID: '286' }, { REGION_ID: '270' }] },
    });
    mock.on({ method: 'GET', path: `${BASE}/get_regions_by_region_ua`, respond: ok({}) });
    expect(await client.classifier.getRegions({ regionName: 'Nowhere' })).toEqual({});
  });

  it('finds post offices by index', async () => {
    const { mock, client } = setup();
    mock.on({
      method: 'GET',
      path: `${BASE}/get_postoffices_by_postindex`,
      respond: entries({ ID: '2700', POSTINDEX: '01001', PO_SHORT: 'Kyiv 1' }),
    });
    const answer = await client.classifier.getPostOffices({ postIndex: '01001' });
    expect(entriesOf(answer)).toEqual([{ ID: '2700', POSTINDEX: '01001', PO_SHORT: 'Kyiv 1' }]);
    expect(mock.last().query).toEqual({ pi: '01001' });
  });

  it('reads the courier area flag as the service sends it', async () => {
    const { mock, client } = setup();
    mock.on({
      method: 'GET',
      path: `${BASE}/get_courierarea_by_postindex`,
      respond: call => entries({ IS_COURIERAREA: '1', postindex: String(call.query.postindex) }),
    });
    const answer = await client.classifier.getCourierArea('02223');
    expect(entriesOf(answer)[0]).toEqual({ IS_COURIERAREA: '1', postindex: '02223' });
  });

  it('sends exactly the filters it is given, even none', async () => {
    const { mock, client } = setup();
    mock.on({ method: 'GET', path: `${BASE}/get_city_by_region_id_and_district_id_and_city_ua`, respond: ok({}) });
    expect(await client.classifier.getCities({})).toEqual({});
    expect(mock.calls).toHaveLength(1);
  });

  it('keeps the fields documented per endpoint, for the locality post offices too', async () => {
    const { mock, client } = setup();
    mock.on({
      method: 'GET',
      path: `${BASE}/get_postoffices_by_postcode_cityid_cityvpzid`,
      respond: entries({ POSTOFFICE_ID: '811136', POSTOFFICE_UA: '05305 Brovary', POSTINDEX: '05305' }),
    });
    const [office] = entriesOf(await client.classifier.getPostOfficesByLocality({ postcode: '05305' }));
    // The type has POSTOFFICE_ID and POSTOFFICE_UA, not the ID and PO_SHORT of the other endpoint.
    expect(office!.POSTOFFICE_ID).toBe('811136');
    expect(office!.POSTOFFICE_UA).toBe('05305 Brovary');
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
  it('lists the records of every answer shape, and never invents any', () => {
    expect(entriesOf(undefined)).toEqual([]);
    expect(entriesOf(null)).toEqual([]);
    expect(entriesOf({})).toEqual([]);
    expect(entriesOf({ Entries: null })).toEqual([]);
    expect(entriesOf({ Entries: {} })).toEqual([]);
    expect(entriesOf({ Entries: { Entry: { a: 1 } } })).toEqual([{ a: 1 }]);
    expect(entriesOf({ Entries: { Entry: [{ a: 1 }, { a: 2 }] } })).toHaveLength(2);
  });
});
