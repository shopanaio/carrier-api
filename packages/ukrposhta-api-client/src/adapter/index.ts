// code and comments in English
import { defineAdapter, latestStatus } from '@shopana/carrier-contracts';
import type {
  CallOptions,
  Capability,
  CarrierAdapter,
  TrackingEvent,
  TrackingResult,
} from '@shopana/carrier-contracts';
import { effectiveEventCode } from '../public/types/trackingEvents';
import { TRACKING_MAX_BARCODES_ALL_STATUSES } from '../public/services/trackingService';
import type { UkrposhtaStatusEvent } from '../public/types/tracking';
import type { UkrposhtaAdapterClients, UkrposhtaTrackingClient } from './clients';
import { createLocationsApi } from './locations';
import { createShipmentsApi } from './shipments';
import { ukrposhtaStatusMap } from './statusMap';
import { kyivLocalToIso } from './time';

export { ukrposhtaStatusMap } from './statusMap';
export { kyivLocalToIso } from './time';
export type {
  UkrposhtaAdapterClients,
  UkrposhtaClassifierClient,
  UkrposhtaEcomClient,
  UkrposhtaTrackingClient,
} from './clients';

/** Capabilities of the adapter built from `T`: one group per client that is present. */
export type UkrposhtaCapabilities<T extends UkrposhtaAdapterClients> =
  | (T['tracking'] extends object ? 'tracking' : never)
  | (T['ecom'] extends object ? 'shipments' | 'rates' | 'labels' | 'cancel' | 'manifest' : never)
  | (T['classifier'] extends object ? 'locations' | 'addressValidation' : never);

/**
 * carrier-contracts adapter. Pass the clients you have; a capability is declared only when the client behind it is
 * present, so `adapter.createShipment` exists in the type only when `ecom` was given.
 */
export function createUkrposhtaAdapter<const T extends UkrposhtaAdapterClients>(
  clients: T,
): CarrierAdapter<UkrposhtaCapabilities<T>> {
  const capabilities: Capability[] = [];
  const methods: Record<string, unknown> = {};

  if (clients.tracking) {
    capabilities.push('tracking');
    methods.track = createTrack(clients.tracking);
    methods.trackingPolicy = { pollingAllowed: true, maxPerCall: TRACKING_MAX_BARCODES_ALL_STATUSES };
  }
  if (clients.ecom) {
    capabilities.push('shipments', 'rates', 'labels', 'cancel', 'manifest');
    Object.assign(methods, createShipmentsApi(clients.ecom));
  }
  if (clients.classifier) {
    capabilities.push('locations', 'addressValidation');
    Object.assign(methods, createLocationsApi(clients.classifier));
  }
  return defineAdapter({ carrier: 'ukrposhta', capabilities, ...methods } as never);
}

function createTrack(client: UkrposhtaTrackingClient) {
  return async (trackingNumbers: string[], options?: CallOptions): Promise<TrackingResult[]> => {
    const unique = [...new Set(trackingNumbers)];
    const found = new Map<string, UkrposhtaStatusEvent[]>();
    for (let i = 0; i < unique.length; i += TRACKING_MAX_BARCODES_ALL_STATUSES) {
      const chunk = unique.slice(i, i + TRACKING_MAX_BARCODES_ALL_STATUSES);
      const answer = await client.tracking.getStatusesBatchWithNotFound(chunk, { signal: options?.signal });
      for (const [barcode, events] of Object.entries(answer.found ?? {})) found.set(barcode, events);
    }
    return trackingNumbers.map(trackingNumber => toTrackingResult(trackingNumber, found.get(trackingNumber)));
  };
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
