// code and comments in English
import type { TrackingStatus } from './model';

export interface StatusMapper {
  (rawCode: string | number): TrackingStatus;
  /** The table the mapper was built from, for docs and conformance checks. */
  readonly table: Readonly<Record<string, TrackingStatus>>;
}

/**
 * Maps carrier status codes to normalized statuses. Unknown codes map to `fallback`
 * (default `unknown`) so new carrier codes never throw in production.
 * Keys ending in `*` match by prefix (`'417*': 'delivered'`); the longest prefix wins.
 */
export function createStatusMapper(
  table: Record<string, TrackingStatus>,
  fallback: TrackingStatus = 'unknown',
): StatusMapper {
  const exact = new Map<string, TrackingStatus>();
  const prefixes: Array<[string, TrackingStatus]> = [];
  for (const [key, status] of Object.entries(table)) {
    if (key.endsWith('*')) prefixes.push([key.slice(0, -1), status]);
    else exact.set(key, status);
  }
  prefixes.sort((a, b) => b[0].length - a[0].length);

  const mapper = ((rawCode: string | number) => {
    const code = String(rawCode).trim();
    const hit = exact.get(code);
    if (hit) return hit;
    for (const [prefix, status] of prefixes) if (code.startsWith(prefix)) return status;
    return fallback;
  }) as StatusMapper;
  Object.defineProperty(mapper, 'table', { value: Object.freeze({ ...table }) });
  return mapper;
}

/**
 * Overall status of a shipment from its events: the latest event wins (the later one on a tie).
 * An event whose date does not parse never beats one with a real date.
 */
export function latestStatus(events: ReadonlyArray<{ status: TrackingStatus; occurredAt: string }>): TrackingStatus {
  let latest: { status: TrackingStatus; occurredAt: string } | undefined;
  let latestTime = -Infinity;
  for (const event of events) {
    const parsed = Date.parse(event.occurredAt);
    const time = Number.isNaN(parsed) ? -Infinity : parsed;
    if (!latest || time >= latestTime) {
      latest = event;
      latestTime = time;
    }
  }
  return latest?.status ?? 'unknown';
}
