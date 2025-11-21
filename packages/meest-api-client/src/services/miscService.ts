import { BaseService } from './baseService';
import type {
  BannersResult,
  CheckPhoneOnParcelPathParams,
  ContractClientInfoPathParams,
  ContractValidationCheckRequestBody,
  ContractValidationCheckResult,
  ParcelReturnNewRequestBody,
  ParcelReturnReasonsResult,
} from '../types/misc';

const encode = (value: string | number) => encodeURIComponent(String(value));

export class MiscService extends BaseService {
  readonly namespace = 'misc' as const;

  async getBanners(): Promise<BannersResult> {
    return this.send<BannersResult>({
      method: 'GET',
      path: '/banners',
    });
  }

  async parcelReturn(body: ParcelReturnNewRequestBody): Promise<void> {
    await this.send<void>({
      method: 'POST',
      path: '/parcelReturn_new',
      body,
    });
  }

  async parcelReturnReasons(): Promise<ParcelReturnReasonsResult> {
    return this.send<ParcelReturnReasonsResult>({
      method: 'GET',
      path: '/parcelReturnReasons',
    });
  }

  async checkPhoneOnParcel(params: CheckPhoneOnParcelPathParams): Promise<void> {
    const path = `/CheckPhoneOnParcel/${encode(params.barCode)}/${encode(params.phoneCheck)}`;
    await this.send<void>({
      method: 'GET',
      path,
    });
  }

  async contractClientInfo(params: ContractClientInfoPathParams): Promise<void> {
    const path = `/contractClientInfo/${encode(params.contractID)}`;
    await this.send<void>({
      method: 'GET',
      path,
    });
  }

  async contractValidationCheck(body: ContractValidationCheckRequestBody): Promise<ContractValidationCheckResult> {
    return this.send<ContractValidationCheckResult>({
      method: 'POST',
      path: '/contract_validation_check',
      body,
    });
  }
}
