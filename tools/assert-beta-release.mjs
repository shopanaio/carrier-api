import { access, readFile } from 'node:fs/promises';

import {
  isVersionPublished,
  readPublicPackages,
} from './release-packages.mjs';

const preStatePath = new URL('../.changeset/pre.json', import.meta.url);

if (!(await fileExists(preStatePath))) {
  throw new Error(
    'Beta releases require Changesets pre mode. Merge the beta version PR first.',
  );
}

const state = JSON.parse(await readFile(preStatePath, 'utf8'));
if (state.mode !== 'pre' || state.tag !== 'beta') {
  throw new Error('.changeset/pre.json is not configured for beta releases');
}

for (const { packageJson } of await readPublicPackages()) {
  if (await isVersionPublished(packageJson.name, packageJson.version)) {
    continue;
  }

  if (!packageJson.version.includes('-beta.')) {
    throw new Error(
      `Beta release expected beta prerelease version for ${packageJson.name}@${packageJson.version}`,
    );
  }
}

function fileExists(fileUrl) {
  return access(fileUrl).then(
    () => true,
    () => false,
  );
}
