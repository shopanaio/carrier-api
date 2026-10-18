import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';

import { isVersionPublished, readPublicPackages } from './release-packages.mjs';

// Publishes the public packages. While Changesets pre mode is active (.changeset/pre.json) only prerelease
// versions are published, under the pre-release dist-tag; otherwise only stable versions are published as `latest`.
const preState = await readPreState();
const tag = preState?.tag ?? 'latest';

for (const { packageJson } of await readPublicPackages()) {
  if (await isVersionPublished(packageJson.name, packageJson.version)) {
    continue;
  }

  const isPrerelease = packageJson.version.includes('-');
  if (preState && !isPrerelease) {
    throw new Error(`Pre mode is active but ${packageJson.name}@${packageJson.version} is not a prerelease version`);
  }
  if (!preState && isPrerelease) {
    throw new Error(`Stable release cannot publish prerelease version ${packageJson.name}@${packageJson.version}`);
  }
}

run('yarn', ['build']);
run('yarn', ['pack:dry-run']);
run('yarn', ['changeset', 'publish', '--tag', tag]);

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

async function readPreState() {
  try {
    return JSON.parse(await readFile(new URL('../.changeset/pre.json', import.meta.url), 'utf8'));
  } catch {
    return undefined;
  }
}
