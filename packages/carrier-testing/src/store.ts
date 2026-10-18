// code and comments in English
import { httpError } from './responses';

/** In-memory table of entities keyed by id. */
export class SimCollection<T> {
  private readonly rows = new Map<string, T>();

  constructor(readonly name: string) {}

  insert(id: string, value: T): T {
    if (this.rows.has(id)) throw new Error(`${this.name}: duplicate id ${id}`);
    this.rows.set(id, value);
    return value;
  }

  upsert(id: string, value: T): T {
    this.rows.set(id, value);
    return value;
  }

  get(id: string): T | undefined {
    return this.rows.get(id);
  }

  has(id: string): boolean {
    return this.rows.has(id);
  }

  /** Returns the entity or throws a simulated 404 (override the body per carrier with `notFound`). */
  require(id: string, notFound?: () => Error): T {
    const row = this.rows.get(id);
    if (row === undefined) throw notFound ? notFound() : httpError(404, { message: `${this.name} ${id} not found` });
    return row;
  }

  update(id: string, patch: Partial<T> | ((current: T) => T)): T {
    const current = this.require(id);
    const next = typeof patch === 'function' ? patch(current) : { ...current, ...patch };
    this.rows.set(id, next);
    return next;
  }

  delete(id: string): boolean {
    return this.rows.delete(id);
  }

  list(): T[] {
    return [...this.rows.values()];
  }

  find(predicate: (row: T) => boolean): T | undefined {
    for (const row of this.rows.values()) if (predicate(row)) return row;
    return undefined;
  }

  filter(predicate: (row: T) => boolean): T[] {
    return this.list().filter(predicate);
  }

  get size(): number {
    return this.rows.size;
  }

  clear(): void {
    this.rows.clear();
  }
}

/** Deterministic id generators, so fixtures and snapshots are stable across runs. */
export class SimIds {
  private readonly counters = new Map<string, number>();

  /** UUID-shaped, deterministic: 00000000-0000-4000-8000-000000000001, ... */
  uuid(namespace = 'uuid'): string {
    const n = this.next(namespace);
    const hex = n.toString(16).padStart(12, '0');
    const ns = hash(namespace).toString(16).padStart(8, '0').slice(0, 8);
    return `${ns}-0000-4000-8000-${hex}`;
  }

  /** Numeric sequence with optional prefix and zero padding: sequence('barcode', { prefix: '05', pad: 11 }). */
  sequence(name: string, options: { prefix?: string; pad?: number; start?: number } = {}): string {
    const n = this.next(name, options.start);
    return `${options.prefix ?? ''}${String(n).padStart(options.pad ?? 0, '0')}`;
  }

  reset(): void {
    this.counters.clear();
  }

  private next(name: string, start = 1): number {
    const n = this.counters.get(name) ?? start - 1;
    this.counters.set(name, n + 1);
    return n + 1;
  }
}

/** All simulator state. Several simulators (one per API of a carrier) can share one store. */
export class SimStore {
  readonly ids = new SimIds();
  private readonly collections = new Map<string, SimCollection<unknown>>();

  collection<T>(name: string): SimCollection<T> {
    let collection = this.collections.get(name);
    if (!collection) {
      collection = new SimCollection<unknown>(name);
      this.collections.set(name, collection);
    }
    return collection as SimCollection<T>;
  }

  reset(): void {
    for (const collection of this.collections.values()) collection.clear();
    this.ids.reset();
  }
}

function hash(value: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}
