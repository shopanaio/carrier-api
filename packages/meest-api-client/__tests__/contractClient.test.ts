import { CarrierErrorCategory, InMemoryTokenStore } from '@shopana/carrier-core';
import { createMeestContractClient } from '../src';
import { FakeClock, mockTransport } from './mock';
import { BASE, fail, makeContract, ok, rejection } from './contractHelpers';

describe('authentication', () => {
  it('logs in once and sends the token header on every call', async () => {
    const { client, apiCalls, tokenCalls } = makeContract();
    await client.pricing.specConditions();
    await client.pricing.specConditions();
    expect(tokenCalls('/auth')).toHaveLength(1);
    expect(tokenCalls('/auth')[0]!.body).toEqual({ username: 'user', password: 'pass' });
    expect(apiCalls().map(c => c.headers.token)).toEqual(['tok-1', 'tok-1']);
  });

  it('normalizes the refresh_token spelling of the Swagger example', async () => {
    const { client } = makeContract();
    const tokens = await client.auth.login();
    expect(tokens).toEqual({ token: 'tok-1', refreshToken: 'ref-1', expiresIn: 86_400 });
    expect(await client.auth.refresh(tokens.refreshToken)).toMatchObject({ token: 'tok-2' });
  });

  it('accepts refreshToken as the field name too, and rejects a response without tokens', async () => {
    const noWait = makeContract();
    const mock = mockTransport(BASE, call => (call.path === '/auth' ? ok({ token: 't', refreshToken: 'r', expiresIn: 60 }) : ok([])));
    const camel = createMeestContractClient({ username: 'u', password: 'p', transport: mock.transport, clock: noWait.clock });
    expect(await camel.auth.login()).toMatchObject({ refreshToken: 'r' });
    const empty = mockTransport(BASE, () => ok({}));
    const bad = createMeestContractClient({ username: 'u', password: 'p', transport: empty.transport });
    await expect(bad.auth.login()).rejects.toThrow('no token');
  });

  it('turns wrong credentials into an authentication error', async () => {
    const { client } = makeContract({ client: { password: 'nope' } });
    expect(await rejection(client.pricing.specConditions())).toMatchObject({
      carrier: 'meest',
      code: '401:password',
      category: CarrierErrorCategory.Authentication,
      field: 'password',
      httpStatus: 401,
    });
  });

  it('refreshes the token shortly before it expires', async () => {
    const { client, clock, tokenCalls, apiCalls } = makeContract({ ttlSec: 3600 });
    await client.pricing.specConditions();
    clock.advance(3600 * 1000 - 30_000);
    await client.pricing.specConditions();
    expect(tokenCalls('/refreshToken')).toHaveLength(1);
    expect(apiCalls().map(c => c.headers.token)).toEqual(['tok-1', 'tok-2']);
  });

  it('refreshes after a 401 and falls back to a full login when the refresh token is rejected', async () => {
    let reject = 0;
    const { client, tokenCalls, apiCalls } = makeContract({ handler: () => (reject-- > 0 ? fail(401, 'token', 'expired') : ok([{ conditionID: 'c' }])) });
    reject = 1;
    await client.pricing.specConditions();
    expect(tokenCalls('/refreshToken')).toHaveLength(1);
    expect(apiCalls()).toHaveLength(2);
    expect(apiCalls()[1]!.headers.token).not.toBe(apiCalls()[0]!.headers.token);
  });

  it('takes secrets lazily', async () => {
    const { client, tokenCalls } = makeContract({ client: { username: () => 'user', password: async () => 'pass' } });
    await client.pricing.specConditions();
    expect(tokenCalls('/auth')[0]!.body).toEqual({ username: 'user', password: 'pass' });
  });

  it('shares tokens through a token store', async () => {
    const store = new InMemoryTokenStore();
    const a = makeContract({ client: { tokenStore: store } });
    await a.client.pricing.specConditions();
    const second = createMeestContractClient({ username: 'user', password: 'pass', transport: a.transport, tokenStore: store, clock: a.clock, sleep: a.clock.sleep });
    await second.pricing.specConditions();
    expect(a.tokenCalls('/auth')).toHaveLength(1);
  });
});

describe('requests', () => {
  it('search: POST bodies, numeric path parameters, zip', async () => {
    const { client, apiCalls } = makeContract();
    await client.search.cities({ filters: { cityDescr: 'Tern' } });
    await client.search.branches({ filters: { cityID: 'c1' } });
    await client.search.countries();
    await client.search.addressesByCoord({ lat: 49.5, lon: 25.5 });
    await client.search.branchesNear(49.5449, 25.5987, 2000);
    await client.search.payTerminals(49.5, 25.5, 800);
    await client.search.byZipCode('46006');
    await client.search.branchTypes();
    expect(apiCalls().map(c => `${c.method} ${c.path}`)).toEqual([
      'POST /citySearch',
      'POST /branchSearch',
      'POST /countrySearch',
      'POST /addressSearchByCoord',
      'GET /branchSearchGeo/49.5449/25.5987/2000',
      'GET /payTerminalSearch/49.5/25.5/800',
      'GET /zipCodeSearch/46006',
      'GET /branchTypes',
    ]);
    expect(apiCalls()[0]!.body).toEqual({ filters: { cityDescr: 'Tern' } });
    expect(apiCalls()[2]!.body).toEqual({});
  });

  it('pricing', async () => {
    const { client, apiCalls } = makeContract({ handler: () => ok([{ costServices: '100.00' }]) });
    const body = { sender: { branchID: 'a', cityID: 'c', service: 'Branch' }, receiver: { branchID: 'b', cityID: 'c', service: 'Branch' }, placesItems: [{ quantity: 1, weight: 2 }] };
    expect(await client.pricing.calculate(body)).toEqual([{ costServices: '100.00' }]);
    await client.pricing.specConditions();
    await client.pricing.orderDateInfo('street-1');
    expect(apiCalls().map(c => `${c.method} ${c.path}`)).toEqual(['POST /calculate', 'GET /specConditions', 'GET /orderDateInfo/street-1']);
    expect(apiCalls()[0]!.body).toEqual(body);
  });

  it('parcels: create, update, delete, get, list, status, lock, change contract', async () => {
    const { client, apiCalls } = makeContract({ handler: () => ok({ parcelID: 'p1' }) });
    await client.parcels.create({ parcelNumber: 'T-1' } as never);
    await client.parcels.update('p1', { COD: 5 } as never);
    await client.parcels.delete('p1', 'k1');
    await client.parcels.get('T-1', 'parcelNumber');
    await client.parcels.get('p1');
    await client.parcels.list(new Date('2026-01-31T22:30:00Z'));
    await client.parcels.status('p1');
    await client.parcels.statusDetails('p1');
    await client.parcels.lock({ ClientsShipmentRef: 'T-1' } as never);
    await client.parcels.unlock({ ParcelUID: 'p1' } as never);
    await client.parcels.changeContract('711-1', { contractID: 'k2' } as never);
    expect(apiCalls().map(c => `${c.method} ${c.path}`)).toEqual([
      'POST /parcel',
      'PUT /parcel/p1',
      'DELETE /parcel/p1/k1',
      'GET /getParcel/T-1/parcelNumber/objectData',
      'GET /getParcel/p1/parcelID/objectData',
      'GET /parcelsList/01.02.2026',
      'GET /parcelStatus/p1',
      'GET /parcelStatusDetails/p1',
      'POST /LockParcel',
      'POST /UnlockParcel',
      'PUT /parcelChangeContractID',
    ]);
    expect(apiCalls().at(-1)!.query).toEqual({ barCode: '711-1' });
  });

  it('tracking: formats dates as the endpoints expect, in Kyiv time', async () => {
    const { client, apiCalls } = makeContract();
    const from = new Date('2026-01-01T10:00:00Z');
    const to = new Date('2026-01-01T11:30:00Z');
    await client.tracking.byNumber('711-1');
    await client.tracking.parcelInfo('p1');
    await client.tracking.byDate(from);
    await client.tracking.byPeriod(from, to);
    await client.tracking.delivered('2026-01-01 00:00:00', to, 2);
    expect(apiCalls().map(c => decodeURIComponent(`${c.method} ${c.path}`))).toEqual([
      'GET /tracking/711-1',
      'GET /parcelInfoTracking/p1',
      'GET /trackingByDate/2026-01-01',
      'GET /trackingByPeriod/2026-01-01 12:00:00/2026-01-01 13:30:00',
      'GET /trackingDelivered/2026-01-01 00:00:00/2026-01-01 13:30:00/2',
    ]);
  });

  it('iterates delivered pages until a short one', async () => {
    const page = (n: number) => Array.from({ length: n }, (_, i) => ({ parcelNumber: `P${i}` }));
    const { client, apiCalls } = makeContract({ handler: call => ok(call.path.endsWith('/1') ? page(150) : page(3)) });
    const seen: string[] = [];
    for await (const item of client.tracking.iterateDelivered('2026-01-01 00:00:00', '2026-01-02 00:00:00')) seen.push(item.parcelNumber!);
    expect(seen).toHaveLength(153);
    expect(apiCalls()).toHaveLength(2);
  });

  it('registers and misc', async () => {
    const { client, apiCalls } = makeContract({ handler: () => ok({}) });
    await client.registers.createBranch({ parcelsItems: [{ parcelID: 'p1' }] } as never);
    await client.registers.updateBranch('r1', { parcelsItems: [] } as never);
    await client.registers.deleteBranch('r1');
    await client.registers.createPickup({ payType: 'cash' } as never);
    await client.registers.updatePickup('r2', {} as never);
    await client.registers.deletePickup('r2');
    await client.registers.list('01.01.2026');
    await client.registers.availableTimeSlots('street-1');
    await client.misc.returnParcel({ parcelID: 'p1', reasonID: 'x' });
    await client.misc.returnReasons();
    await client.misc.contractInfo('k1');
    await client.misc.checkPhone('711-1', '+380671234567');
    await client.misc.validateContract({ ContractID: 'k1' });
    await client.misc.banners();
    expect(apiCalls().map(c => `${c.method} ${c.path}`)).toEqual([
      'POST /registerBranch',
      'PUT /registerBranch/r1',
      'DELETE /registerBranch/r1',
      'POST /registerPickup',
      'PUT /registerPickup/r2',
      'DELETE /registerPickup/r2',
      'GET /registersList/01.01.2026',
      'GET /availableTimeSlots',
      'POST /parcelReturn_new',
      'GET /parcelReturnReasons',
      'GET /contractClientInfo/k1',
      expect.stringMatching(/^GET \/CheckPhoneOnParcel\/711-1\/%2B380671234567$/),
      'POST /contract_validation_check',
      'GET /banners',
    ]);
    expect(apiCalls()[7]!.query).toEqual({ streetID: 'street-1', type: 'pickup' });
  });
});

describe('print', () => {
  const pdf = { contentType: 'application/pdf', data: new Uint8Array([0x25, 0x50, 0x44, 0x46]) };
  const handler = (call: { responseType?: string }) => ({ data: call.responseType === 'binary' ? pdf : call.responseType === 'text' ? '<html></html>' : [] });

  it('asks for binary PDF and text HTML, joins ids and passes sticker options', async () => {
    const { client, apiCalls } = makeContract({ handler });
    expect(await client.print.declaration('p1', 'pdf')).toEqual(pdf);
    expect(await client.print.cn23(['p1', 'p2'], 'html')).toBe('<html></html>');
    await client.print.register('p1', 'pdf');
    await client.print.sticker100(['711-1', '711-2'], { agent: 'k1', page: 1 });
    await client.print.sticker100A4('p1');
    await client.print.sticker100A4('p1', { position: 3 });
    // Commas between ids stay literal on the wire (no %2C).
    expect(apiCalls()[1]!.path).toBe('/print/cn23/p1,p2/html');
    expect(apiCalls()[3]!.path).toBe('/print/sticker100/711-1,711-2');
    expect(apiCalls().map(c => `${c.method} ${decodeURIComponent(c.path)} ${c.responseType}`)).toEqual([
      'GET /print/declaration/p1/pdf binary',
      'GET /print/cn23/p1,p2/html text',
      'GET /print/register/p1/pdf binary',
      'GET /print/sticker100/711-1,711-2 binary',
      'GET /print/sticker100A4/p1 binary',
      'GET /print/sticker100A4/p1 binary',
    ]);
    expect(apiCalls()[3]!.query).toEqual({ agent: 'k1', page: 1 });
    expect(apiCalls()[4]!.query).toEqual({ position: 1 });
    expect(apiCalls()[5]!.query).toEqual({ position: 3 });
  });
});

describe('review fixes', () => {
  it('keys cached tokens per account so a shared store never mixes them', async () => {
    const store = new InMemoryTokenStore();
    const login = (name: string, token: string) =>
      mockTransport(BASE, call => (call.path === '/auth' ? ok({ token, refresh_token: `r-${token}`, expiresIn: 3600 }) : ok([{ seen: call.headers.token, name }])));
    const ta = login('alice', 'token-alice');
    const tb = login('bob', 'token-bob');
    const clock = new FakeClock();
    const alice = createMeestContractClient({ username: 'alice', password: 'x', transport: ta.transport, tokenStore: store, clock });
    const bob = createMeestContractClient({ username: 'bob', password: 'x', transport: tb.transport, tokenStore: store, clock });
    expect(await alice.pricing.specConditions()).toEqual([{ seen: 'token-alice', name: 'alice' }]);
    expect(await bob.pricing.specConditions()).toEqual([{ seen: 'token-bob', name: 'bob' }]);
    expect(tb.callsTo('POST', '/auth')).toHaveLength(1);
  });

  it('applies the timeout to login and refresh too', async () => {
    const hang = mockTransport(BASE, () => new Promise(() => {}));
    const client = createMeestContractClient({ username: 'u', password: 'p', transport: hang.transport, loginTimeoutMs: 20, retry: false });
    const error = await rejection(client.pricing.specConditions());
    expect(error).toMatchObject({ retryable: true });
    expect(hang.calls[0]!.path).toBe('/auth');
  });

  it('classifies a complaint about the token inside a 200 body as an authentication error', async () => {
    const { client } = makeContract({ handler: () => ({ data: { status: 'Error', info: { fieldName: 'token', message: 'Invalid token' }, result: null } }) });
    expect(await rejection(client.pricing.specConditions())).toMatchObject({ category: CarrierErrorCategory.Authentication, field: 'token' });
  });

  it('rejects a tracking window longer than two hours before sending anything', async () => {
    const { client, apiCalls } = makeContract();
    const from = new Date('2026-01-01T10:00:00Z');
    expect(() => client.tracking.byPeriod(from, new Date('2026-01-01T12:00:01Z'))).toThrow(RangeError);
    expect(() => client.tracking.byPeriod(from, new Date('2026-01-01T09:00:00Z'))).toThrow(RangeError);
    await client.tracking.byPeriod(from, new Date('2026-01-01T12:00:00Z'));
    expect(apiCalls()).toHaveLength(1);
  });

  it('requires ids for print calls', () => {
    const { client } = makeContract();
    expect(() => client.print.sticker100([])).toThrow(TypeError);
    expect(() => client.print.sticker100('')).toThrow(TypeError);
  });
});

describe('errors', () => {
  it('maps HTTP status and info.fieldName to a CarrierError', async () => {
    const { client } = makeContract({ handler: () => fail(404, 'parcelID', 'Parcel not found') });
    expect(await rejection(client.parcels.get('x'))).toMatchObject({ code: '404:parcelID', field: 'parcelID', category: CarrierErrorCategory.NotFound, message: 'Parcel not found' });
  });

  it('maps an Error envelope inside a 200 body, flat or nested', async () => {
    const flat = makeContract({ handler: () => ({ data: { status: 'Error', fieldName: 'x', message: 'Flat', result: null } }) });
    expect(await rejection(flat.client.pricing.specConditions())).toMatchObject({ message: 'Flat', field: 'x', category: CarrierErrorCategory.Validation });
    const nested = makeContract({ handler: () => ({ data: { status: 'Error', info: { message: 'Nested' }, result: null } }) });
    expect(await rejection(nested.client.pricing.specConditions())).toMatchObject({ message: 'Nested', category: CarrierErrorCategory.BusinessLogic });
  });

  it('treats a lowercase "ok" status as success and a bare array as a payload', async () => {
    const lower = makeContract({ handler: () => ({ data: { status: 'ok', result: [1] } }) });
    expect(await lower.client.pricing.specConditions()).toEqual([1]);
    const bare = makeContract({ handler: () => ({ data: [{ status: 'Created', statusCode: '2' }] }) });
    expect(await bare.client.parcels.status('p1')).toEqual([{ status: 'Created', statusCode: '2' }]);
  });
});

describe('resilience', () => {
  it('retries a GET after a 503 and honours Retry-After on a 429', async () => {
    let n = 0;
    const { client, apiCalls, clock } = makeContract({
      handler: () => (n++ === 0 ? { status: 503, data: 'x' } : n === 2 ? { status: 429, headers: { 'retry-after': '2' }, data: 'x' } : ok([{ ok: true }])),
    });
    const t0 = clock.now();
    expect(await client.pricing.specConditions()).toEqual([{ ok: true }]);
    expect(apiCalls()).toHaveLength(3);
    expect(clock.now() - t0).toBeGreaterThanOrEqual(2000);
  });

  it('gives up with a retryable rate_limit error when 429 persists', async () => {
    const { client } = makeContract({ handler: () => ({ status: 429, data: 'slow down' }), client: { retry: { maxRetries: 1, baseDelayMs: 1, jitter: 'none', sleep: async () => {} } } });
    expect(await rejection(client.search.branchTypes())).toMatchObject({ category: CarrierErrorCategory.RateLimit, retryable: true, httpStatus: 429 });
  });

  it('does not repeat parcel creation after a 5xx', async () => {
    const { client, apiCalls } = makeContract({ handler: () => ({ status: 503, data: 'down' }) });
    expect(await rejection(client.parcels.create({ parcelNumber: 'T' } as never))).toMatchObject({ category: CarrierErrorCategory.Server, httpStatus: 503 });
    expect(apiCalls()).toHaveLength(1);
  });

  it('repeats read-like POSTs (search, calculate) after a 5xx', async () => {
    let n = 0;
    const { client, apiCalls } = makeContract({ handler: () => (n++ === 0 ? { status: 503, data: 'down' } : ok([])) });
    await client.search.cities();
    expect(apiCalls()).toHaveLength(2);
  });

  it('throttles to the configured rate on its own clock', async () => {
    const { client, apiCalls, clock } = makeContract({ client: { rateLimit: { limit: 5, intervalMs: 60_000 } } });
    const t0 = clock.now();
    for (let i = 0; i < 12; i += 1) await client.search.branchTypes();
    expect(apiCalls()).toHaveLength(12);
    expect(clock.now() - t0).toBeGreaterThan(0);
  });

  it('can run unthrottled', async () => {
    const { client, clock } = makeContract({ client: { rateLimit: false } });
    const t0 = clock.now();
    for (let i = 0; i < 150; i += 1) await client.search.branchTypes();
    expect(clock.now()).toBe(t0);
  });
});

describe('dates', () => {
  it('uses a clock that is independent of the system time', () => {
    expect(new FakeClock().now()).toBe(Date.UTC(2026, 0, 1, 9, 0, 0));
  });
});
