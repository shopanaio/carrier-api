// code and comments in English
import { createStatusMapper } from '@shopana/carrier-contracts';

/**
 * Ukrposhta event code (Annex B of the status-tracking documentation) → normalized status.
 * Pass the effective code (`effectiveEventCode`): a return is `41000` with `eventReason_id: 10`, i.e. `41010`.
 * Unknown codes map to `unknown`; the raw code is always kept on the event.
 */
export const ukrposhtaStatusMap = createStatusMapper({
  // Domestic flow
  '10100': 'in_transit', // accepted at the branch
  '20700': 'in_transit', // income to sorting center
  '20800': 'in_transit', // departure from sorting center
  '20900': 'in_transit',
  '21500': 'in_transit', // departure to delivery office
  '21700': 'available_for_pickup', // arrival at the delivery office
  '31100': 'exception', // attempted/unsuccessful delivery
  '41000': 'delivered',
  '48000': 'delivered',
  '41010': 'returned', // 41000 + eventReason_id 10: handed back to the sender
  '31200': 'exception', // returning to the sender, still on its way
  '31300': 'in_transit', // forwarded to another post office
  '31400': 'in_transit',
  '21400': 'exception', // transferred for storage: the recipient did not collect it
  '10600': 'cancelled',
  '10602': 'cancelled',
  '10603': 'cancelled',
  // International flow (UPU codes)
  '17100': 'in_transit',
  '21600': 'in_transit',
  '27200': 'in_transit',
  '27900': 'in_transit',
  '29200': 'in_transit',
  '29300': 'in_transit',
  '29500': 'out_for_delivery',
  '29700': 'available_for_pickup',
  '35100': 'exception',
  '35200': 'exception',
  '35300': 'exception',
  '35400': 'exception',
  '35500': 'returned',
  '35600': 'in_transit',
  '36000': 'available_for_pickup',
  '60700': 'in_transit',
  '67300': 'in_transit',
  '70800': 'in_transit',
  '71200': 'in_transit',
  '77600': 'in_transit',
  '80700': 'in_transit',
  '80800': 'in_transit',
  '80821': 'in_transit',
  '82700': 'in_transit',
  '82800': 'in_transit',
  '87500': 'in_transit',
  '89000': 'in_transit',
  '90700': 'in_transit',
  '90800': 'in_transit',
  '97700': 'in_transit',
  '100700': 'in_transit',
  '100800': 'in_transit',
  '107400': 'in_transit',
  '107800': 'in_transit',
});
