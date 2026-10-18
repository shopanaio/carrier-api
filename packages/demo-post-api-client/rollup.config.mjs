import { createPackageConfig } from '../../tools/rollup-package.mjs';

export default createPackageConfig({
  input: {
    "index": "src/index.ts",
    "contract/index": "src/contract/index.ts",
    "adapter/index": "src/adapter/index.ts",
    "simulator/index": "src/simulator/index.ts",
    "public/index": "src/public/index.ts"
  },
  external: ['@shopana/carrier-core', '@shopana/carrier-contracts', '@shopana/carrier-testing'],
});
