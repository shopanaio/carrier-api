// code and comments in English

/**
 * Status graph of a shipment (or courier order, register, ...). Carrier simulators use it to
 * reject illegal operations ("delete only while CREATED") and to walk an entity to a target
 * status, emitting one tracking event per step.
 */
export class Lifecycle<S extends string> {
  constructor(private readonly transitions: Readonly<Record<S, readonly S[]>>) {}

  canTransition(from: S, to: S): boolean {
    return this.transitions[from]?.includes(to) ?? false;
  }

  assertTransition(from: S, to: S): void {
    if (!this.canTransition(from, to)) throw new Error(`Illegal transition ${from} → ${to}`);
  }

  isFinal(status: S): boolean {
    return (this.transitions[status]?.length ?? 0) === 0;
  }

  /** Shortest path from `from` to `to`, excluding `from`. Throws when `to` is unreachable. */
  path(from: S, to: S): S[] {
    if (from === to) return [];
    const previous = new Map<S, S>();
    const queue: S[] = [from];
    const seen = new Set<S>([from]);
    while (queue.length) {
      const current = queue.shift()!;
      for (const next of this.transitions[current] ?? []) {
        if (seen.has(next)) continue;
        seen.add(next);
        previous.set(next, current);
        if (next === to) {
          const route: S[] = [to];
          let step = current;
          while (step !== from) {
            route.unshift(step);
            step = previous.get(step)!;
          }
          return route;
        }
        queue.push(next);
      }
    }
    throw new Error(`Status ${to} is not reachable from ${from}`);
  }
}
