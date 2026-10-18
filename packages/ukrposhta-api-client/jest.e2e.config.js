// Smoke tests against the real Ukrposhta sandbox. Not part of `yarn test`: run `yarn test:e2e` on purpose.
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/e2e'],
  testMatch: ['**/*.e2e.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: { module: 'commonjs', esModuleInterop: true, isolatedModules: true } }],
  },
  moduleNameMapper: {
    '^@shopana/(carrier-core|carrier-contracts)$': '<rootDir>/../$1/src',
  },
  testTimeout: 60000,
};
