// code and comments in English
import type {
  AvailableTimeSlotsResponse,
  RegisterBranchDeleteResponse,
  RegisterBranchPutRequestBody,
  RegisterBranchPutResponse,
  RegisterBranchRequestBody,
  RegisterBranchResponse,
  RegisterPickupDeleteResponse,
  RegisterPickupPutRequestBody,
  RegisterPickupPutResponse,
  RegisterPickupRequestBody,
  RegisterPickupResponse,
  RegistersListResponse,
} from '../types/generated';
import { ContractService } from './base';
import type { DeleteRequestOptions, RequestOptions } from './base';

/**
 * Registers group parcels for hand-over: `Branch` registers are brought to a Meest branch,
 * `Pickup` registers are collected by a courier at the sender's address.
 */
export class RegistersService extends ContractService {
  readonly namespace = 'registers' as const;

  /** `POST /registerBranch`. Parcels that could not be added come back in `Not_added_to_registry`. */
  createBranch(body: RegisterBranchRequestBody, options?: RequestOptions): Promise<RegisterBranchResponse> {
    return this.httpPost({ signal: options?.signal, path: '/registerBranch', json: body });
  }

  updateBranch(
    registerId: string,
    body: RegisterBranchPutRequestBody,
    options?: RequestOptions,
  ): Promise<RegisterBranchPutResponse> {
    return this.httpPut({
      signal: options?.signal,
      path: '/registerBranch/{registerID}',
      pathParams: { registerID: registerId },
      json: body,
    });
  }

  /** Removes the register; its parcels become available for other registers. */
  deleteBranch(registerId: string, options?: DeleteRequestOptions): Promise<RegisterBranchDeleteResponse> {
    return this.httpDelete({
      signal: options?.signal,
      json: options?.body,
      path: '/registerBranch/{registerID}',
      pathParams: { registerID: registerId },
    });
  }

  /** `POST /registerPickup`. Needs `payType`, `expectedPickUpDate`, `sender` and `parcelsItems`. */
  createPickup(body: RegisterPickupRequestBody, options?: RequestOptions): Promise<RegisterPickupResponse> {
    return this.httpPost({ signal: options?.signal, path: '/registerPickup', json: body });
  }

  updatePickup(
    registerId: string,
    body: RegisterPickupPutRequestBody,
    options?: RequestOptions,
  ): Promise<RegisterPickupPutResponse> {
    return this.httpPut({
      signal: options?.signal,
      path: '/registerPickup/{registerID}',
      pathParams: { registerID: registerId },
      json: body,
    });
  }

  deletePickup(registerId: string, options?: DeleteRequestOptions): Promise<RegisterPickupDeleteResponse> {
    return this.httpDelete({
      signal: options?.signal,
      json: options?.body,
      path: '/registerPickup/{registerID}',
      pathParams: { registerID: registerId },
    });
  }

  /** Registers created since `dateFrom` (`dd.MM.yyyy`). */
  list(dateFrom: string, options?: RequestOptions): Promise<RegistersListResponse> {
    return this.httpGet({
      signal: options?.signal,
      path: '/registersList/{dateFrom}',
      pathParams: { dateFrom },
    });
  }

  /**
   * Courier slots and dates. `type` is `PickUp` (collection from the sender) or `Delivery`; give the street
   * (`streetId`, from `search.addresses`) or the locality (`cityId`, from `search.cities`).
   */
  availableTimeSlots(query: TimeSlotsQuery, options?: RequestOptions): Promise<AvailableTimeSlotsResponse> {
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
