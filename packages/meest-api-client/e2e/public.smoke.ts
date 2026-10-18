import { createMeestPublicClient } from '../src';

const enabled = process.env.MEEST_E2E === '1';
(enabled ? describe : describe.skip)('Meest public API (live)', () => {
  const meest = createMeestPublicClient();

  it('finds a locality and its streets', async () => {
    const localities = await meest.geo.localities({
      searchFull: '\u0422\u0435\u0440\u043d\u043e\u043f\u0456\u043b\u044c',
    });
    expect(localities.status).toBe(1);
    const cityId = localities.result![0]!.data.city_id;
    const streets = await meest.geo.streets({ cityId, searchBeginning: '\u041c\u0438' });
    expect(streets.result!.length).toBeGreaterThan(0);
  });

  it('returns up to 10 nearest lockers sorted by distance', async () => {
    const hits = (await meest.branches.nearestByCoords({ lat: 49.547019, lng: 25.589471 }, { type: 'poshtomat' }))
      .result!;
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.length).toBeLessThanOrEqual(10);
    const distances = hits.map(h => h.distance ?? 0);
    expect(distances).toEqual([...distances].sort((a, b) => a - b));
    // The single-branch endpoint accepts the br_id of a locator result.
    expect((await meest.branches.get(hits[0]!.br_id)).result![0]!.br_id).toBe(hits[0]!.br_id);
  });

  it('answers an unknown branch with status 0 and code 10111', async () => {
    const answer = await meest.branches.get('00000000-0000-0000-0000-000000000000');
    expect(answer).toMatchObject({ status: 0, result: null, msg: { code: 10111 } });
  });
});
