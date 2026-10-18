import { execFile } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

// Every non-private workspace package under packages/, so new carrier packages are checked
// without editing this list (same rule as tools/validate-changesets.mjs).
export async function readPublicPackages() {
  const packagesDir = new URL('../packages/', import.meta.url);
  const entries = await readdir(packagesDir, { withFileTypes: true });
  const packages = await Promise.all(
    entries
      .filter(entry => entry.isDirectory())
      .map(async entry => {
        const packageJsonPath = `packages/${entry.name}/package.json`;
        try {
          const packageJson = JSON.parse(await readFile(new URL(`../${packageJsonPath}`, import.meta.url), 'utf8'));
          return { packageJsonPath, packageJson };
        } catch {
          return undefined;
        }
      }),
  );
  return packages.filter(entry => entry !== undefined && entry.packageJson.private !== true);
}

export async function isVersionPublished(name, version) {
  try {
    await execFileAsync('npm', ['view', `${name}@${version}`, 'version', '--json'], { windowsHide: true });
    return true;
  } catch {
    return false;
  }
}
