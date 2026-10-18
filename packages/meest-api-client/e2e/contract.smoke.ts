import { createMeestContractClient } from '../src';

const username = process.env.MEEST_USERNAME;
const password = process.env.MEEST_PASSWORD;
const enabled = process.env.MEEST_E2E === '1' && Boolean(username && password);

// Read-only calls only: no parcel is created here.
(enabled ? describe : describe.skip)('Meest contract API (live)', () => {
  const meest = createMeestContractClient({
    username: username!,
    password: password!,
    baseUrl: process.env.MEEST_BASE_URL,
  });

  it('logs in and reads directories', async () => {
    const tokens = await meest.auth.login();
    expect(tokens.token).toBeTruthy();
    expect((await meest.search.branchTypes()).length).toBeGreaterThan(0);
    const [city] = await meest.search.cities({ filters: { cityDescr: '\u041b\u044c\u0432\u0456\u0432' } });
    expect(city?.cityID).toBeDefined();
  });

  it('reads return reasons and special conditions', async () => {
    expect((await meest.misc.returnReasons()).length).toBeGreaterThan(0);
    expect(await meest.pricing.specConditions()).toBeDefined();
  });

  it('answers tracking for an unknown number with an empty list or a not_found error', async () => {
    const result = await meest.tracking.byNumber('000-0000000').catch(e => e);
    expect(Array.isArray(result) || result?.category === 'not_found').toBe(true);
  });
});
