import { CarrierError, CarrierErrorCategory } from '@shopana/carrier-core';
import { createMemoryReferenceCache, createMeestPublicClient } from '../src';
import { mockTransport } from './mock';
import type { Handler } from './mock';

const BASE = 'https://publicapi.meest.com';
const ok = (result: unknown) => ({ data: { status: 1, msg: null, result } });
const fail = (code: number, en: string) => ({ data: { status: 0, msg: { code, ru: en, ua: en, en }, result: null } });

const make = (handler: Handler, extra: Record<string, unknown> = {}) => {
  const mock = mockTransport(BASE, handler);
  return { ...mock, client: createMeestPublicClient({ transport: mock.transport, retry: false, ...extra }) };
};

const rejection = async (p: Promise<unknown>) => {
  try {
    await p;
  } catch (e) {
    return e as CarrierError;
  }
  throw new Error('expected rejection');
};

describe('geo', () => {
  it('sends search filters as snake_case query parameters', async () => {
    const { client, calls } = make(() => ok([{ ua: 'Lvivska', region_id: 'r1' }]));
    expect(await client.geo.regions({ searchBeginning: 'L' })).toHaveLength(1);
    expect(calls[0]).toMatchObject({ method: 'GET', path: '/geo_regions', query: { search_beginning: 'L' } });

    await client.geo.districts({ regionId: 'r1' });
    expect(calls[1]).toMatchObject({ path: '/geo_districts', query: { region_id: 'r1' } });
  });

  it('returns [] for a "not found" answer and rethrows other errors', async () => {
    const { client } = make(() => fail(10401, 'Could not find region'));
    expect(await client.geo.regions({ searchFull: 'Atlantis' })).toEqual([]);
    const broken = make(() => fail(10999, 'Boom'));
    expect(await rejection(broken.client.geo.regions())).toMatchObject({ code: '10999', category: CarrierErrorCategory.BusinessLogic });
  });

  it('unwraps { data } of localities and passes district_id', async () => {
    const locality = { n_ua: 'Mriya', city_id: 'c1', is_delivery_in_city: true };
    const { client, calls } = make(() => ok([{ data: locality }]));
    expect(await client.geo.localities({ districtId: 'd1' })).toEqual([locality]);
    expect(calls[0]!.query).toMatchObject({ district_id: 'd1' });
  });

  it('requires a city for streets', async () => {
    const { client, calls } = make(() => ok([{ street_id: 's1' }]));
    expect(() => client.geo.streets({ cityId: '' })).toThrow(TypeError);
    await client.geo.streets({ cityId: 'c1', searchBeginning: 'My' });
    expect(calls[0]).toMatchObject({ path: '/geo_streets', query: { city_id: 'c1', search_beginning: 'My' } });
  });
});

describe('branches', () => {
  const branches = [
    { br_id: 'b1', num_showcase: '1', type_id: 't1', city_id: 'c1', parcel_max_kg: '30.00' },
    { br_id: 'b2', num_showcase: '2', type_id: 't2', city_id: 'c1', parcel_max_kg: '300.00' },
    { br_id: 'b3', num_showcase: 3, type_id: 't2', city_id: 'c1', parcel_max_kg: '0.00' },
    { br_id: 'b4', num_showcase: '4', type_id: 't2', city_id: 'c2' },
  ];

  it('joins filters, including several types', async () => {
    const { client, calls } = make(() => ok(branches));
    await client.branches.list({ city: 'Tern', type: ['poshtomat', 'minibranch'], lang: 'en', viewdata: 'full' });
    expect(calls[0]).toMatchObject({ path: '/branches', query: { city: 'Tern', type: 'poshtomat,minibranch', lang: 'en', viewdata: 'full' } });
  });

  it('returns [] when no branch matches', async () => {
    expect(await make(() => fail(10111, 'Could not find branch')).client.branches.list({ city: 'Mriya' })).toEqual([]);
  });

  it('gets one branch by number or id and throws not_found otherwise', async () => {
    const { client, calls } = make(call => (call.path.endsWith('/0') ? fail(10111, 'Could not find branch') : ok([branches[0]])));
    expect(await client.branches.get(8382, { lang: 'ua' })).toMatchObject({ br_id: 'b1' });
    expect(calls[0]).toMatchObject({ path: '/branches/8382', query: { lang: 'ua' } });
    expect(await rejection(client.branches.get(0))).toMatchObject({ carrier: 'meest', code: '10111', category: CarrierErrorCategory.NotFound, httpStatus: 200 });
  });

  it('throws not_found when the API answers with an empty list for one branch', async () => {
    const { client } = make(() => ok([]));
    expect(await rejection(client.branches.get(1))).toMatchObject({ code: 'EMPTY_RESULT', category: CarrierErrorCategory.NotFound });
  });

  it('calls the locator with coordinates or an encoded address', async () => {
    const { client, calls } = make(() => ok(branches));
    await client.branches.nearestByCoords({ lat: 49.5, lng: 25.5 }, { type: 'poshtomat' });
    expect(calls[0]).toMatchObject({ path: '/locator/coord', query: { lat: 49.5, lng: 25.5, type: 'poshtomat' } });
    await client.branches.nearestByAddress('Przemy\u015bl, ul. Mickiewicza 2/1');
    expect(decodeURIComponent(calls[1]!.path)).toBe('/locator/Przemy\u015bl, ul. Mickiewicza 2/1');
    expect(calls[1]!.path).toContain('%2F');
  });

  it('filters the register on the client; parcel_max_kg 0 means no limit', async () => {
    const { client } = make(() => ok(branches));
    expect(await client.branches.find({ cityId: 'c1' })).toHaveLength(3);
    expect((await client.branches.find({ cityId: 'c1', minParcelMaxKg: 100 })).map(b => b.br_id)).toEqual(['b2', 'b3']);
    expect((await client.branches.find({ typeId: 't2' })).map(b => b.br_id)).toEqual(['b2', 'b3', 'b4']);
  });
});

describe('reference cache', () => {
  it('serves repeated calls from the cache and refetches after the TTL', async () => {
    let now = 0;
    const cache = createMemoryReferenceCache(() => now);
    const { client, calls } = make(() => ok([{ br_id: 'b1' }]), { cache, cacheTtlSec: 10 });
    await client.branches.list({ type: 'poshtomat' });
    await client.branches.list({ type: 'poshtomat' });
    await client.branches.list({ type: 'minibranch' });
    expect(calls).toHaveLength(2);
    now = 10_001;
    await client.branches.list({ type: 'poshtomat' });
    expect(calls).toHaveLength(3);
  });

  it('does not cache without a configured cache', async () => {
    const { client, calls } = make(() => ok([]));
    await client.geo.regions();
    await client.geo.regions();
    expect(calls).toHaveLength(2);
  });
});

describe('resilience', () => {
  it('retries a GET after a 503', async () => {
    const { client, calls } = make(
      (_, i) => (i === 0 ? { status: 503, data: 'unavailable' } : ok([{ region_id: 'r1' }])),
      { retry: { baseDelayMs: 1, jitter: 'none', sleep: async () => {} } },
    );
    expect(await client.geo.regions()).toHaveLength(1);
    expect(calls).toHaveLength(2);
  });

  it('maps gateway failures through the generic status mapping', async () => {
    const { client } = make(() => ({ status: 502, data: 'Bad gateway' }));
    expect(await rejection(client.branches.list())).toMatchObject({ category: CarrierErrorCategory.Server, httpStatus: 502 });
  });
});
