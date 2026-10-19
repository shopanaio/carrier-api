import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { publishBeta } from '../publish-beta.mjs';

async function fixture(t, state = { mode: 'pre', tag: 'beta' }) {
  const dir = await mkdtemp(join(tmpdir(), 'carrier-beta-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const preStatePath = join(dir, 'pre.json');
  await writeFile(preStatePath, JSON.stringify(state));
  return { preStatePath, contents: await readFile(preStatePath, 'utf8') };
}

const packages = (...versions) => async () => versions.map((version, i) => ({
  packageJson: { name: `@shopana/package-${i}`, version },
}));

test('publishes first and subsequent beta versions with pre state hidden, then restores it', async t => {
  const f = await fixture(t);
  let called = false;
  await publishBeta({
    ...f,
    readPackages: packages('0.1.0-beta.0', '0.1.0-beta.1'),
    isPublished: () => assert.fail('Beta versions do not need a registry precheck'),
    publish: async (command, args) => {
      assert.equal(command, 'yarn');
      assert.deepEqual(args, ['changeset', 'publish', '--tag', 'beta']);
      called = true;
      await assert.rejects(readFile(f.preStatePath), { code: 'ENOENT' });
    },
  });
  assert.equal(called, true);
  assert.equal(await readFile(f.preStatePath, 'utf8'), f.contents);
});

test('restores prerelease state after a failed publish', async t => {
  const f = await fixture(t);
  await assert.rejects(publishBeta({
    ...f,
    readPackages: packages('0.1.0-beta.0'),
    publish: () => { throw new Error('npm failed'); },
  }), /npm failed/);
  assert.equal(await readFile(f.preStatePath, 'utf8'), f.contents);
});

test('allows unchanged stable packages that are already published', async t => {
  const f = await fixture(t);
  let called = false;
  await publishBeta({
    ...f,
    readPackages: packages('0.0.1', '0.1.0-beta.0'),
    isPublished: async (name, version) => name === '@shopana/package-0' && version === '0.0.1',
    publish: () => { called = true; },
  });
  assert.equal(called, true);
});

for (const version of ['0.1.0', '0.1.0-alpha.0']) {
  test(`rejects unpublished ${version} before invoking the publisher`, async t => {
    const f = await fixture(t);
    await assert.rejects(publishBeta({
      ...f,
      readPackages: packages(version),
      isPublished: async () => false,
      publish: () => assert.fail('Must not publish'),
    }), /cannot publish/);
    assert.equal(await readFile(f.preStatePath, 'utf8'), f.contents);
  });
}

for (const state of [{ mode: 'exit', tag: 'beta' }, { mode: 'pre', tag: 'alpha' }]) {
  test(`rejects ${state.mode}/${state.tag} prerelease state`, async t => {
    const f = await fixture(t, state);
    await assert.rejects(publishBeta({
      ...f,
      readPackages: () => assert.fail('Must stop before reading packages'),
      publish: () => assert.fail('Must not publish'),
    }), /requires active Changesets pre mode/);
  });
}
