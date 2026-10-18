module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: { module: 'commonjs', esModuleInterop: true, isolatedModules: true } }],
  },
  moduleNameMapper: {
    // Platform packages are tested from source, so no build is needed before `jest`.
    '^@shopana/(carrier-core)$': '<rootDir>/../$1/src',
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/**/index.ts', '!src/types/**/*.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: { branches: 60, functions: 80, lines: 80, statements: 80 },
  },
  testTimeout: 10000,
};
