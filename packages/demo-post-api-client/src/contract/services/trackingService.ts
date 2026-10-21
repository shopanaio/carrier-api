// code and comments in English
import type { DemoPostContractContext } from '../index';

export interface DemoPostTrackingEvent {
  code: string;
  description?: string;
  date: string;
}

/** Example service: replace with the carrier's real tracking endpoint and wire types. */
export class TrackingService {
  readonly namespace = 'tracking' as const;
  private ctx!: DemoPostContractContext;

  attach(ctx: DemoPostContractContext) {
    this.ctx = ctx;
  }

  getEvents(trackingNumber: string, options: { signal?: AbortSignal } = {}): Promise<DemoPostTrackingEvent[]> {
    return this.ctx.http.request<DemoPostTrackingEvent[]>({
      method: 'GET',
      path: '/tracking/{trackingNumber}',
      pathParams: { trackingNumber },
      signal: options.signal,
    });
  }
}
