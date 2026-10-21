# @shopana/carrier-contracts

Unified shipping domain model and capability interfaces for Shopana carrier adapters. Types plus a few dependency-free helpers.

- **Model:** `Address`, `Contact`, `Party` (door or carrier location), `Parcel`, `Money` (decimal string + ISO currency), `Shipment`, `Rate`, `Label` (`binary` | `base64` | `url`), `TrackingEvent`, `TrackingResult`, `Location`, `Pickup`, `Manifest`.
- **Units:** canonical kg/cm with `toKg`, `toCm`, `fromKg`, `fromCm`, `volumetricWeightKg`.
- **Tracking statuses:** `pre_transit | in_transit | out_for_delivery | available_for_pickup | delivered | exception | returned | cancelled | unknown`, always next to the raw carrier code. `createStatusMapper(table)` maps codes (exact or `prefix*`), unknown codes fall back to `unknown`.
- **Capabilities:** `rates`, `shipments`, `labels`, `tracking`, `cancel`, `pickup`, `locations`, `returns`, `manifest`, `addressValidation`, `transitTimes`, `webhooks`. `CarrierAdapter<'shipments' | 'tracking'>` has exactly those methods; `defineAdapter` checks declared capabilities at construction; `hasCapability` narrows an unknown adapter.
- **Tracking policy:** `{ pollingAllowed, minIntervalSec, maxPerCall }`; scheduling stays with the consumer.

```ts
import { createStatusMapper, defineAdapter } from '@shopana/carrier-contracts';

const statusMap = createStatusMapper({ '10100': 'pre_transit', '2*': 'in_transit', '21700': 'available_for_pickup', '41000': 'delivered' });

export const adapter = defineAdapter({
  carrier: 'ukrposhta',
  capabilities: ['tracking'],
  trackingPolicy: { pollingAllowed: true },
  async track(numbers) {
    /* call the raw client, map with statusMap */
    return [];
  },
});
```
