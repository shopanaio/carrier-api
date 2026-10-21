#!/usr/bin/env node
// Discovers packages/* and runs a script in each of them, dependencies first, so a package added by
// tools/create-carrier.mjs is built, type-checked, tested and packed without editing the root scripts.
//
//   node tools/workspace-packages.mjs list                 # names in build order
//   node tools/workspace-packages.mjs run <script>         # `yarn workspace <name> run <script>` where defined
//   node tools/workspace-packages.mjs run <script> --fallback <other>   # use <other> where <script> is missing
//   node tools/workspace-packages.mjs pack                 # `npm pack --dry-run` for every publishable package
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Reads every packages/<dir>/package.json. */
export function listPackages(rootDir = root) {
  const packagesDir = join(rootDir, 'packages');
  return readdirSync(packagesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && existsSync(join(packagesDir, entry.name, 'package.json')))
    .map(entry => {
      const manifest = JSON.parse(readFileSync(join(packagesDir, entry.name, 'package.json'), 'utf8'));
      return {
        name: manifest.name,
        dir: `packages/${entry.name}`,
        private: manifest.private === true,
        scripts: manifest.scripts ?? {},
        dependsOn: [
          ...Object.keys({ ...manifest.dependencies, ...manifest.devDependencies, ...manifest.peerDependencies }),
          // Bundled packages (inlined by esbuild) are imported without being declared.
          ...importedScopedPackages(join(packagesDir, entry.name, 'src')),
        ],
      };
    });
}

function importedScopedPackages(dir) {
  const found = new Set();
  if (!existsSync(dir)) return [];
  for (const entry of readdirSync(dir, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile() || !/\.(m?[jt]s|tsx)$/.test(entry.name)) continue;
    const source = readFileSync(join(entry.parentPath ?? entry.path, entry.name), 'utf8');
    for (const match of source.matchAll(/from\s+['"](@shopana\/[a-z0-9-]+)/g)) found.add(match[1]);
  }
  return [...found];
}

/** Orders packages so every internal dependency comes before its dependents; ties keep name order. */
export function sortByDependencies(packages) {
  const byName = new Map(packages.map(pkg => [pkg.name, pkg]));
  const sorted = [];
  const state = new Map();
  const visit = (pkg, trail) => {
    if (state.get(pkg.name) === 'done') return;
    if (state.get(pkg.name) === 'visiting') throw new Error(`Dependency cycle: ${[...trail, pkg.name].join(' -> ')}`);
    state.set(pkg.name, 'visiting');
    for (const dep of [...pkg.dependsOn].sort()) {
      const internal = dep === pkg.name ? undefined : byName.get(dep);
      if (internal) visit(internal, [...trail, pkg.name]);
    }
    state.set(pkg.name, 'done');
    sorted.push(pkg);
  };
  for (const pkg of [...packages].sort((a, b) => a.name.localeCompare(b.name))) visit(pkg, []);
  return sorted;
}

function exec(command, args) {
  console.log(`\n$ ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function main(argv) {
  const [command, script, ...rest] = argv;
  const packages = sortByDependencies(listPackages());
  if (command === 'list') {
    for (const pkg of packages) console.log(`${pkg.name}${pkg.private ? ' (private)' : ''}`);
    return;
  }
  if (command === 'run' && script) {
    const fallback = rest[0] === '--fallback' ? rest[1] : undefined;
    for (const pkg of packages) {
      const target = pkg.scripts[script] ? script : fallback && pkg.scripts[fallback] ? fallback : undefined;
      if (target) exec('yarn', ['workspace', pkg.name, 'run', target]);
      else console.log(`\n- ${pkg.name}: no "${script}" script, skipped`);
    }
    return;
  }
  if (command === 'pack') {
    for (const pkg of packages.filter(p => !p.private)) exec('npm', ['pack', '--dry-run', `--workspace=${pkg.name}`]);
    return;
  }
  console.error('Usage: node tools/workspace-packages.mjs list | run <script> [--fallback <script>] | pack');
  process.exit(1);
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main(process.argv.slice(2));
