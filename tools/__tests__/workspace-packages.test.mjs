import assert from 'node:assert/strict';
import { test } from 'node:test';
import { listPackages, sortByDependencies } from '../workspace-packages.mjs';

const pkg = (name, dependsOn = []) => ({ name, dir: `packages/${name}`, private: false, scripts: {}, dependsOn });

test('orders internal dependencies first and ignores external ones', () => {
  const order = sortByDependencies([pkg('d', ['b', 'react']), pkg('a'), pkg('b', ['c']), pkg('c', ['c'])]).map(p => p.name);
  assert.deepEqual(order, ['a', 'c', 'b', 'd']);
});

test('reports a dependency cycle', () => {
  assert.throws(() => sortByDependencies([pkg('a', ['b']), pkg('b', ['a'])]), /Dependency cycle: a -> b -> a/);
});

test('discovers the repository packages in build order', () => {
  const names = sortByDependencies(listPackages()).map(p => p.name);
  const before = (a, b) => assert.ok(names.indexOf(a) < names.indexOf(b), `${a} must come before ${b}`);
  before('@shopana/carrier-core', '@shopana/carrier-testing');
  before('@shopana/carrier-contracts', '@shopana/carrier-testing');
  before('@shopana/carrier-testing', '@shopana/demo-post-api-client');
  before('@shopana/carrier-core', '@shopana/novaposhta-api-client');
  before('@shopana/novaposhta-api-client', '@shopana/novaposhta-mcp-server');
  assert.equal(listPackages().find(p => p.name === '@shopana/demo-post-api-client').private, true);
});
