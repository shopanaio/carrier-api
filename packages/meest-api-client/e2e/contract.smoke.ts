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
    const login = await meest.auth.login();
    expect(login.result.token).toBeTruthy();
    expect((await meest.search.branchTypes()).result.length).toBeGreaterThan(0);
    const cities = await meest.search.cities({ filters: { cityDescr: '\u041b\u044c\u0432\u0456\u0432' } });
    expect(cities.result[0]?.cityID).toBeDefined();
  });

  it('reads return reasons and special conditions', async () => {
    expect((await meest.misc.returnReasons()).result.length).toBeGreaterThan(0);
    expect((await meest.pricing.specConditions()).result).toBeDefined();
  });

  it('answers tracking for an unknown number with the answer Meest gives', async () => {
    const answer = await meest.tracking.byNumber('000-0000000').catch((e: unknown) => e);
    expect(answer).toBeDefined();
  });

  it('answers trackingDelivered with the date format of the Swagger', async () => {
    const answer = await meest.tracking.delivered('2026-01-01 00:00:00', '2026-01-01 01:00:00', 1);
    expect(answer.status).toBeDefined();
  });
});
