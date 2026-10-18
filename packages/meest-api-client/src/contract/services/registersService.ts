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
import type { RequestOptions } from './base';

/**
 * Registers group parcels for hand-over: `Branch` registers are brought to a Meest branch,
 * `Pickup` registers are collected by a courier at the sender's address.
 */
export class RegistersService extends ContractService {
  readonly namespace = 'registers' as const;

  /** `POST /registerBranch`. Parcels that could not be added come back in `Not_added_to_registry`. */
  createBranch(body: RegisterBranchRequestBody, options?: RequestOptions): Promise<RegisterBranchResult> {
    return this.httpPost({ signal: options?.signal, path: '/registerBranch', json: body });
  }

  updateBranch(
    registerId: string,
    body: RegisterBranchPutRequestBody,
    options?: RequestOptions,
  ): Promise<RegisterBranchPutResult> {
    return this.httpPut({
      signal: options?.signal,
      path: '/registerBranch/{registerID}',
      pathParams: { registerID: registerId },
      json: body,
    });
  }

  /** Removes the register; its parcels become available for other registers. */
  deleteBranch(registerId: string, options?: RequestOptions): Promise<unknown> {
    return this.httpDelete({
      signal: options?.signal,
      path: '/registerBranch/{registerID}',
      pathParams: { registerID: registerId },
    });
  }

  /** `POST /registerPickup`. Needs `payType`, `expectedPickUpDate`, `sender` and `parcelsItems`. */
  createPickup(body: RegisterPickupRequestBody, options?: RequestOptions): Promise<RegisterPickupResult> {
    return this.httpPost({ signal: options?.signal, path: '/registerPickup', json: body });
  }

  updatePickup(
    registerId: string,
    body: RegisterPickupPutRequestBody,
    options?: RequestOptions,
  ): Promise<RegisterPickupPutResult> {
    return this.httpPut({
      signal: options?.signal,
      path: '/registerPickup/{registerID}',
      pathParams: { registerID: registerId },
      json: body,
    });
  }

  deletePickup(registerId: string, options?: RequestOptions): Promise<unknown> {
    return this.httpDelete({
      signal: options?.signal,
      path: '/registerPickup/{registerID}',
      pathParams: { registerID: registerId },
    });
  }

  /** Registers created since `dateFrom` (`dd.MM.yyyy`). */
  list(dateFrom: DateInput, options?: RequestOptions): Promise<RegistersListResult> {
    return this.httpGet({
      signal: options?.signal,
      path: '/registersList/{dateFrom}',
      pathParams: { dateFrom: formatDate(dateFrom) },
    });
  }

  /**
   * Courier slots and dates. `type` is `PickUp` (collection from the sender) or `Delivery`; give the street
   * (`streetId`, from `search.addresses`) or the locality (`cityId`, from `search.cities`).
   */
  availableTimeSlots(query: TimeSlotsQuery, options?: RequestOptions): Promise<AvailableTimeSlotsResult> {
    if (!query.streetId && !query.cityId) throw new TypeError('availableTimeSlots needs a streetId or a cityId');
    return this.httpGet({
      signal: options?.signal,
      path: '/availableTimeSlots',
      query: { streetID: query.streetId, cityID: query.cityId, type: query.type },
    });
  }
}

export type TimeSlotType = 'PickUp' | 'Delivery';

export interface TimeSlotsQuery {
  type: TimeSlotType;
  streetId?: string;
  cityId?: string;
}
