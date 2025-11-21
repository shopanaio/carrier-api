import { BaseService } from './baseService';
import type {
  AvailableTimeSlotsQueryParams,
  AvailableTimeSlotsResult,
  RegisterBranchRequestBody,
  RegisterBranchResult,
  RegisterBranch2RequestBody,
  RegisterBranch2PathParams,
  RegisterBranch2Result,
  RegisterBranch3PathParams,
  RegisterBranch3Result,
  RegisterPickupRequestBody,
  RegisterPickupResult,
  RegisterPickup2RequestBody,
  RegisterPickup2PathParams,
  RegisterPickup2Result,
  RegisterPickup3PathParams,
  RegisterPickup3Result,
  RegistersListPathParams,
  RegistersListResult,
} from '../types/registers';

const encode = (value: string | number) => encodeURIComponent(String(value));

export class RegistersService extends BaseService {
  readonly namespace = 'registers' as const;

  async getAvailableTimeSlots(query: AvailableTimeSlotsQueryParams): Promise<AvailableTimeSlotsResult> {
    return this.send<AvailableTimeSlotsResult>({
      method: 'GET',
      path: '/availableTimeSlots',
      query,
    });
  }

  async createBranchRegister(body: RegisterBranchRequestBody = {}): Promise<RegisterBranchResult> {
    return this.send<RegisterBranchResult>({
      method: 'POST',
      path: '/registerBranch',
      body,
    });
  }

  async updateBranchRegister(
    params: RegisterBranch2PathParams,
    body: RegisterBranch2RequestBody = {},
  ): Promise<RegisterBranch2Result> {
    const path = `/registerBranch/${encode(params.registerID)}`;
    return this.send<RegisterBranch2Result>({
      method: 'PUT',
      path,
      body,
    });
  }

  async deleteBranchRegister(params: RegisterBranch3PathParams): Promise<RegisterBranch3Result> {
    const path = `/registerBranch/${encode(params.registerID)}`;
    return this.send<RegisterBranch3Result>({
      method: 'DELETE',
      path,
    });
  }

  async createPickupRegister(body: RegisterPickupRequestBody = {}): Promise<RegisterPickupResult> {
    return this.send<RegisterPickupResult>({
      method: 'POST',
      path: '/registerPickup',
      body,
    });
  }

  async updatePickupRegister(
    params: RegisterPickup2PathParams,
    body: RegisterPickup2RequestBody = {},
  ): Promise<RegisterPickup2Result> {
    const path = `/registerPickup/${encode(params.registerID)}`;
    return this.send<RegisterPickup2Result>({
      method: 'PUT',
      path,
      body,
    });
  }

  async deletePickupRegister(params: RegisterPickup3PathParams): Promise<RegisterPickup3Result> {
    const path = `/registerPickup/${encode(params.registerID)}`;
    return this.send<RegisterPickup3Result>({
      method: 'DELETE',
      path,
    });
  }

  async list(params: RegistersListPathParams): Promise<RegistersListResult> {
    const path = `/registersList/${encode(params.dateFrom)}`;
    return this.send<RegistersListResult>({
      method: 'GET',
      path,
    });
  }
}
