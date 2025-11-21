import { BaseService } from './baseService';
import type {
  CalculateRequestBody,
  CalculateResult,
  GetParcelPathParams,
  GetParcelResult,
  LockParcelRequestBody,
  LockParcelResult,
  OrderDateInfoPathParams,
  OrderDateInfoResult,
  ParcelRequestBody,
  ParcelResult,
  Parcel2PathParams,
  Parcel2RequestBody,
  Parcel2Result,
  Parcel3PathParams,
  Parcel3Result,
  ParcelChangeContractIDQueryParams,
  ParcelChangeContractIDRequestBody,
  ParcelChangeContractIDResult,
  ParcelsListPathParams,
  ParcelsListResult,
  ParcelStatusPathParams,
  ParcelStatusResult,
  ParcelStatusDetailsPathParams,
  ParcelStatusDetailsResult,
  SpecConditionsResult,
  UnlockParcelRequestBody,
  UnlockParcelResult,
} from '../types/parcels';

const encode = (value: string | number) => encodeURIComponent(String(value));

export class ParcelsService extends BaseService {
  readonly namespace = 'parcels' as const;

  async calculate(body: CalculateRequestBody = {}): Promise<CalculateResult> {
    return this.send<CalculateResult>({
      method: 'POST',
      path: '/calculate',
      body,
    });
  }

  async getParcel(params: GetParcelPathParams): Promise<GetParcelResult> {
    const path = `/getParcel/${encode(params.parcelID)}/${encode(params.searchMode)}/${encode(params.returnMode)}`;
    return this.send<GetParcelResult>({
      method: 'GET',
      path,
    });
  }

  async lock(body: LockParcelRequestBody): Promise<LockParcelResult> {
    return this.send<LockParcelResult>({
      method: 'POST',
      path: '/LockParcel',
      body,
    });
  }

  async unlock(body: UnlockParcelRequestBody): Promise<UnlockParcelResult> {
    return this.send<UnlockParcelResult>({
      method: 'POST',
      path: '/UnlockParcel',
      body,
    });
  }

  async orderDateInfo(params: OrderDateInfoPathParams): Promise<OrderDateInfoResult> {
    const path = `/orderDateInfo/${encode(params.streetID)}`;
    return this.send<OrderDateInfoResult>({
      method: 'GET',
      path,
    });
  }

  async create(payload: ParcelRequestBody): Promise<ParcelResult> {
    return this.send<ParcelResult>({
      method: 'POST',
      path: '/parcel',
      body: payload,
    });
  }

  async update(params: Parcel2PathParams, payload: Parcel2RequestBody): Promise<Parcel2Result> {
    const path = `/parcel/${encode(params.parcelID)}`;
    return this.send<Parcel2Result>({
      method: 'PUT',
      path,
      body: payload,
    });
  }

  async delete(params: Parcel3PathParams & { contractID: string }): Promise<Parcel3Result> {
    const path = `/parcel/${encode(params.parcelID)}/${encode(params.contractID)}`;
    return this.send<Parcel3Result>({
      method: 'DELETE',
      path,
    });
  }

  async changeContract(
    query: ParcelChangeContractIDQueryParams,
    payload: ParcelChangeContractIDRequestBody,
  ): Promise<ParcelChangeContractIDResult> {
    return this.send<ParcelChangeContractIDResult>({
      method: 'PUT',
      path: '/parcelChangeContractID',
      query,
      body: payload,
    });
  }

  async listByDate(params: ParcelsListPathParams): Promise<ParcelsListResult> {
    const path = `/parcelsList/${encode(params.dateFrom)}`;
    return this.send<ParcelsListResult>({
      method: 'GET',
      path,
    });
  }

  async getStatus(params: ParcelStatusPathParams): Promise<ParcelStatusResult> {
    const path = `/parcelStatus/${encode(params.parcelID)}`;
    return this.send<ParcelStatusResult>({
      method: 'GET',
      path,
    });
  }

  async getStatusDetails(params: ParcelStatusDetailsPathParams): Promise<ParcelStatusDetailsResult> {
    const path = `/parcelStatusDetails/${encode(params.parcelID)}`;
    return this.send<ParcelStatusDetailsResult>({
      method: 'GET',
      path,
    });
  }

  async getSpecConditions(): Promise<SpecConditionsResult> {
    return this.send<SpecConditionsResult>({
      method: 'GET',
      path: '/specConditions',
    });
  }
}
