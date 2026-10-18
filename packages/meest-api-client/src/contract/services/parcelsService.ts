// code and comments in English
import type {
  ChangingParcelBySenderRequestBody,
  ChangingParcelBySenderResponse,
  GetParcelResponse,
  LockParcelRequestBody,
  LockParcelResponse,
  ParcelChangeContractIDRequestBody,
  ParcelChangeContractIDResponse,
  ParcelDeleteResponse,
  ParcelPutRequestBody,
  ParcelPutResponse,
  ParcelRequestBody,
  ParcelResponse,
  ParcelStatusDetailsResponse,
  ParcelStatusResponse,
  ParcelsListResponse,
  UnlockParcelRequestBody,
  UnlockParcelResponse,
} from '../types/generated';
import { ContractService } from './base';
import type { DeleteRequestOptions, RequestOptions } from './base';

export type ParcelSearchBy = 'parcelID' | 'barCode' | 'parcelNumber';
export type ParcelReturnMode = 'objectData' | 'printCN23' | 'printCP71';

export class ParcelsService extends ContractService {
  readonly namespace = 'parcels' as const;

  /**
   * `POST /parcel`. Never repeated automatically after a 5xx or a lost connection: a second call could create
   * a second parcel. Check `parcels.get(parcelNumber, 'parcelNumber')` before retrying yourself.
   */
  create(body: ParcelRequestBody, options?: RequestOptions): Promise<ParcelResponse> {
    return this.httpPost({ signal: options?.signal, path: '/parcel', json: body });
  }

  /** `PUT /parcel/{parcelID}`; allowed until the parcel is received by Meest. */
  update(parcelId: string, body: ParcelPutRequestBody, options?: RequestOptions): Promise<ParcelPutResponse> {
    return this.httpPut({
      signal: options?.signal,
      path: '/parcel/{parcelID}',
      pathParams: { parcelID: parcelId },
      json: body,
    });
  }

  /** `DELETE /parcel/{parcelID}/{contractID}`; only until the parcel is received, and only by its owner. */
  delete(parcelId: string, contractId: string, options?: DeleteRequestOptions): Promise<ParcelDeleteResponse> {
    return this.httpDelete({
      signal: options?.signal,
      json: options?.body,
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
  ): Promise<GetParcelResponse> {
    return this.httpGet({
      signal: options?.signal,
      path: '/getParcel/{parcelID}/{searchMode}/{returnMode}',
      pathParams: { parcelID: value, searchMode: searchBy, returnMode },
    });
  }

  /** Parcels created since `dateFrom`. */
  list(dateFrom: string, options?: RequestOptions): Promise<ParcelsListResponse> {
    return this.httpGet({
      signal: options?.signal,
      path: '/parcelsList/{dateFrom}',
      pathParams: { dateFrom },
    });
  }

  status(parcelId: string, options?: RequestOptions): Promise<ParcelStatusResponse> {
    return this.httpGet({
      signal: options?.signal,
      path: '/parcelStatus/{parcelID}',
      pathParams: { parcelID: parcelId },
    });
  }

  statusDetails(parcelId: string, options?: RequestOptions): Promise<ParcelStatusDetailsResponse> {
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
  ): Promise<ParcelChangeContractIDResponse> {
    return this.httpPut({ signal: options?.signal, path: '/parcelChangeContractID', query: { barCode }, json: body });
  }

  /** Blocks delivery while the parcel is entering Ukraine or in customs. Send `ParcelUID` or `ClientsShipmentRef`. */
  lock(body: LockParcelRequestBody, options?: RequestOptions): Promise<LockParcelResponse> {
    return this.httpPost({ signal: options?.signal, path: '/LockParcel', json: body });
  }

  unlock(body: UnlockParcelRequestBody, options?: RequestOptions): Promise<UnlockParcelResponse> {
    return this.httpPost({ signal: options?.signal, path: '/UnlockParcel', json: body });
  }

  /** `POST /changingParcelBySender`: the sender changes the recipient, phones or cash on delivery of a parcel. */
  changeBySender(
    body: ChangingParcelBySenderRequestBody,
    options?: RequestOptions,
  ): Promise<ChangingParcelBySenderResponse> {
    return this.httpPost({ signal: options?.signal, path: '/changingParcelBySender', json: body });
  }
}
