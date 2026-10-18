module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: { module: 'commonjs', esModuleInterop: true, isolatedModules: true } }],
  },
  moduleNameMapper: {
    '^@shopana/carrier-core$': '<rootDir>/../carrier-core/src',
  },
};
