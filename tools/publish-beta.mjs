import { spawnSync } from 'node:child_process';
import { readFile, rename } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { isVersionPublished, readPublicPackages } from './release-packages.mjs';

export async function publishBeta({
  preStatePath = fileURLToPath(new URL('../.changeset/pre.json', import.meta.url)),
  readPackages = readPublicPackages,
  isPublished = isVersionPublished,
  publish = (command, args) => {
    const result = spawnSync(command, args, { stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`Beta publication failed (${result.signal ?? result.status})`);
  },
} = {}) {
  const preState = JSON.parse(await readFile(preStatePath, 'utf8'));
  if (preState.mode !== 'pre' || preState.tag !== 'beta') {
    throw new Error('Beta publication requires active Changesets pre mode with the beta tag');
  }

  for (const { packageJson } of await readPackages()) {
    if (/^\d+\.\d+\.\d+-beta\.\d+$/.test(packageJson.version)) continue;
    if (await isPublished(packageJson.name, packageJson.version)) continue;
    throw new Error(`Beta publication cannot publish ${packageJson.name}@${packageJson.version}; run changeset version first`);
  }

  // Changesets v2 rejects --tag in pre mode and can choose latest for new packages.
  // Hide only the pre state during publication so the explicit beta tag always wins.
  // Versioning still uses pre mode, including its internal dependency updates.
  const backupPath = `${preStatePath}.publishing-${process.pid}`;
  await rename(preStatePath, backupPath);
  try {
    await publish('yarn', ['changeset', 'publish', '--tag', 'beta']);
  } finally {
    await rename(backupPath, preStatePath);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await publishBeta();
}
