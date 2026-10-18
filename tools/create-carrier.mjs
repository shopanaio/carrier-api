#!/usr/bin/env node
// Scaffolds packages/<slug>-api-client on top of carrier-core / carrier-contracts / carrier-testing.
//
//   node tools/create-carrier.mjs --slug ukrposhta --name "Ukrposhta" [--no-public] [--private] [--base-url https://...] [--force]
//
// --private marks the package `"private": true` (never published) and skips the changeset; used for
// packages/demo-post-api-client, which must stay identical to this output (tools/__tests__ checks it).
//
// Layout (see the implementation plans): src/public (no-contract API), src/contract (credentialed API),
// src/adapter (carrier-contracts capabilities), src/simulator (contract simulator for tests),
// contracts/ (machine-readable API contracts), __tests__/, README, changeset.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function parseArgs(argv) {
  const options = { public: true, private: false, force: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--no-public') options.public = false;
    else if (arg === '--force') options.force = true;
    else if (arg === '--private') options.private = true;
    else if (arg === '--slug') options.slug = argv[++i];
    else if (arg === '--name') options.name = argv[++i];
    else if (arg === '--base-url') options.baseUrl = argv[++i];
    else if (arg === '--root') options.root = argv[++i];
    else if (arg === '--help' || arg === '-h') options.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

export function validate(options) {
  if (!options.slug || !/^[a-z][a-z0-9-]*[a-z0-9]$/.test(options.slug)) {
    throw new Error('--slug must be kebab-case, e.g. "ukrposhta" or "dhl-express"');
  }
  if (!options.name) throw new Error('--name is required, e.g. "Ukrposhta"');
  if (options.baseUrl && !/^https:\/\//.test(options.baseUrl)) throw new Error('--base-url must start with https://');
}

const pascal = slug =>
  slug
    .split('-')
    .map(s => s[0].toUpperCase() + s.slice(1))
    .join('');
const camel = slug => pascal(slug)[0].toLowerCase() + pascal(slug).slice(1);

/** Returns `{ path: contents }` for every file of the new package (paths relative to the repo root). */
export function renderFiles(options) {
  const { slug, name } = options;
  const pkg = `${slug}-api-client`;
  const dir = `packages/${pkg}`;
  const P = pascal(slug);
  const c = camel(slug);
  const baseUrl = options.baseUrl ?? `https://api.${slug}.example/v1`;
  const withPublic = options.public;
  const coreVersion = readVersion('carrier-core');
  const contractsVersion = readVersion('carrier-contracts');
  const testingVersion = readVersion('carrier-testing');

  const entries = {
    index: 'src/index.ts',
    'contract/index': 'src/contract/index.ts',
    'adapter/index': 'src/adapter/index.ts',
    'simulator/index': 'src/simulator/index.ts',
  };
  if (withPublic) entries['public/index'] = 'src/public/index.ts';
  const exportEntry = sub => ({
    types: `./dist/${sub}.d.ts`,
    import: `./dist/${sub}.mjs`,
    require: `./dist/${sub}.cjs`,
  });

  const files = {};

  files[`${dir}/package.json`] =
    JSON.stringify(
      {
        name: `@shopana/${pkg}`,
        version: '0.0.0',
        ...(options.private ? { private: true } : {}),
        description: `Typed ${name} API client with a carrier-contracts adapter and a contract simulator`,
        main: 'dist/index.cjs',
        module: 'dist/index.mjs',
        types: 'dist/index.d.ts',
        files: ['dist/**/*', 'contracts/**/*', 'README.md', 'LICENSE'],
        scripts: {
          build: 'npm run clean && rollup -c rollup.config.mjs && tsc -p tsconfig.json --emitDeclarationOnly',
          clean: 'rm -rf dist',
          'type-check': 'tsc --noEmit -p tsconfig.json',
          test: 'jest',
          'test:coverage': 'jest --coverage',
        },
        keywords: ['carrier', 'carrier-api', 'shipping', 'logistics', slug, 'typescript'],
        author: 'Shopana.io',
        license: 'Apache-2.0',
        repository: { type: 'git', url: 'https://github.com/shopanaio/carrier-api.git', directory: dir },
        bugs: { url: 'https://github.com/shopanaio/carrier-api/issues' },
        homepage: `https://github.com/shopanaio/carrier-api/tree/main/${dir}#readme`,
        dependencies: {
          '@shopana/carrier-core': `^${coreVersion}`,
          '@shopana/carrier-contracts': `^${contractsVersion}`,
        },
        // A wide range: with `^0.x` every carrier-testing minor would leave the range and changesets
        // would give every carrier package a major release (see onlyUpdatePeerDependentsWhenOutOfRange).
        peerDependencies: { '@shopana/carrier-testing': peerRange(testingVersion) },
        peerDependenciesMeta: { '@shopana/carrier-testing': { optional: true } },
        devDependencies: { '@shopana/carrier-testing': `^${testingVersion}` },
        exports: {
          '.': exportEntry('index'),
          ...(withPublic ? { './public': exportEntry('public/index') } : {}),
          './contract': exportEntry('contract/index'),
          './adapter': exportEntry('adapter/index'),
          // Test-only: pulls in @shopana/carrier-testing.
          './simulator': exportEntry('simulator/index'),
          './package.json': './package.json',
        },
        sideEffects: false,
        engines: { node: '>=18' },
        ...(options.private ? {} : { publishConfig: { access: 'public' } }),
      },
      null,
      2,
    ) + '\n';

  files[`${dir}/tsconfig.json`] = readFileSync(join(root, 'packages/carrier-core/tsconfig.json'), 'utf8');

  files[`${dir}/jest.config.js`] = `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\\\.ts$': ['ts-jest', { tsconfig: { module: 'commonjs', esModuleInterop: true, isolatedModules: true } }],
  },
  moduleNameMapper: {
    // Platform packages are tested from source, so no build is needed before \`jest\`.
    '^@shopana/(carrier-core|carrier-contracts|carrier-testing)$': '<rootDir>/../$1/src',
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/index.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 },
  },
};
`;

  files[`${dir}/rollup.config.mjs`] = `import { createPackageConfig } from '../../tools/rollup-package.mjs';

export default createPackageConfig({
  input: ${JSON.stringify(entries, null, 2).replace(/\n/g, '\n  ')},
  external: ['@shopana/carrier-core', '@shopana/carrier-contracts', '@shopana/carrier-testing'],
});
`;

  files[`${dir}/LICENSE`] = readFileSync(join(root, 'LICENSE'), 'utf8');

  files[`${dir}/src/index.ts`] = `// code and comments in English
${withPublic ? `export * from './public';\n` : ''}export * from './contract';
`;

  if (withPublic) {
    files[`${dir}/src/public/config.ts`] = `// code and comments in English
import type { HttpTransport, RetryOptions } from '@shopana/carrier-core';

export const ${c.toUpperCase().replace(/-/g, '_')}_PUBLIC_BASE_URL = '${baseUrl}/public';

export interface ${P}PublicConfig {
  transport: HttpTransport;
  baseUrl?: string;
  retry?: RetryOptions | false;
  timeoutMs?: number;
}
`;
    files[`${dir}/src/public/index.ts`] = `// code and comments in English
import { createClient, createHttpClient, noAuth } from '@shopana/carrier-core';
import type { ClientContext } from '@shopana/carrier-core';
import { ${c.toUpperCase().replace(/-/g, '_')}_PUBLIC_BASE_URL } from './config';
import type { ${P}PublicConfig } from './config';

export * from './config';

export type ${P}PublicContext = ClientContext<${P}PublicConfig>;

/** Client for the ${name} API that needs no contract credentials. Add services with \`.use(...)\`. */
export function create${P}PublicClient(config: ${P}PublicConfig) {
  const http = createHttpClient({
    carrier: '${slug}',
    baseUrl: config.baseUrl ?? ${c.toUpperCase().replace(/-/g, '_')}_PUBLIC_BASE_URL,
    transport: config.transport,
    auth: noAuth(),
    retry: config.retry,
    timeoutMs: config.timeoutMs,
  });
  return createClient<${P}PublicContext>({ http, config });
}
`;
  }

  files[`${dir}/src/contract/config.ts`] = `// code and comments in English
import type { HttpTransport, RetryOptions, Secret } from '@shopana/carrier-core';

export type ${P}Environment = 'production' | 'sandbox';

export const ${c.toUpperCase().replace(/-/g, '_')}_BASE_URLS: Record<${P}Environment, string> = {
  production: '${baseUrl}',
  sandbox: '${baseUrl.replace('://', '://sandbox.')}',
};

export interface ${P}ContractConfig {
  transport: HttpTransport;
  environment?: ${P}Environment;
  /** Overrides the environment's base URL. */
  baseUrl?: string;
  apiKey: Secret;
  retry?: RetryOptions | false;
  timeoutMs?: number;
}
`;

  files[`${dir}/src/contract/errors.ts`] = `// code and comments in English
import { CarrierError, categoryFromHttpStatus } from '@shopana/carrier-core';
import type { HttpResponse } from '@shopana/carrier-core';

/** Maps a non-2xx ${name} response to CarrierError. Extend with the carrier's error catalog. */
export function map${P}Error(response: HttpResponse<unknown>): CarrierError {
  const body = (response.data ?? {}) as { code?: string; message?: string; field?: string };
  return new CarrierError({
    carrier: '${slug}',
    code: body.code ?? \`HTTP_\${response.status}\`,
    message: body.message ?? \`HTTP \${response.status}\`,
    category: categoryFromHttpStatus(response.status),
    httpStatus: response.status,
    ...(body.field ? { field: body.field } : {}),
    raw: response.data,
  });
}
`;

  files[`${dir}/src/contract/services/trackingService.ts`] = `// code and comments in English
import type { ${P}ContractContext } from '../index';

export interface ${P}TrackingEvent {
  code: string;
  description?: string;
  date: string;
}

/** Example service: replace with the carrier's real tracking endpoint and wire types. */
export class TrackingService {
  readonly namespace = 'tracking' as const;
  private ctx!: ${P}ContractContext;

  attach(ctx: ${P}ContractContext) {
    this.ctx = ctx;
  }

  getEvents(trackingNumber: string, options: { signal?: AbortSignal } = {}): Promise<${P}TrackingEvent[]> {
    return this.ctx.http.request<${P}TrackingEvent[]>({
      method: 'GET',
      path: '/tracking/{trackingNumber}',
      pathParams: { trackingNumber },
      signal: options.signal,
    });
  }
}
`;

  files[`${dir}/src/contract/index.ts`] = `// code and comments in English
import { apiKey, createClient, createHttpClient } from '@shopana/carrier-core';
import type { ClientContext } from '@shopana/carrier-core';
import { ${c.toUpperCase().replace(/-/g, '_')}_BASE_URLS } from './config';
import type { ${P}ContractConfig } from './config';
import { map${P}Error } from './errors';

export * from './config';
export * from './errors';
export * from './services/trackingService';

export type ${P}ContractContext = ClientContext<${P}ContractConfig>;

/** Client for the credentialed ${name} API. Add services with \`.use(...)\`. */
export function create${P}ContractClient(config: ${P}ContractConfig) {
  const http = createHttpClient({
    carrier: '${slug}',
    baseUrl: config.baseUrl ?? ${c.toUpperCase().replace(/-/g, '_')}_BASE_URLS[config.environment ?? 'production'],
    transport: config.transport,
    auth: apiKey({ in: 'header', name: 'Authorization', prefix: 'Bearer ', value: config.apiKey }),
    retry: config.retry,
    timeoutMs: config.timeoutMs,
    mapError: map${P}Error,
  });
  return createClient<${P}ContractContext>({ http, config });
}
`;

  files[`${dir}/src/adapter/statusMap.ts`] = `// code and comments in English
import { createStatusMapper } from '@shopana/carrier-contracts';

/** ${name} status code → normalized status. Unknown codes map to \`unknown\`; keep the raw code. */
export const ${c}StatusMap = createStatusMapper({
  CREATED: 'pre_transit',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
});
`;

  files[`${dir}/src/adapter/index.ts`] = `// code and comments in English
import { defineAdapter, latestStatus } from '@shopana/carrier-contracts';
import type { TrackingEvent } from '@shopana/carrier-contracts';
import { CarrierError, CarrierErrorCategory } from '@shopana/carrier-core';
import type { Client } from '@shopana/carrier-core';
import type { ${P}ContractContext, TrackingService } from '../contract';
import { ${c}StatusMap } from './statusMap';

export { ${c}StatusMap } from './statusMap';

export type ${P}AdapterClient = Client<{ tracking: TrackingService }, ${P}ContractContext>;

/** carrier-contracts adapter. Declare a capability only once its methods are implemented. */
export function create${P}Adapter(client: ${P}AdapterClient) {
  return defineAdapter({
    carrier: '${slug}',
    capabilities: ['tracking'],
    trackingPolicy: { pollingAllowed: true },
    async track(trackingNumbers, options) {
      return Promise.all(
        trackingNumbers.map(async trackingNumber => {
          try {
            const raw = await client.tracking.getEvents(trackingNumber, options);
            const events: TrackingEvent[] = raw
              .map(e => ({ status: ${c}StatusMap(e.code), rawCode: e.code, rawDescription: e.description, occurredAt: e.date }))
              .sort((a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt));
            return { trackingNumber, carrier: '${slug}', status: latestStatus(events), events, found: true };
          } catch (error) {
            if (error instanceof CarrierError && error.category === CarrierErrorCategory.NotFound) {
              return { trackingNumber, carrier: '${slug}', status: 'unknown' as const, events: [], found: false };
            }
            throw error;
          }
        }),
      );
    },
  });
}
`;

  files[`${dir}/src/simulator/index.ts`] = `// code and comments in English
// Test-only entry point: depends on @shopana/carrier-testing.
import { SimClock, SimStore, createSimulator, httpError, json } from '@shopana/carrier-testing';
import { ${c.toUpperCase().replace(/-/g, '_')}_BASE_URLS } from '../contract/config';
import { ${c}Contract } from './contract';

export { ${c}Contract } from './contract';

interface ShipmentRow {
  trackingNumber: string;
  events: Array<{ code: string; date: string }>;
}

/** Contract simulator for ${name}. Handlers hold only business logic; validation comes from the contract. */
export function create${P}Simulator(options: { clock?: SimClock; state?: SimStore; baseUrl?: string } = {}) {
  const clock = options.clock ?? new SimClock();
  const state = options.state ?? new SimStore();
  const shipments = state.collection<ShipmentRow>('shipments');

  const sim = createSimulator({
    contract: ${c}Contract,
    baseUrl: options.baseUrl ?? [${c.toUpperCase().replace(/-/g, '_')}_BASE_URLS.production, ${c.toUpperCase().replace(/-/g, '_')}_BASE_URLS.sandbox],
    clock,
    state,
    auth: ctx => (ctx.headers.authorization?.startsWith('Bearer ') ? undefined : { status: 401, body: { code: 'UNAUTHORIZED', message: 'Missing bearer token' } }),
    invalidRequest: issues => ({ status: 400, body: { code: 'VALIDATION', message: issues[0].message, field: issues[0].field } }),
    handlers: {
      getTracking: ctx => {
        const row = shipments.get(String(ctx.params.trackingNumber));
        if (!row) throw httpError(404, { code: 'NOT_FOUND', message: 'Unknown tracking number' });
        return json(row.events);
      },
    },
  });

  /** Seeds a shipment with events, for tests. */
  const seed = (trackingNumber: string, codes: string[]) => {
    const events = codes.map(code => {
      clock.advance(3_600_000);
      return { code, date: clock.toISOString() };
    });
    return shipments.upsert(trackingNumber, { trackingNumber, events });
  };

  return Object.assign(sim, { seed });
}
`;

  files[`${dir}/src/simulator/contract.ts`] =
    `// code and comments in English\n// Contract of the ${name} API used by the simulator. Keep raw carrier specs in contracts/.\nimport { defineContract } from '@shopana/carrier-testing';\n\nexport const ${c}Contract = defineContract(` +
    JSON.stringify(
      {
        name: slug,
        baseUrl,
        components: {
          schemas: {
            Error: {
              type: 'object',
              required: ['code', 'message'],
              properties: { code: { type: 'string' }, message: { type: 'string' }, field: { type: 'string' } },
            },
          },
        },
        operations: [
          {
            id: 'getTracking',
            method: 'GET',
            path: '/tracking/{trackingNumber}',
            params: { path: { type: 'object', properties: { trackingNumber: { type: 'string', minLength: 1 } } } },
            responses: {
              200: {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['code', 'date'],
                    properties: {
                      code: { type: 'string' },
                      description: { type: 'string' },
                      date: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
              // Every error answer (validation, auth, unknown number) uses the Error body read by the error mapper.
              400: { schema: { $ref: '#/components/schemas/Error' } },
              401: { schema: { $ref: '#/components/schemas/Error' } },
              404: { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
        ],
      },
      null,
      2,
    ) +
    ');\n';

  files[`${dir}/contracts/README.md`] = `# ${name} contracts

Machine-readable API contracts of the carrier.

Put raw carrier specs here (Swagger/OpenAPI snapshots, Postman exports, notes from PDFs). The simulator contract lives in \`src/simulator/contract.ts\`: hand-written with \`defineContract\`, or built from a snapshot with \`contractFromOpenApi\`.

Update a contract in its own commit so the diff shows what changed in the carrier API.
`;

  files[`${dir}/__tests__/tracking.test.ts`] =
    `import { runAdapterConformance, SimClock } from '@shopana/carrier-testing';
import { create${P}Adapter } from '../src/adapter';
import { create${P}ContractClient, TrackingService } from '../src/contract';
import { create${P}Simulator } from '../src/simulator';

function setup() {
  const clock = new SimClock();
  const sim = create${P}Simulator({ clock });
  const client = create${P}ContractClient({ transport: sim.transport, apiKey: 'test-key', retry: { sleep: clock.sleep, clock } }).use(new TrackingService());
  return { sim, client, adapter: create${P}Adapter(client) };
}

describe('${name} tracking', () => {
  it('reads events through the contract client', async () => {
    const { sim, client } = setup();
    sim.seed('TN1', ['CREATED', 'IN_TRANSIT']);
    const events = await client.tracking.getEvents('TN1');
    expect(events.map(e => e.code)).toEqual(['CREATED', 'IN_TRANSIT']);
    expect(sim.calls[0]!.headers.authorization).toBe('Bearer test-key');
  });

  it('maps unknown numbers and retries 5xx', async () => {
    const { sim, adapter } = setup();
    sim.seed('TN1', ['CREATED', 'DELIVERED']);
    sim.fail({ operation: 'getTracking', status: 503 });
    const [found, missing] = await adapter.track(['TN1', 'NOPE']);
    expect(found).toMatchObject({ status: 'delivered', found: true });
    expect(missing).toMatchObject({ status: 'unknown', found: false });
  });
});

runAdapterConformance('${name}', () => {
  const { sim, adapter } = setup();
  sim.seed('TN1', ['CREATED']);
  return { adapter, scenario: { unknownTrackingNumber: 'NOPE' } };
});
`;

  files[`${dir}/__tests__/errors.test.ts`] = `import { map${P}Error } from '../src/contract';

describe('map${P}Error', () => {
  it('takes code, message and field from the error body', () => {
    const error = map${P}Error({ status: 400, headers: {}, data: { code: 'VALIDATION', message: 'bad phone', field: 'phone' } });
    expect(error).toMatchObject({ carrier: '${slug}', code: 'VALIDATION', message: 'bad phone', field: 'phone', category: 'validation', httpStatus: 400 });
  });

  it('falls back to the HTTP status when the body has no details', () => {
    const error = map${P}Error({ status: 503, headers: {}, data: undefined });
    expect(error).toMatchObject({ code: 'HTTP_503', message: 'HTTP 503', category: 'server', retryable: true });
    expect(error.field).toBeUndefined();
  });
});
`;

  files[`${dir}/README.md`] = `# @shopana/${pkg}

Typed ${name} API client for Node.js, built on \`@shopana/carrier-core\`.

| Entry | What |
|---|---|
${withPublic ? `| \`@shopana/${pkg}/public\` | API that needs no contract credentials |\n` : ''}| \`@shopana/${pkg}/contract\` | Credentialed API |
| \`@shopana/${pkg}/adapter\` | \`carrier-contracts\` adapter |
| \`@shopana/${pkg}/simulator\` | Contract simulator for tests (needs \`@shopana/carrier-testing\`) |

## Getting access

Describe how to get credentials (contract, sandbox, certification), which API each credential unlocks, and the rate limits.

## Usage

\`\`\`ts
import { createFetchTransport } from '@shopana/carrier-core';
import { create${P}ContractClient, TrackingService } from '@shopana/${pkg}/contract';

const client = create${P}ContractClient({ transport: createFetchTransport(), apiKey: process.env.${slug.toUpperCase().replace(/-/g, '_')}_API_KEY! })
  .use(new TrackingService());

const events = await client.tracking.getEvents('TRACKING_NUMBER');
\`\`\`

## Testing

Unit and conformance tests run against \`src/simulator\` built from \`contracts/\`; no network. Smoke tests against the live API live in \`e2e/__tests__/${slug}/\` and run only on explicit request.

## Known limitations and deprecations

List API sunsets and missing operations here.
`;

  // A private package is never released, so it needs no changeset.
  if (!options.private) {
    files[`.changeset/${pkg}-initial.md`] = `---
'@shopana/${pkg}': minor
---

Add the ${name} API client package: contract client${withPublic ? ', public client' : ''}, carrier-contracts adapter with tracking, and a contract simulator for tests.
`;
  }

  return files;
}

/**
 * Formats the TypeScript and JavaScript files with the repository's Prettier config, so a fresh package
 * passes `yarn lint` as generated. Manifests keep the JSON.stringify layout that yarn and changesets write.
 */
export async function formatFiles(files) {
  const prettier = await import('prettier');
  const formatted = {};
  for (const [path, contents] of Object.entries(files)) {
    if (!/\.(ts|js)$/.test(path)) {
      formatted[path] = contents;
      continue;
    }
    const config = (await prettier.resolveConfig(join(root, path))) ?? {};
    formatted[path] = await prettier.format(contents, { ...config, filepath: path });
  }
  return formatted;
}

/** `>=0.y.z <1.0.0` while the platform is 0.x, then the usual caret range. */
export function peerRange(version) {
  return version.startsWith('0.') ? `>=${version} <1.0.0` : `^${version}`;
}

function readVersion(pkg) {
  return JSON.parse(readFileSync(join(root, 'packages', pkg, 'package.json'), 'utf8')).version;
}

export function writeFiles(files, { root: target = root, force = false } = {}) {
  const pkgJson = Object.keys(files).find(p => p.endsWith('/package.json'));
  if (existsSync(join(target, dirname(pkgJson))) && !force) {
    throw new Error(`${dirname(pkgJson)} already exists (use --force to overwrite)`);
  }
  for (const [path, contents] of Object.entries(files)) {
    const full = join(target, path);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, contents);
  }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      console.log(
        'Usage: node tools/create-carrier.mjs --slug <kebab-slug> --name "<Display Name>" [--no-public] [--private] [--base-url https://...] [--force]',
      );
      process.exit(0);
    }
    validate(options);
    const files = await formatFiles(renderFiles(options));
    writeFiles(files, { root: options.root ? resolve(options.root) : root, force: options.force });
    console.log(
      `Created packages/${options.slug}-api-client (${Object.keys(files).length} files). Next: yarn install && yarn workspace @shopana/${options.slug}-api-client test`,
    );
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
