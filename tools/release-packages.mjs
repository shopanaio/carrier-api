import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export const publicPackageJsonPaths = [
  'packages/novaposhta-api-client/package.json',
  'packages/novaposhta-transport-fetch/package.json',
  'packages/novaposhta-mcp-server/package.json',
];

export async function readPublicPackages() {
  return Promise.all(
    publicPackageJsonPaths.map(async (packageJsonPath) => ({
      packageJsonPath,
      packageJson: JSON.parse(
        await readFile(
          new URL(`../${packageJsonPath}`, import.meta.url),
          'utf8',
        ),
      ),
    })),
  );
}

export async function isVersionPublished(name, version) {
  try {
    await execFileAsync(
      'npm',
      ['view', `${name}@${version}`, 'version', '--json'],
      { windowsHide: true },
    );
    return true;
  } catch {
    return false;
  }
}
