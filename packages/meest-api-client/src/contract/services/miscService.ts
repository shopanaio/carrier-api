// code and comments in English
import type { BannersResult, ContractValidationCheckRequestBody, ParcelReturnNewRequestBody, ParcelReturnReasonsResult } from '../types/generated';
import type { ContractClientInfo, ContractValidation, ParcelReturnResult, PhoneCheckResult } from '../types/extra';
import { ContractService } from './base';

/** Returns, contract data and other helpers. */
export class MiscService extends ContractService {
  readonly namespace = 'misc' as const;

  /** Sender refuses a parcel with a reason from `returnReasons()`; the parcel travels back. */
  returnParcel(body: ParcelReturnNewRequestBody): Promise<ParcelReturnResult> {
    return this.httpPost({ path: '/parcelReturn_new', json: body });
  }

  returnReasons(): Promise<ParcelReturnReasonsResult> {
    return this.httpGet({ path: '/parcelReturnReasons' });
  }

  contractInfo(contractId: string): Promise<ContractClientInfo> {
    return this.httpGet({ path: '/contractClientInfo/{contractID}', pathParams: { contractID: contractId } });
  }

  /** Whether `phone` is the recipient's number of the parcel. */
  checkPhone(barCode: string, phone: string): Promise<PhoneCheckResult> {
    return this.httpGet({ path: '/CheckPhoneOnParcel/{barCode}/{phoneCheck}', pathParams: { barCode, phoneCheck: phone } });
  }

  /** Checks that a contract belongs to an agent. */
  async validateContract(body: ContractValidationCheckRequestBody): Promise<ContractValidation> {
    return this.httpPost({ path: '/contract_validation_check', json: body, idempotent: true });
  }

  banners(): Promise<BannersResult> {
    return this.httpGet({ path: '/banners' });
  }
}
