import { CarrierError, CarrierErrorCategory } from '@shopana/carrier-core';
import { createMeestPublicClient } from '../src';

const enabled = process.env.MEEST_E2E === '1';
(enabled ? describe : describe.skip)('Meest public API (live)', () => {
  const meest = createMeestPublicClient();

  it('finds streets, localities and a branch by number', async () => {
    const [city] = await meest.geo.localities({ searchFull: '\u0422\u0435\u0440\u043d\u043e\u043f\u0456\u043b\u044c' });
    expect(city?.city_id).toBeDefined();
    const streets = await meest.geo.streets({ cityId: city!.city_id, searchBeginning: '\u041c\u0438' });
    expect(streets.length).toBeGreaterThan(0);
  });

  it('returns up to 10 nearest lockers sorted by distance', async () => {
    const hits = await meest.branches.nearestByCoords({ lat: 49.547019, lng: 25.589471 }, { type: 'poshtomat' });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.length).toBeLessThanOrEqual(10);
    const distances = hits.map(h => h.distance ?? 0);
    expect(distances).toEqual([...distances].sort((a, b) => a - b));
    // The single-branch endpoint accepts the br_id of a locator result.
    expect((await meest.branches.get(hits[0]!.br_id)).br_id).toBe(hits[0]!.br_id);
  });

  it('reports an unknown branch as not_found', async () => {
    const error = await meest.branches.get('00000000-0000-0000-0000-000000000000').catch(e => e as CarrierError);
    expect(error).toMatchObject({ category: CarrierErrorCategory.NotFound });
  });
});
