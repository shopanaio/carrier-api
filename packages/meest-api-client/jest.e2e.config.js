// Smoke tests against the live Meest APIs. Not part of `yarn test`; run only on purpose:
//   MEEST_E2E=1 yarn workspace @shopana/meest-api-client test:e2e
// Contract tests also need MEEST_USERNAME and MEEST_PASSWORD (plus MEEST_CONTRACT_ID for parcel calls).
const base = require('./jest.config');

module.exports = {
  ...base,
  roots: ['<rootDir>/e2e'],
  testMatch: ['**/*.smoke.ts'],
  testTimeout: 30000,
  coverageThreshold: undefined,
};
