// code and comments in English
import type { UkrposhtaStatusEvent } from './tracking';

/** eCom lifecycle statuses (shipment `lifecycle.status`). */
export type UkrposhtaLifecycleStatus =
  | 'CREATED'
  | 'REGISTERED'
  | 'DELIVERING'
  | 'IN_DEPARTMENT'
  | 'FORWARDING'
  | 'RETURNING'
  | 'RETURNED'
  | 'STORAGE'
  | 'DELIVERED'
  | 'CANCELED'
  | 'DELETED';

/** Annex B of the status-tracking documentation: main event code → eCom lifecycle status. */
export const UKRPOSHTA_EVENT_LIFECYCLE: Readonly<Record<string, UkrposhtaLifecycleStatus>> = {
  '10100': 'REGISTERED',
  '20700': 'DELIVERING',
  '20800': 'DELIVERING',
  '20900': 'DELIVERING',
  '21500': 'DELIVERING',
  '21700': 'IN_DEPARTMENT',
  '31100': 'DELIVERING',
  '41000': 'DELIVERED',
  '48000': 'DELIVERED',
  '41010': 'RETURNED',
  '31200': 'RETURNING',
  '31300': 'FORWARDING',
  '31400': 'FORWARDING',
  '10600': 'CANCELED',
  '10602': 'CANCELED',
  '21400': 'STORAGE',
};

/** Documented names of the main events. */
export const UKRPOSHTA_EVENT_NAMES: Readonly<Record<string, string>> = {
  '10100': 'Shipment accepted at the branch',
  '20700': 'Income to sorting center',
  '20800': 'Shipment departure',
  '20900': 'Departure to delivery office',
  '21500': 'Departure to delivery office',
  '21700': 'Arrival to delivery office',
  '31100': 'Attempted/Unsuccessful delivery',
  '41000': 'Final delivery',
  '48000': "International shipment delivered in the recipient's country",
  '41010': 'Shipment is not handed over',
  '31200': 'Returning of shipment',
  '31300': 'Shipment is forwarded to other post office',
  '31400': 'Transferred for forwarding',
  '10600': 'Reception canceled (at the request of the sender)',
  '10602': 'Reception canceled',
  '10603': 'Deleted by the client',
  '21400': 'Transferred for storage',
};

/** `eventReason_id` that turns the final delivery event (41000) into a return to the sender (41010). */
export const UKRPOSHTA_RETURNED_TO_SENDER_REASON_ID = 10;

/**
 * Effective event code. A return is reported as `41000` with `eventReason_id: 10`,
 * which the documentation defines as the code `41010`.
 */
export function effectiveEventCode(event: Pick<UkrposhtaStatusEvent, 'event' | 'eventReason_id'>): string {
  const code = String(event.event);
  return code === '41000' && event.eventReason_id === UKRPOSHTA_RETURNED_TO_SENDER_REASON_ID ? '41010' : code;
}

export function lifecycleStatusOf(
  event: Pick<UkrposhtaStatusEvent, 'event' | 'eventReason_id'>,
): UkrposhtaLifecycleStatus | undefined {
  return UKRPOSHTA_EVENT_LIFECYCLE[effectiveEventCode(event)];
}
