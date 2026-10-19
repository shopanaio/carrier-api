import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const cli = join(dirname(require.resolve('@changesets/cli/package.json')), 'bin.js');
const workflow = await readFile(new URL('../../.github/workflows/release.yml', import.meta.url), 'utf8');
const validation = workflow.split('      - name: Validate source changes have changesets')[1]
  .split('        run: |\n')[1].split('\n      - name:')[0]
  .split('\n').map(line => line.replace(/^ {10}/, '')).join('\n');

test('actual Changesets beta version commits pass release validation; unannotated source changes fail', async t => {
  const root = await mkdtemp(join(tmpdir(), 'carrier-beta-flow-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const run = (command, args, success = true) => {
    const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', timeout: 30000 });
    if (success) assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    return result;
  };
  const json = async (path, value) => {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), JSON.stringify(value, null, 2));
  };
  await json('package.json', { name: 'beta-fixture', private: true, workspaces: ['packages/*'] });
  await json('packages/core/package.json', { name: '@fixture/core', version: '0.0.1' });
  await json('packages/provider/package.json', {
    name: '@fixture/provider', version: '0.0.1', dependencies: { '@fixture/core': '^0.0.1' },
  });
  const config = JSON.parse(await readFile(new URL('../../.changeset/config.json', import.meta.url)));
  await json('.changeset/config.json', { ...config, changelog: false, ignore: [] });
  await json('.changeset/pre.json', {
    mode: 'pre', tag: 'beta', initialVersions: { '@fixture/core': '0.0.1', '@fixture/provider': '0.0.1' }, changesets: [],
  });
  await writeFile(join(root, '.changeset/initial.md'), '---\n"@fixture/core": minor\n"@fixture/provider": minor\n---\n\nAdd the carrier core and provider.\n');
  run('git', ['init', '-q']);
  const commit = () => {
    run('git', ['add', '.']);
    run('git', ['-c', 'user.name=Beta Test', '-c', 'user.email=beta@example.test', '-c', 'commit.gpgsign=false', 'commit', '-qm', 'fixture']);
    return run('git', ['rev-parse', 'HEAD']).stdout.trim();
  };
  const check = (before, after, success = true) => run('bash', ['-e', '-o', 'pipefail', '-c', validation
    .replaceAll('${{ github.event.before }}', before)
    .replaceAll('${{ github.sha }}', after)
    .replaceAll('${{ github.ref_name }}', 'beta')], success);

  const initial = commit();
  run(process.execPath, [cli, 'version']);
  const first = commit();
  assert.match(check(initial, first).stdout, /Beta package version update detected/);
  const provider = JSON.parse(await readFile(join(root, 'packages/provider/package.json')));
  assert.equal(provider.version, '0.1.0-beta.0');
  assert.equal(provider.dependencies['@fixture/core'], '^0.1.0-beta.0');

  await mkdir(join(root, 'packages/provider/src'));
  await writeFile(join(root, 'packages/provider/src/index.ts'), 'export const provider = true;\n');
  const unannotated = commit();
  assert.notEqual(check(first, unannotated, false).status, 0);

  await writeFile(join(root, '.changeset/provider-fix.md'), '---\n"@fixture/provider": patch\n---\n\nCorrect provider request serialization.\n');
  const source = commit();
  check(first, source);
  run(process.execPath, [cli, 'version']);
  const second = commit();
  assert.match(check(source, second).stdout, /Beta package version update detected/);
  assert.equal(JSON.parse(await readFile(join(root, 'packages/provider/package.json'))).version, '0.1.0-beta.1');
});
