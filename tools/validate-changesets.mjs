import { existsSync, readdirSync, readFileSync } from 'node:fs';

const minimumSummaryLength = 20;
const forbiddenSummaryPattern = /\b(todo|tbd|wip|placeholder)\b/i;

const parsedArguments = parseArguments(process.argv.slice(2));
const changesetPaths =
  parsedArguments.changesetPaths.length > 0
    ? parsedArguments.changesetPaths
    : findChangesetFiles();
const publicPackages = findPublicPackages();

if (changesetPaths.length === 0) {
  console.log('No changeset files to validate.');
  process.exit(0);
}

const errors = [];
const releasedPackages = new Set();

for (const changesetPath of changesetPaths) {
  if (!existsSync(changesetPath)) {
    continue;
  }

  for (const packageName of validateChangeset(
    changesetPath,
    readFileSync(changesetPath, 'utf8'),
    publicPackages,
    errors,
  )) {
    releasedPackages.add(packageName);
  }
}

for (const packageDir of parsedArguments.changedPackageDirs) {
  const packageJsonPath = `${packageDir}/package.json`;

  if (!existsSync(packageJsonPath)) {
    errors.push({
      path: packageJsonPath,
      message: `Changed package directory ${packageDir} has no package.json.`,
    });
    continue;
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  if (packageJson.private === true) {
    continue;
  }

  if (!releasedPackages.has(packageJson.name)) {
    errors.push({
      path: packageJsonPath,
      message: `Changes to ${packageJson.name} require a patch or minor entry in a Changeset.`,
    });
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(
      `::error file=${annotationValue(error.path)}::${annotationValue(
        error.message,
      )}`,
    );
  }

  process.exit(1);
}

console.log('Changeset release notes look good.');

function validateChangeset(
  changesetPath,
  contents,
  knownPackages,
  validationErrors,
) {
  const parsed = parseChangeset(contents);

  if (!parsed) {
    validationErrors.push({
      path: changesetPath,
      message:
        'Changeset must include frontmatter followed by user-facing release text.',
    });
    return [];
  }

  const releases = parseReleases(parsed.frontmatter);
  if (!releases) {
    validationErrors.push({
      path: changesetPath,
      message:
        'Changeset frontmatter must contain package names with patch or minor release types.',
    });
    return [];
  }

  for (const release of releases) {
    if (!knownPackages.has(release.name)) {
      validationErrors.push({
        path: changesetPath,
        message: `Unknown or private package in Changeset: ${release.name}.`,
      });
    }

    if (release.type === 'major') {
      validationErrors.push({
        path: changesetPath,
        message: 'Major changesets are not allowed. Use patch or minor.',
      });
    }
  }

  const summary = normalizeSummary(parsed.body);

  if (summary.length < minimumSummaryLength) {
    validationErrors.push({
      path: changesetPath,
      message: `Changeset release text must be at least ${minimumSummaryLength} characters.`,
    });
  }

  if (forbiddenSummaryPattern.test(summary)) {
    validationErrors.push({
      path: changesetPath,
      message:
        'Changeset release text must be final user-facing content, not a placeholder.',
    });
  }

  return releases
    .filter(
      release =>
        release.type !== 'major' && knownPackages.has(release.name),
    )
    .map(release => release.name);
}

function parseChangeset(contents) {
  const normalized = contents.replaceAll('\r\n', '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!match) {
    return null;
  }

  return {
    frontmatter: match[1],
    body: match[2],
  };
}

function parseReleases(frontmatter) {
  const lines = frontmatter
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#'));

  if (lines.length === 0) {
    return null;
  }

  const releases = [];
  for (const line of lines) {
    const match = line.match(
      /^(?:'([^']+)'|"([^"]+)"|([^'"\s][^:]*?))\s*:\s*(patch|minor|major)\s*(?:#.*)?$/,
    );

    if (!match) {
      return null;
    }

    releases.push({
      name: (match[1] ?? match[2] ?? match[3]).trim(),
      type: match[4],
    });
  }

  return releases;
}

function normalizeSummary(body) {
  return body
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function annotationValue(value) {
  return value
    .replaceAll('%', '%25')
    .replaceAll('\r', '%0D')
    .replaceAll('\n', '%0A');
}

function findChangesetFiles() {
  if (!existsSync('.changeset')) {
    return [];
  }

  return readdirSync('.changeset')
    .filter((fileName) => fileName.endsWith('.md'))
    .sort()
    .map((fileName) => `.changeset/${fileName}`);
}

function findPublicPackages() {
  if (!existsSync('packages')) {
    return new Set();
  }

  return new Set(
    readdirSync('packages')
      .map(packageDir => `packages/${packageDir}/package.json`)
      .filter(packageJsonPath => existsSync(packageJsonPath))
      .map(packageJsonPath =>
        JSON.parse(readFileSync(packageJsonPath, 'utf8')),
      )
      .filter(packageJson => packageJson.private !== true)
      .map(packageJson => packageJson.name),
  );
}

function parseArguments(args) {
  const changedPackageDirs = [];
  const changesetPaths = [];
  let pathsOnly = false;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (!pathsOnly && argument === '--') {
      pathsOnly = true;
      continue;
    }

    if (!pathsOnly && argument === '--changed-package-dir') {
      const packageDir = args[index + 1];
      if (!packageDir) {
        throw new Error('--changed-package-dir requires a directory path');
      }
      changedPackageDirs.push(packageDir);
      index += 1;
      continue;
    }

    changesetPaths.push(argument);
  }

  return { changedPackageDirs, changesetPaths };
}
