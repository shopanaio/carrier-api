#!/usr/bin/env node
import * as esbuild from 'esbuild';
import { chmod, copyFile } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

// Generate TypeScript declaration files
console.log('Generating TypeScript declarations...');
try {
  await execAsync('tsc --emitDeclarationOnly --declaration --declarationMap');
  console.log('✓ TypeScript declarations generated');
} catch (error) {
  console.error('Warning: Failed to generate TypeScript declarations:', error.message);
}

// Copy LICENSE from root
console.log('Copying LICENSE...');
try {
  await copyFile('../../LICENSE', 'LICENSE');
  console.log('✓ LICENSE copied');
} catch (error) {
  console.error('Warning: Failed to copy LICENSE:', error.message);
}

console.log('✓ Build complete');
