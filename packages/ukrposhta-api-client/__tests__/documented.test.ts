// Every operation of the current official documentation must be reachable through a public method of the client.
//
// `fixtures/documented-operations.json` lists them, normalized (`{}` for path parameters, query strings dropped). It was
// written from the eCom documentation of 02.09.2026, the letters documentation of 07.10.2026 and the international
// documentation of 16.10.2026 (tracking and the address classifier have their own tests). The test calls every public
// method of every service once and compares the requests that went out with that list, so it does not depend on the
// code generator.
import { createUkrposhtaContractClient } from '../src';
import documented from './fixtures/documented-operations.json';
import { createMockTransport, ok } from './helpers/mock';

type Service = Record<string, unknown>;

/** A value that is a string, an object and a number at once, so any argument shape works. */
function anything(): unknown {
  const target = () => undefined;
  return new Proxy(target, {
    get: (_t, key) => {
      if (key === Symbol.toPrimitive) return () => 'X';
      if (key === 'toString' || key === 'valueOf') return () => 'X';
      if (key === 'toJSON' || key === 'then') return undefined;
      return 'X';
    },
    ownKeys: () => [],
    getOwnPropertyDescriptor: () => undefined,
  });
}

function methodsOf(service: Service): string[] {
  const names = new Set<string>();
  for (let proto = service; proto && proto !== Object.prototype; proto = Object.getPrototypeOf(proto) as Service) {
    for (const name of Object.getOwnPropertyNames(proto)) {
      if (!['constructor', 'attach'].includes(name) && typeof service[name] === 'function') names.add(name);
    }
  }
  return [...names];
}

const normalize = (path: string) =>
  path
    .replace(/^\/forms\/ecom\/0\.0\.1|^\/ecom\/0\.0\.1/, '')
    .split('/')
    .map(segment => (segment === 'X' ? '{}' : segment))
    .join('/')
    // a list of barcodes joined with "&"
    .replace(/\/all-of\/.*$/, '/all-of/{}');

describe('documented operations', () => {
  it('are all reachable through a public method', async () => {
    const mock = createMockTransport([
      { method: 'GET', path: '*', respond: ok({}) },
      { method: 'POST', path: '*', respond: ok({}) },
      { method: 'PUT', path: '*', respond: ok({}) },
      { method: 'DELETE', path: '*', respond: ok({}) },
    ]);
    const client = createUkrposhtaContractClient({
      transport: mock.transport,
      bearer: 'b',
      counterpartyToken: 't',
      retry: false,
    }) as unknown as Record<string, Service>;

    const reached = new Set<string>();
    for (const service of Object.values(client)) {
      if (typeof service !== 'object' || service === null || !('namespace' in service)) continue;
      for (const name of methodsOf(service)) {
        const before = mock.calls.length;
        // Different shapes of dummy arguments, so that optional and list parameters take both of their forms.
        const attempts: unknown[][] = [
          [anything(), anything(), anything()],
          ['X', 'X', undefined],
          [['X'], 'X', undefined],
          ['X', undefined, undefined],
        ];
        for (const args of attempts) {
          try {
            await (service[name] as (...a: unknown[]) => Promise<unknown>)(...args);
          } catch {
            // a method may reject dummy arguments, before or after it sends its request
          }
        }
        for (const call of mock.calls.slice(before)) reached.add(`${call.method} ${normalize(call.path)}`);
      }
    }

    const missing = (documented as string[]).filter(operation => !reached.has(operation));
    expect(missing).toEqual([]);
  });
});
