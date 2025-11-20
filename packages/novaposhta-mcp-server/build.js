#!/usr/bin/env node
import * as esbuild from 'esbuild';
import { chmod } from 'fs/promises';

const external = [
  '@modelcontextprotocol/sdk',
  'cross-fetch',
  'node-fetch',
];

// Build library entry point (no shebang, for imports)
await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outdir: 'dist',
  entryNames: '[name]',
  external,
});

// Build CLI executable (with shebang)
await esbuild.build({
  entryPoints: ['src/cli/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outdir: 'dist',
  entryNames: 'cli',
  external,
  banner: {
    js: '#!/usr/bin/env node',
  },
});

// Make CLI file executable
await chmod('dist/cli.js', 0o755);

console.log('✓ Build complete');
