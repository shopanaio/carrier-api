import { createPackageConfig } from '../../tools/rollup-package.mjs';

export default createPackageConfig({ external: ['@shopana/carrier-core', '@shopana/carrier-contracts', 'ajv', 'ajv-formats'] });
