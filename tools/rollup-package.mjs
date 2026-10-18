// Shared Rollup config for platform and carrier packages.
// Emits ESM and CJS bundles; declarations come from `tsc`.
// `input` is one entry (`src/index.ts` → dist/index.{mjs,cjs}) or a map of subpath entries
// (`{ 'public/index': 'src/public/index.ts' }` → dist/public/index.{mjs,cjs}) with shared chunks.
import typescript from '@rollup/plugin-typescript';

export function createPackageConfig({ input = 'src/index.ts', external = [] } = {}) {
  const isExternal = id => external.some(dep => id === dep || id.startsWith(`${dep}/`));
  const plugins = () => [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false,
      declarationMap: false,
      outDir: 'dist',
      sourceMap: true,
    }),
  ];
  const multi = typeof input === 'object';
  const output = (format, ext) =>
    multi
      ? {
          dir: 'dist',
          format,
          sourcemap: true,
          entryFileNames: `[name].${ext}`,
          chunkFileNames: `chunks/[name]-[hash].${ext}`,
          ...(format === 'cjs' ? { exports: 'named' } : {}),
        }
      : { file: `dist/index.${ext}`, format, sourcemap: true, ...(format === 'cjs' ? { exports: 'named' } : {}) };

  return [
    { input, external: isExternal, output: output('es', 'mjs'), plugins: plugins() },
    { input, external: isExternal, output: output('cjs', 'cjs'), plugins: plugins() },
  ];
}
