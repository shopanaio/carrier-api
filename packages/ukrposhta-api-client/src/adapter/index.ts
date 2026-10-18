// code and comments in English
import { defineAdapter, latestStatus } from '@shopana/carrier-contracts';
import type { TrackingEvent, TrackingResult } from '@shopana/carrier-contracts';
import type { Client } from '@shopana/carrier-core';
import { effectiveEventCode } from '../public/types/trackingEvents';
import { TRACKING_MAX_BARCODES_ALL_STATUSES } from '../public/services/trackingService';
import type { TrackingService, UkrposhtaTrackingContext } from '../public/services/trackingService';
import type { UkrposhtaStatusEvent } from '../public/types/tracking';
import { ukrposhtaStatusMap } from './statusMap';
import { kyivLocalToIso } from './time';

export { ukrposhtaStatusMap } from './statusMap';
export { kyivLocalToIso } from './time';

export type UkrposhtaTrackingClient = Client<{ tracking: TrackingService }, UkrposhtaTrackingContext>;

export interface UkrposhtaAdapterClients {
  /** Status-tracking client (`createUkrposhtaTrackingClient`). */
  tracking: UkrposhtaTrackingClient;
}

/** carrier-contracts adapter. A capability is declared only once its methods are implemented. */
export function createUkrposhtaAdapter(clients: UkrposhtaAdapterClients) {
  return defineAdapter({
    carrier: 'ukrposhta',
    capabilities: ['tracking'],
    // The service answers batches of up to 50 barcodes; polling is allowed.
    trackingPolicy: { pollingAllowed: true, maxPerCall: TRACKING_MAX_BARCODES_ALL_STATUSES },
    async track(trackingNumbers: string[], options?: { signal?: AbortSignal }): Promise<TrackingResult[]> {
      const unique = [...new Set(trackingNumbers)];
      const found = new Map<string, UkrposhtaStatusEvent[]>();
      for (let i = 0; i < unique.length; i += TRACKING_MAX_BARCODES_ALL_STATUSES) {
        const chunk = unique.slice(i, i + TRACKING_MAX_BARCODES_ALL_STATUSES);
        const answer = await clients.tracking.tracking.getStatusesBatchWithNotFound(chunk, {
          signal: options?.signal,
        });
        for (const [barcode, events] of Object.entries(answer.found ?? {})) found.set(barcode, events);
      }
      return trackingNumbers.map(trackingNumber => toTrackingResult(trackingNumber, found.get(trackingNumber)));
    },
  });
}

function toTrackingResult(trackingNumber: string, raw: UkrposhtaStatusEvent[] | undefined): TrackingResult {
  if (!raw || raw.length === 0) {
    return { trackingNumber, carrier: 'ukrposhta', status: 'unknown', events: [], found: false };
  }
  const events: TrackingEvent[] = raw
    .map(event => toTrackingEvent(event))
    .sort((a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt));
  return { trackingNumber, carrier: 'ukrposhta', status: latestStatus(events), events, found: true };
}

function toTrackingEvent(event: UkrposhtaStatusEvent): TrackingEvent {
  const code = effectiveEventCode(event);
  return {
    status: ukrposhtaStatusMap(code),
    rawCode: code,
    ...(event.eventName ? { rawDescription: event.eventName } : {}),
    occurredAt: kyivLocalToIso(event.date),
    location: {
      ...(event.name ? { name: event.name } : {}),
      ...(event.index ? { postalCode: event.index } : {}),
      ...(event.country ? { country: event.country } : {}),
    },
  };
}
