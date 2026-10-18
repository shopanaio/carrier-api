import swagger from '../contracts/meest-contract.swagger.json';
import { makeContract, ok } from './contractHelpers';
import type { MeestContractClient } from '../src';

// One call per Swagger operation with every path and query parameter given. The test then checks, against the
// Swagger snapshot, that the client reaches the operation and sends exactly its documented query parameters and a body
// where one is documented.
type Op = { call: (c: MeestContractClient) => Promise<unknown>; path?: Record<string, string> };

const body = {} as never;
const calls: Record<string, Op> = {
  auth: { call: c => c.auth.login() },
  refreshToken: { call: c => c.auth.refresh('r1') },
  addressSearchByCoord_post: { call: c => c.search.addressesByCoord({ lat: 1, lon: 2 }) },
  countrySearch_post: { call: c => c.search.countries() },
  regionSearch_post: { call: c => c.search.regions() },
  districtSearch_post: { call: c => c.search.districts() },
  citySearch_post: { call: c => c.search.cities() },
  zipCodeSearch_get: { call: c => c.search.byZipCode('Z1'), path: { zipCode: 'Z1' } },
  addressSearch_post: { call: c => c.search.addresses() },
  branchTypes_get: { call: c => c.search.branchTypes() },
  branchSearch_post: { call: c => c.search.branches() },
  branchSearchGeo_get: {
    call: c => c.search.branchesNear(1, 2, 3),
    path: { latitude: '1', longitude: '2', radius: '3' },
  },
  payTerminalSearch_get: {
    call: c => c.search.payTerminals(1, 2, 3),
    path: { latitude: '1', longitude: '2', radius: '3' },
  },
  cn23Form_get: { call: c => c.print.cn23('P1', '+380'), path: { printValue: 'P1', phone: '%2B380' } },
  register_get: { call: c => c.print.register('R1', 'pdf'), path: { printValue: 'R1', contentType: 'pdf' } },
  declarationForm_get: {
    call: c => c.print.declaration('P1', '+380', 'html'),
    path: { printValue: 'P1', phone: '%2B380', contentType: 'html' },
  },
  sticker100_get: { call: c => c.print.sticker100('P1', { agent: 'A', page: 1 }), path: { printValue: 'P1' } },
  sticker100A4_get: { call: c => c.print.sticker100A4('P1', { position: 2 }), path: { printValue: 'P1' } },
  parcelStatus_get: { call: c => c.parcels.status('P1'), path: { parcelID: 'P1' } },
  parcelStatusDetails_get: { call: c => c.parcels.statusDetails('P1'), path: { parcelID: 'P1' } },
  getParcel_get: {
    call: c => c.parcels.get('P1', 'barCode', 'objectData'),
    path: { parcelID: 'P1', searchMode: 'barCode', returnMode: 'objectData' },
  },
  parcelChangeContractID_put: { call: c => c.parcels.changeContract('B1', body) },
  changingParcelBySender_post: { call: c => c.parcels.changeBySender(body) },
  calculateExportB2C_post: { call: c => c.pricing.calculateExportB2C(body) },
  parcel_post: { call: c => c.parcels.create(body) },
  parcel_put: { call: c => c.parcels.update('P1', body), path: { parcelID: 'P1' } },
  parcel_delete: {
    call: c => c.parcels.delete('P1', 'K1', { body: { reason: 'x' } }),
    path: { parcelID: 'P1', contractID: 'K1' },
  },
  calculate_post: { call: c => c.pricing.calculate(body) },
  parcelsList_get: { call: c => c.parcels.list('01.01.2026'), path: { dateFrom: '01.01.2026' } },
  orderDateInfo_get: { call: c => c.pricing.orderDateInfo('S1'), path: { streetID: 'S1' } },
  specConditions_get: { call: c => c.pricing.specConditions() },
  LockParcel_post: { call: c => c.parcels.lock(body) },
  UnlockParcel_post: { call: c => c.parcels.unlock(body) },
  tracking_get: { call: c => c.tracking.byNumber('T1'), path: { trackNumber: 'T1' } },
  trackingDelivered_get: {
    call: c => c.tracking.delivered('a', 'b', 3),
    path: { dateFrom: 'a', dateTo: 'b', page: '3' },
  },
  trackingByDate_get: { call: c => c.tracking.byDate('2026-01-01'), path: { searchDate: '2026-01-01' } },
  parcelInfoTracking_get: { call: c => c.tracking.parcelInfo('P1'), path: { parcelID: 'P1' } },
  trackingByPeriod_get: { call: c => c.tracking.byPeriod('a', 'b'), path: { dateFrom: 'a', dateTo: 'b' } },
  availableTimeSlots_get: {
    call: c => c.registers.availableTimeSlots({ type: 'PickUp', streetId: 'S1', cityId: 'C1' }),
  },
  registerBranch_post: { call: c => c.registers.createBranch(body) },
  registerBranch_put: { call: c => c.registers.updateBranch('R1', body), path: { registerID: 'R1' } },
  registerBranch_delete: {
    call: c => c.registers.deleteBranch('R1', { body: {} }),
    path: { registerID: 'R1' },
  },
  registerPickup_post: { call: c => c.registers.createPickup(body) },
  registerPickup_put: { call: c => c.registers.updatePickup('R1', body), path: { registerID: 'R1' } },
  registerPickup_delete: {
    call: c => c.registers.deletePickup('R1', { body: {} }),
    path: { registerID: 'R1' },
  },
  registersList_get: { call: c => c.registers.list('01.01.2026'), path: { dateFrom: '01.01.2026' } },
  parcelReturn_new_post: { call: c => c.misc.returnParcel(body) },
  parcelReturnReasons_get: { call: c => c.misc.returnReasons() },
  contractClientInfo_get: { call: c => c.misc.contractInfo('K1'), path: { contractID: 'K1' } },
  CheckPhoneOnParcel_get: {
    call: c => c.misc.checkPhone('B1', 'P1'),
    path: { barCode: 'B1', phoneCheck: 'P1' },
  },
  contract_validation_check_post: { call: c => c.misc.validateContract(body) },
  banners_get: { call: c => c.misc.banners() },
};

type SwaggerOp = {
  operationId: string;
  parameters?: Array<{ name: string; in: string; required?: boolean }>;
};
const operations = Object.entries(swagger.paths).flatMap(([template, item]) =>
  Object.entries(item as Record<string, SwaggerOp>).map(([method, op]) => ({
    template,
    method: method.toUpperCase(),
    op,
  })),
);

describe('Swagger coverage', () => {
  it('has a client call for every operation of the snapshot and nothing else', () => {
    expect(operations.map(o => o.op.operationId).sort()).toEqual(Object.keys(calls).sort());
    expect(operations).toHaveLength(52);
  });

  it.each(operations.map(o => [o.op.operationId, o] as const))(
    '%s reaches its route with the documented parameters',
    async (id, { template, method, op }) => {
      const { client, apiCalls, tokenCalls } = makeContract({ handler: () => ok([]) });
      const { call, path = {} } = calls[id]!;
      await call(client).catch(() => undefined);
      const sent =
        id === 'auth' || id === 'refreshToken' ? tokenCalls(id === 'auth' ? '/auth' : '/refreshToken') : apiCalls();
      expect(sent).toHaveLength(1);
      const [request] = sent;
      expect(request!.method).toBe(method);
      expect(request!.path).toBe(template.replace(/\{(\w+)\}/g, (_, name: string) => path[name] ?? `{${name}}`));
      const queryNames = (op.parameters ?? [])
        .filter(p => p.in === 'query')
        .map(p => p.name)
        .sort();
      expect(Object.keys(request!.query).sort()).toEqual(queryNames);
      if ((op.parameters ?? []).some(p => p.in === 'body')) expect(request!.body).toBeDefined();
    },
  );
});
