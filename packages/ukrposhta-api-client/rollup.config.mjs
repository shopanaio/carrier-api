import { createPackageConfig } from '../../tools/rollup-package.mjs';

export default createPackageConfig({
  input: {
    index: 'src/index.ts',
    'contract/index': 'src/contract/index.ts',
    'public/index': 'src/public/index.ts',
  },
  external: ['@shopana/carrier-core'],
});
