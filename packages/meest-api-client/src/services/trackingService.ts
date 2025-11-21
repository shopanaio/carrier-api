import { BaseService } from './baseService';
import type {
  ParcelInfoTrackingPathParams,
  ParcelInfoTrackingResult,
  TrackingPathParams,
  TrackingResult,
  TrackingByDatePathParams,
  TrackingByDateResult,
  TrackingByPeriodPathParams,
  TrackingByPeriodResult,
  TrackingDeliveredPathParams,
  TrackingDeliveredResult,
} from '../types/tracking';

const encode = (value: string | number) => encodeURIComponent(String(value));

export class TrackingService extends BaseService {
  readonly namespace = 'tracking' as const;

  async getParcelInfo(params: ParcelInfoTrackingPathParams): Promise<ParcelInfoTrackingResult> {
    const path = `/parcelInfoTracking/${encode(params.parcelID)}`;
    return this.send<ParcelInfoTrackingResult>({
      method: 'GET',
      path,
    });
  }

  async trackByNumber(params: TrackingPathParams): Promise<TrackingResult> {
    const path = `/tracking/${encode(params.trackNumber)}`;
    return this.send<TrackingResult>({
      method: 'GET',
      path,
    });
  }

  async trackByDate(params: TrackingByDatePathParams): Promise<TrackingByDateResult> {
    const path = `/trackingByDate/${encode(params.searchDate)}`;
    return this.send<TrackingByDateResult>({
      method: 'GET',
      path,
    });
  }

  async trackByPeriod(params: TrackingByPeriodPathParams): Promise<TrackingByPeriodResult> {
    const path = `/trackingByPeriod/${encode(params.dateFrom)}/${encode(params.dateTo)}`;
    return this.send<TrackingByPeriodResult>({
      method: 'GET',
      path,
    });
  }

  async getDelivered(params: TrackingDeliveredPathParams): Promise<TrackingDeliveredResult> {
    const path = `/trackingDelivered/${encode(params.dateFrom)}/${encode(params.dateTo)}/${encode(params.page)}`;
    return this.send<TrackingDeliveredResult>({
      method: 'GET',
      path,
    });
  }
}
