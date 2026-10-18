// code and comments in English
import type {
  BannersResponse,
  CheckPhoneOnParcelResponse,
  ContractClientInfoResponse,
  ContractValidationCheckRequestBody,
  ContractValidationCheckResponse,
  ParcelReturnNewRequestBody,
  ParcelReturnNewResponse,
  ParcelReturnReasonsResponse,
} from '../types/generated';
import { ContractService } from './base';
import type { RequestOptions } from './base';

/** Returns, contract data and other helpers. */
export class MiscService extends ContractService {
  readonly namespace = 'misc' as const;

  /** Sender refuses a parcel with a reason from `returnReasons()`; the parcel travels back. */
  returnParcel(body: ParcelReturnNewRequestBody, options?: RequestOptions): Promise<ParcelReturnNewResponse> {
    return this.httpPost({ signal: options?.signal, path: '/parcelReturn_new', json: body });
  }

  returnReasons(options?: RequestOptions): Promise<ParcelReturnReasonsResponse> {
    return this.httpGet({ signal: options?.signal, path: '/parcelReturnReasons' });
  }

  contractInfo(contractId: string, options?: RequestOptions): Promise<ContractClientInfoResponse> {
    return this.httpGet({
      signal: options?.signal,
      path: '/contractClientInfo/{contractID}',
      pathParams: { contractID: contractId },
    });
  }

  /** Whether `phone` is the recipient's number of the parcel. */
  checkPhone(barCode: string, phone: string, options?: RequestOptions): Promise<CheckPhoneOnParcelResponse> {
    return this.httpGet({
      signal: options?.signal,
      path: '/CheckPhoneOnParcel/{barCode}/{phoneCheck}',
      pathParams: { barCode, phoneCheck: phone },
    });
  }

  /** Checks that a contract belongs to an agent. */
  async validateContract(
    body: ContractValidationCheckRequestBody,
    options?: RequestOptions,
  ): Promise<ContractValidationCheckResponse> {
    return this.httpPost({ signal: options?.signal, path: '/contract_validation_check', json: body, idempotent: true });
  }

  banners(options?: RequestOptions): Promise<BannersResponse> {
    return this.httpGet({ signal: options?.signal, path: '/banners' });
  }
}
