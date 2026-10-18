// code and comments in English
import { formatDate } from '../dates';
import type { DateInput } from '../dates';
import type {
  ChangingParcelBySenderRequestBody,
  ChangingParcelBySenderResult,
  GetParcelResult,
  LockParcelRequestBody,
  ParcelChangeContractIDRequestBody,
  ParcelChangeContractIDResult,
  ParcelPutRequestBody,
  ParcelPutResult,
  ParcelRequestBody,
  ParcelResult,
  ParcelStatusDetailsResult,
  ParcelStatusResult,
  ParcelsListResult,
  UnlockParcelRequestBody,
} from '../types/generated';
import { ContractService } from './base';
import type { RequestOptions } from './base';

export type ParcelSearchBy = 'parcelID' | 'barCode' | 'parcelNumber';
export type ParcelReturnMode = 'objectData' | 'printCN23' | 'printCP71';

export class ParcelsService extends ContractService {
  readonly namespace = 'parcels' as const;

  /**
   * `POST /parcel`. Never repeated automatically after a 5xx or a lost connection: a second call could create
   * a second parcel. Check `parcels.get(parcelNumber, 'parcelNumber')` before retrying yourself.
   */
  create(body: ParcelRequestBody, options?: RequestOptions): Promise<ParcelResult> {
    return this.httpPost({ signal: options?.signal, path: '/parcel', json: body });
  }

  /** `PUT /parcel/{parcelID}`; allowed until the parcel is received by Meest. */
  update(parcelId: string, body: ParcelPutRequestBody, options?: RequestOptions): Promise<ParcelPutResult> {
    return this.httpPut({
      signal: options?.signal,
      path: '/parcel/{parcelID}',
      pathParams: { parcelID: parcelId },
      json: body,
    });
  }

  /** `DELETE /parcel/{parcelID}/{contractID}`; only until the parcel is received, and only by its owner. */
  delete(parcelId: string, contractId: string, options?: RequestOptions): Promise<unknown> {
    return this.httpDelete({
      signal: options?.signal,
      path: '/parcel/{parcelID}/{contractID}',
      pathParams: { parcelID: parcelId, contractID: contractId },
    });
  }

  /** `GET /getParcel/{value}/{searchBy}/{returnMode}`. */
  get(
    value: string,
    searchBy: ParcelSearchBy = 'parcelID',
    returnMode: ParcelReturnMode = 'objectData',
    options?: RequestOptions,
  ): Promise<GetParcelResult> {
    return this.httpGet({
      signal: options?.signal,
      path: '/getParcel/{parcelID}/{searchMode}/{returnMode}',
      pathParams: { parcelID: value, searchMode: searchBy, returnMode },
    });
  }

  /** Parcels created since `dateFrom`. */
  list(dateFrom: DateInput, options?: RequestOptions): Promise<ParcelsListResult> {
    return this.httpGet({
      signal: options?.signal,
      path: '/parcelsList/{dateFrom}',
      pathParams: { dateFrom: formatDate(dateFrom) },
    });
  }

  status(parcelId: string, options?: RequestOptions): Promise<ParcelStatusResult> {
    return this.httpGet({
      signal: options?.signal,
      path: '/parcelStatus/{parcelID}',
      pathParams: { parcelID: parcelId },
    });
  }

  statusDetails(parcelId: string, options?: RequestOptions): Promise<ParcelStatusDetailsResult> {
    return this.httpGet({
      signal: options?.signal,
      path: '/parcelStatusDetails/{parcelID}',
      pathParams: { parcelID: parcelId },
    });
  }

  /** `PUT /parcelChangeContractID?barCode=`. */
  changeContract(
    barCode: string,
    body: ParcelChangeContractIDRequestBody,
    options?: RequestOptions,
  ): Promise<ParcelChangeContractIDResult> {
    return this.httpPut({ signal: options?.signal, path: '/parcelChangeContractID', query: { barCode }, json: body });
  }

  /** Blocks delivery while the parcel is entering Ukraine or in customs. Send `ParcelUID` or `ClientsShipmentRef`. */
  lock(body: LockParcelRequestBody, options?: RequestOptions): Promise<unknown> {
    return this.httpPost({ signal: options?.signal, path: '/LockParcel', json: body });
  }

  unlock(body: UnlockParcelRequestBody, options?: RequestOptions): Promise<unknown> {
    return this.httpPost({ signal: options?.signal, path: '/UnlockParcel', json: body });
  }

  /** `POST /changingParcelBySender`: the sender changes the recipient, phones or cash on delivery of a parcel. */
  changeBySender(
    body: ChangingParcelBySenderRequestBody,
    options?: RequestOptions,
  ): Promise<ChangingParcelBySenderResult> {
    return this.httpPost({ signal: options?.signal, path: '/changingParcelBySender', json: body });
  }
}
