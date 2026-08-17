import { access } from 'node:fs/promises';

import {
  isVersionPublished,
  readPublicPackages,
} from './release-packages.mjs';

if (await fileExists(new URL('../.changeset/pre.json', import.meta.url))) {
  throw new Error(
    'Stable releases must not run while Changesets pre mode is active',
  );
}

for (const { packageJson } of await readPublicPackages()) {
  if (await isVersionPublished(packageJson.name, packageJson.version)) {
    continue;
  }

  if (packageJson.version.includes('-')) {
    throw new Error(
      `Stable release cannot publish prerelease version ${packageJson.name}@${packageJson.version}`,
    );
  }
}

function fileExists(fileUrl) {
  return access(fileUrl).then(
    () => true,
    () => false,
  );
}
