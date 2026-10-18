// code and comments in English
import { formatDate } from '../dates';
import type { DateInput } from '../dates';
import type {
  AvailableTimeSlotsResult,
  RegisterBranchPutRequestBody,
  RegisterBranchPutResult,
  RegisterBranchRequestBody,
  RegisterBranchResult,
  RegisterPickupPutRequestBody,
  RegisterPickupPutResult,
  RegisterPickupRequestBody,
  RegisterPickupResult,
  RegistersListResult,
} from '../types/generated';
import { ContractService } from './base';

/**
 * Registers group parcels for hand-over: `Branch` registers are brought to a Meest branch,
 * `Pickup` registers are collected by a courier at the sender's address.
 */
export class RegistersService extends ContractService {
  readonly namespace = 'registers' as const;

  /** `POST /registerBranch`. Parcels that could not be added come back in `Not_added_to_registry`. */
  createBranch(body: RegisterBranchRequestBody): Promise<RegisterBranchResult> {
    return this.httpPost({ path: '/registerBranch', json: body });
  }

  updateBranch(registerId: string, body: RegisterBranchPutRequestBody): Promise<RegisterBranchPutResult> {
    return this.httpPut({ path: '/registerBranch/{registerID}', pathParams: { registerID: registerId }, json: body });
  }

  /** Removes the register; its parcels become available for other registers. */
  deleteBranch(registerId: string): Promise<unknown> {
    return this.httpDelete({ path: '/registerBranch/{registerID}', pathParams: { registerID: registerId } });
  }

  /** `POST /registerPickup`. Needs `payType`, `expectedPickUpDate`, `sender` and `parcelsItems`. */
  createPickup(body: RegisterPickupRequestBody): Promise<RegisterPickupResult> {
    return this.httpPost({ path: '/registerPickup', json: body });
  }

  updatePickup(registerId: string, body: RegisterPickupPutRequestBody): Promise<RegisterPickupPutResult> {
    return this.httpPut({ path: '/registerPickup/{registerID}', pathParams: { registerID: registerId }, json: body });
  }

  deletePickup(registerId: string): Promise<unknown> {
    return this.httpDelete({ path: '/registerPickup/{registerID}', pathParams: { registerID: registerId } });
  }

  /** Registers created since `dateFrom` (`dd.MM.yyyy`). */
  list(dateFrom: DateInput): Promise<RegistersListResult> {
    return this.httpGet({ path: '/registersList/{dateFrom}', pathParams: { dateFrom: formatDate(dateFrom) } });
  }

  /** Courier pickup slots and dates for a street (`type` is `pickup` for collection). */
  availableTimeSlots(streetId: string, type = 'pickup'): Promise<AvailableTimeSlotsResult> {
    return this.httpGet({ path: '/availableTimeSlots', query: { streetID: streetId, type } });
  }
}
