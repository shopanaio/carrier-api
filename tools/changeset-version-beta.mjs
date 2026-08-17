import { access, readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const preStatePath = new URL('../.changeset/pre.json', import.meta.url);

if (await fileExists(preStatePath)) {
  await assertBetaPreMode(preStatePath);
} else {
  await run('changeset', ['pre', 'enter', 'beta']);
}

await run('changeset', ['version']);

function fileExists(fileUrl) {
  return access(fileUrl).then(
    () => true,
    () => false,
  );
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `${command} ${args.join(' ')} failed with ${signal ?? `exit code ${code}`}`,
        ),
      );
    });
  });
}

async function assertBetaPreMode(fileUrl) {
  const state = JSON.parse(await readFile(fileUrl, 'utf8'));
  if (state.mode !== 'pre' || state.tag !== 'beta') {
    throw new Error(
      '.changeset/pre.json exists, but it is not in beta prerelease mode',
    );
  }
}
