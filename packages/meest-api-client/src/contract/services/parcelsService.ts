// code and comments in English
import { formatDate } from '../dates';
import type { DateInput } from '../dates';
import type {
  GetParcelResult,
  LockParcelRequestBody,
  ParcelChangeContractIDRequestBody,
  ParcelChangeContractIDResult,
  ParcelPutRequestBody,
  ParcelPutResult,
  ParcelRequestBody,
  ParcelResult,
  ParcelsListResult,
  ParcelStatusDetailsResult,
  ParcelStatusResult,
  UnlockParcelRequestBody,
} from '../types/generated';
import { ContractService } from './base';

export type ParcelSearchBy = 'parcelID' | 'barCode' | 'parcelNumber';
export type ParcelReturnMode = 'objectData' | 'printCN23' | 'printCP71';

export class ParcelsService extends ContractService {
  readonly namespace = 'parcels' as const;

  /**
   * `POST /parcel`. Never repeated automatically after a 5xx or a lost connection: a second call could create
   * a second parcel. Check `parcels.get(parcelNumber, 'parcelNumber')` before retrying yourself.
   */
  create(body: ParcelRequestBody): Promise<ParcelResult> {
    return this.httpPost({ path: '/parcel', json: body });
  }

  /** `PUT /parcel/{parcelID}`; allowed until the parcel is received by Meest. */
  update(parcelId: string, body: ParcelPutRequestBody): Promise<ParcelPutResult> {
    return this.httpPut({ path: '/parcel/{parcelID}', pathParams: { parcelID: parcelId }, json: body });
  }

  /** `DELETE /parcel/{parcelID}/{contractID}`; only until the parcel is received, and only by its owner. */
  delete(parcelId: string, contractId: string): Promise<unknown> {
    return this.httpDelete({ path: '/parcel/{parcelID}/{contractID}', pathParams: { parcelID: parcelId, contractID: contractId } });
  }

  /** `GET /getParcel/{value}/{searchBy}/{returnMode}`. */
  get(value: string, searchBy: ParcelSearchBy = 'parcelID', returnMode: ParcelReturnMode = 'objectData'): Promise<GetParcelResult> {
    return this.httpGet({ path: '/getParcel/{parcelID}/{searchMode}/{returnMode}', pathParams: { parcelID: value, searchMode: searchBy, returnMode } });
  }

  /** Parcels created since `dateFrom`. */
  list(dateFrom: DateInput): Promise<ParcelsListResult> {
    return this.httpGet({ path: '/parcelsList/{dateFrom}', pathParams: { dateFrom: formatDate(dateFrom) } });
  }

  status(parcelId: string): Promise<ParcelStatusResult> {
    return this.httpGet({ path: '/parcelStatus/{parcelID}', pathParams: { parcelID: parcelId } });
  }

  statusDetails(parcelId: string): Promise<ParcelStatusDetailsResult> {
    return this.httpGet({ path: '/parcelStatusDetails/{parcelID}', pathParams: { parcelID: parcelId } });
  }

  /** `PUT /parcelChangeContractID?barCode=`. */
  changeContract(barCode: string, body: ParcelChangeContractIDRequestBody): Promise<ParcelChangeContractIDResult> {
    return this.httpPut({ path: '/parcelChangeContractID', query: { barCode }, json: body });
  }

  /** Blocks delivery while the parcel is entering Ukraine or in customs. Send `ParcelUID` or `ClientsShipmentRef`. */
  lock(body: LockParcelRequestBody): Promise<unknown> {
    return this.httpPost({ path: '/LockParcel', json: body });
  }

  unlock(body: UnlockParcelRequestBody): Promise<unknown> {
    return this.httpPost({ path: '/UnlockParcel', json: body });
  }
}
