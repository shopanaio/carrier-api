import { existsSync, readdirSync, readFileSync } from 'node:fs';

const minimumSummaryLength = 20;
const forbiddenSummaryPattern = /\b(todo|tbd|wip|placeholder)\b/i;

const changesetPaths =
  process.argv.length > 2 ? process.argv.slice(2) : findChangesetFiles();

if (changesetPaths.length === 0) {
  console.log('No changeset files to validate.');
  process.exit(0);
}

const errors = [];

for (const changesetPath of changesetPaths) {
  if (!existsSync(changesetPath)) {
    continue;
  }

  validateChangeset(changesetPath, readFileSync(changesetPath, 'utf8'), errors);
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

function validateChangeset(changesetPath, contents, validationErrors) {
  const parsed = parseChangeset(contents);

  if (!parsed) {
    validationErrors.push({
      path: changesetPath,
      message:
        'Changeset must include frontmatter followed by user-facing release text.',
    });
    return;
  }

  if (hasMajorChange(parsed.frontmatter)) {
    validationErrors.push({
      path: changesetPath,
      message: 'Major changesets are not allowed. Use patch or minor.',
    });
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

function hasMajorChange(frontmatter) {
  return frontmatter
    .split('\n')
    .some((line) =>
      /^["']?[^:"']+["']?\s*:\s*major\s*(?:#.*)?$/.test(line.trim()),
    );
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
