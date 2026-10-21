import { CarrierErrorCategory } from '@shopana/carrier-core';
import {
  createMeestPublicClient,
  isMeestNotFound,
  unwrapMeestPublic,
} from '../src';
import { mockTransport } from './mock';
import type { Handler } from './mock';

const BASE = 'https://publicapi.meest.com';
const ok = (result: unknown) => ({ data: { status: 1, msg: null, result } });
const fail = (code: number, en: string) => ({
  data: { status: 0, msg: { code, ru: en, ua: en, en }, result: null },
});

const make = (handler: Handler, extra: Record<string, unknown> = {}) => {
  const mock = mockTransport(BASE, handler);
  return { ...mock, client: createMeestPublicClient({ transport: mock.transport, retry: false, ...extra }) };
};

describe('answers are returned exactly as Meest sends them', () => {
  it('keeps the envelope, including error answers and null results', async () => {
    const regions = [{ ua: 'Lvivska', ru: 'x', en: '', region_id: 'r1', kt: '' }];
    expect(await make(() => ok(regions)).client.geo.regions()).toEqual({ status: 1, msg: null, result: regions });

    const error = fail(10401, 'Could not find region').data;
    expect(await make(() => ({ data: error })).client.geo.regions({ searchFull: 'Atlantis' })).toEqual(error);
  });

  it('keeps locality items wrapped in data and branch lists as lists', async () => {
    const locality = { n_ua: 'Mriya', city_id: 'c1', is_delivery_in_city: true };
    const localities = make(() => ok([{ data: locality }]));
    expect((await localities.client.geo.localities({ districtId: 'd1' })).result).toEqual([{ data: locality }]);
    expect(localities.calls[0]!.query).toMatchObject({ district_id: 'd1' });

    const branches = [{ br_id: 'b1' }, { br_id: 'b2' }];
    expect((await make(() => ok(branches)).client.branches.get(8382, { lang: 'ua' })).result).toEqual(branches);
  });

  it('does not inspect the answer: a missing result stays missing', async () => {
    expect(await make(() => ({ data: { status: 1, msg: null, result: null } })).client.branches.list()).toEqual({
      status: 1,
      msg: null,
      result: null,
    });
  });
});

describe('requests', () => {
  it('geo: filters become snake_case query parameters', async () => {
    const { client, calls } = make(() => ok([]));
    await client.geo.regions({ searchBeginning: 'L', searchFull: 'Lviv' });
    await client.geo.districts({ regionId: 'r1', searchBeginning: 'K', searchFull: 'Kyiv' });
    await client.geo.localities({ districtId: 'd1', searchBeginning: 'K', searchFull: 'Kyiv' });
    await client.geo.streets({ cityId: 'c1', searchBeginning: 'My', searchFull: 'Myru' });
    expect(calls.map(c => `${c.method} ${c.path}`)).toEqual([
      'GET /geo_regions',
      'GET /geo_districts',
      'GET /geo_localities',
      'GET /geo_streets',
    ]);
    expect(calls.map(c => c.query)).toEqual([
      { search_beginning: 'L', search_full: 'Lviv' },
      { region_id: 'r1', search_beginning: 'K', search_full: 'Kyiv' },
      { district_id: 'd1', search_beginning: 'K', search_full: 'Kyiv' },
      { city_id: 'c1', search_beginning: 'My', search_full: 'Myru' },
    ]);
  });

  it('sends the streets request even without a city (Meest answers with its own error)', async () => {
    const { client, calls } = make(() => fail(10432, 'No location for street definition'));
    const answer = await client.geo.streets({ cityId: '' });
    expect(answer.msg?.code).toBe(10432);
    expect(calls).toHaveLength(1);
  });

  it('branches: every filter, several types joined by commas', async () => {
    const { client, calls } = make(() => ok([]));
    await client.branches.list({
      city: 'Tern',
      district: 'D',
      region: 'R',
      type: ['poshtomat', 'minibranch'],
      lang: 'en',
      viewdata: 'full',
    });
    expect(calls[0]).toMatchObject({
      path: '/branches',
      query: { city: 'Tern', district: 'D', region: 'R', type: 'poshtomat,minibranch', lang: 'en', viewdata: 'full' },
    });
  });

  it('locator: coordinates and an encoded address', async () => {
    const { client, calls } = make(() => ok([]));
    await client.branches.nearestByCoords({ lat: 49.5, lng: 25.5 }, { type: 'poshtomat' });
    expect(calls[0]).toMatchObject({ path: '/locator/coord', query: { lat: 49.5, lng: 25.5, type: 'poshtomat' } });
    await client.branches.nearestByAddress('Przemy\u015bl, ul. Mickiewicza 2/1', {
      type: ['cargobranch', 'mainbranch'],
    });
    expect(decodeURIComponent(calls[1]!.path)).toBe('/locator/Przemy\u015bl, ul. Mickiewicza 2/1');
    expect(calls[1]!.path).toContain('%2F');
    expect(calls[1]!.query).toEqual({ type: 'cargobranch,mainbranch' });
  });

  it('forwards the abort signal', async () => {
    const { client, calls } = make(() => ok([]));
    const { signal } = new AbortController();
    await client.geo.regions({}, { signal });
    await client.branches.get(1, { signal });
    await client.branches.list({}, { signal });
    expect(calls.every(c => c.signal === signal)).toBe(true);
  });
});

describe('optional helpers', () => {
  it('unwrapMeestPublic returns the result and throws for status 0', () => {
    expect(unwrapMeestPublic({ status: 1, msg: null, result: [1] })).toEqual([1]);
    const error = (() => {
      try {
        unwrapMeestPublic({
          status: 0,
          msg: { code: 10111, ru: '', ua: '', en: 'Could not find branch' },
          result: null,
        });
      } catch (e) {
        return e;
      }
    })();
    expect(error).toMatchObject({ carrier: 'meest', code: '10111', category: CarrierErrorCategory.NotFound });
    expect(isMeestNotFound(error)).toBe(true);
    expect(() => unwrapMeestPublic({ status: 0, msg: { code: 10432, ru: '', ua: '', en: 'x' }, result: null })).toThrow(
      expect.objectContaining({ category: CarrierErrorCategory.Validation }),
    );
    expect(() => unwrapMeestPublic({ status: 0, msg: { code: 1, ru: '', ua: '', en: '' }, result: null })).toThrow(
      expect.objectContaining({
        category: CarrierErrorCategory.BusinessLogic,
        message: 'Meest public API returned an error',
      }),
    );
  });
});
