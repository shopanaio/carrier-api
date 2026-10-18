// code and comments in English
import { defineAdapter, latestStatus } from '@shopana/carrier-contracts';
import type { TrackingEvent } from '@shopana/carrier-contracts';
import { CarrierError, CarrierErrorCategory } from '@shopana/carrier-core';
import type { Client } from '@shopana/carrier-core';
import type { DemoPostContractContext, TrackingService } from '../contract';
import { demoPostStatusMap } from './statusMap';

export { demoPostStatusMap } from './statusMap';

export type DemoPostAdapterClient = Client<{ tracking: TrackingService }, DemoPostContractContext>;

/** carrier-contracts adapter. Declare a capability only once its methods are implemented. */
export function createDemoPostAdapter(client: DemoPostAdapterClient) {
  return defineAdapter({
    carrier: 'demo-post',
    capabilities: ['tracking'],
    trackingPolicy: { pollingAllowed: true },
    async track(trackingNumbers, options) {
      return Promise.all(
        trackingNumbers.map(async trackingNumber => {
          try {
            const raw = await client.tracking.getEvents(trackingNumber, options);
            const events: TrackingEvent[] = raw
              .map(e => ({
                status: demoPostStatusMap(e.code),
                rawCode: e.code,
                rawDescription: e.description,
                occurredAt: e.date,
              }))
              .sort((a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt));
            return { trackingNumber, carrier: 'demo-post', status: latestStatus(events), events, found: true };
          } catch (error) {
            if (error instanceof CarrierError && error.category === CarrierErrorCategory.NotFound) {
              return { trackingNumber, carrier: 'demo-post', status: 'unknown' as const, events: [], found: false };
            }
            throw error;
          }
        }),
      );
    },
  });
}
