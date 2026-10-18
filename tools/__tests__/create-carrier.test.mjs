// Drift and smoke tests for the carrier scaffolder (node:test, no build needed).
import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { formatFiles, parseArgs, peerRange, renderFiles, validate, writeFiles } from '../create-carrier.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const IGNORED = new Set(['node_modules', 'dist', 'coverage']);

function listFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (IGNORED.has(entry.name)) return [];
    const full = join(dir, entry.name);
    return entry.isDirectory() ? listFiles(full) : [full];
  });
}

// Release automation bumps versions and internal dependency ranges; everything else must match the template.
function normalizeManifest(text) {
  const manifest = JSON.parse(text);
  delete manifest.version;
  for (const field of ['dependencies', 'devDependencies', 'peerDependencies']) {
    for (const name of Object.keys(manifest[field] ?? {})) if (name.startsWith('@shopana/')) manifest[field][name] = '*';
  }
  return manifest;
}

test('packages/demo-post-api-client is exactly the scaffolder output with --private', async () => {
  const options = parseArgs(['--slug', 'demo-post', '--name', 'Demo Post', '--private']);
  validate(options);
  const files = await formatFiles(renderFiles(options));
  const pkgDir = join(root, 'packages/demo-post-api-client');
  const onDisk = listFiles(pkgDir).map(file => relative(root, file)).sort();
  assert.deepEqual(onDisk, Object.keys(files).sort(), 'file set differs: regenerate with `node tools/create-carrier.mjs --slug demo-post --name "Demo Post" --private --force`');
  for (const [path, contents] of Object.entries(files)) {
    const actual = readFileSync(join(root, path), 'utf8');
    if (path.endsWith('/package.json')) assert.deepEqual(normalizeManifest(actual), normalizeManifest(contents), `${path} drifted from the scaffolder template`);
    else assert.equal(actual, contents, `${path} drifted from the scaffolder template`);
  }
});

test('--private marks the package private, drops publishConfig and skips the changeset', () => {
  const privateFiles = renderFiles({ slug: 'x-post', name: 'X Post', public: true, private: true });
  const privateManifest = JSON.parse(privateFiles['packages/x-post-api-client/package.json']);
  assert.equal(privateManifest.private, true);
  assert.equal(privateManifest.publishConfig, undefined);
  assert.equal(privateFiles['.changeset/x-post-api-client-initial.md'], undefined);

  const publicFiles = renderFiles({ slug: 'x-post', name: 'X Post', public: true, private: false });
  const publicManifest = JSON.parse(publicFiles['packages/x-post-api-client/package.json']);
  assert.equal(publicManifest.private, undefined);
  assert.deepEqual(publicManifest.publishConfig, { access: 'public' });
  assert.match(publicFiles['.changeset/x-post-api-client-initial.md'], /'@shopana\/x-post-api-client': minor/);
});

test('--no-public leaves out the public client', () => {
  const files = renderFiles({ slug: 'x-post', name: 'X Post', public: false, private: false });
  assert.equal(files['packages/x-post-api-client/src/public/index.ts'], undefined);
  assert.equal(JSON.parse(files['packages/x-post-api-client/package.json']).exports['./public'], undefined);
  assert.doesNotMatch(files['packages/x-post-api-client/src/index.ts'], /public/);
});

test('the template contract declares its error answers and the template enforces 80% coverage', () => {
  const files = renderFiles({ slug: 'x-post', name: 'X Post', public: true, private: false });
  const contract = files['packages/x-post-api-client/src/simulator/contract.ts'];
  for (const status of ['400', '401', '404']) assert.match(contract, new RegExp(`"${status}": \\{\\s*"schema": \\{\\s*"\\$ref": "#/components/schemas/Error"`));
  assert.match(files['packages/x-post-api-client/jest.config.js'], /branches: 80, functions: 80, lines: 80, statements: 80/);
  assert.ok(files['packages/x-post-api-client/__tests__/errors.test.ts']);
});

test('writeFiles refuses to overwrite without --force and writes every file', () => {
  const target = mkdtempSync(join(tmpdir(), 'create-carrier-'));
  try {
    const files = renderFiles({ slug: 'x-post', name: 'X Post', public: true, private: false });
    writeFiles(files, { root: target });
    for (const [path, contents] of Object.entries(files)) assert.equal(readFileSync(join(target, path), 'utf8'), contents);
    assert.throws(() => writeFiles(files, { root: target }), /already exists/);
    writeFiles(files, { root: target, force: true });
  } finally {
    rmSync(target, { recursive: true, force: true });
  }
});

test('argument parsing and validation', () => {
  assert.deepEqual(parseArgs(['--slug', 'a-b', '--name', 'A', '--no-public', '--private', '--force', '--base-url', 'https://x']), {
    public: false,
    private: true,
    force: true,
    slug: 'a-b',
    name: 'A',
    baseUrl: 'https://x',
  });
  assert.throws(() => parseArgs(['--nope']), /Unknown argument/);
  assert.throws(() => validate({ slug: 'Bad_Slug', name: 'x' }), /kebab-case/);
  assert.throws(() => validate({ slug: 'ok', name: '' }), /--name is required/);
  assert.throws(() => validate({ slug: 'ok', name: 'x', baseUrl: 'http://x' }), /https/);
});

test('carrier-testing peer range survives 0.x minors, so a platform release is not a major for every carrier', () => {
  assert.equal(peerRange('0.1.0'), '>=0.1.0 <1.0.0');
  assert.equal(peerRange('1.2.3'), '^1.2.3');
  const manifest = JSON.parse(renderFiles({ slug: 'x-post', name: 'X Post', public: true, private: false })['packages/x-post-api-client/package.json']);
  const testingVersion = JSON.parse(readFileSync(join(root, 'packages/carrier-testing/package.json'), 'utf8')).version;
  assert.equal(manifest.peerDependencies['@shopana/carrier-testing'], peerRange(testingVersion));
});

test('changesets never versions private packages such as the scaffolder demo', () => {
  const config = JSON.parse(readFileSync(join(root, '.changeset/config.json'), 'utf8'));
  assert.deepEqual(config.privatePackages, { version: false, tag: false });
  assert.equal(config.___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH?.onlyUpdatePeerDependentsWhenOutOfRange, true);
});
