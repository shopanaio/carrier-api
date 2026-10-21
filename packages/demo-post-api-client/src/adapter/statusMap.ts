// code and comments in English
import { createStatusMapper } from '@shopana/carrier-contracts';

/** Demo Post status code → normalized status. Unknown codes map to `unknown`; keep the raw code. */
export const demoPostStatusMap = createStatusMapper({
  CREATED: 'pre_transit',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
});
