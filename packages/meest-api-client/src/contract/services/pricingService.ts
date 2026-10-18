// code and comments in English
import type {
  CalculateExportB2CRequestBody,
  CalculateExportB2CResponse,
  CalculateRequestBody,
  CalculateResponse,
  OrderDateInfoResponse,
  SpecConditionsResponse,
} from '../types/generated';
import { ContractService } from './base';
import type { RequestOptions } from './base';

export class PricingService extends ContractService {
  readonly namespace = 'pricing' as const;

  /** Cost and delivery dates. Needs `sender`, `receiver` and `placesItems` at least. */
  calculate(body: CalculateRequestBody, options?: RequestOptions): Promise<CalculateResponse> {
    return this.httpPost({ signal: options?.signal, path: '/calculate', json: body, idempotent: true });
  }

  /** Special delivery conditions to put into `specConditionsItems`. */
  specConditions(options?: RequestOptions): Promise<SpecConditionsResponse> {
    return this.httpGet({ signal: options?.signal, path: '/specConditions' });
  }

  /** Earliest order dates for door service on a street. */
  orderDateInfo(streetId: string, options?: RequestOptions): Promise<OrderDateInfoResponse> {
    return this.httpGet({
      signal: options?.signal,
      path: '/orderDateInfo/{streetID}',
      pathParams: { streetID: streetId },
    });
  }

  /** Price of an export B2C parcel to a foreign country (`POST /calculateExportB2C`). */
  calculateExportB2C(
    body: CalculateExportB2CRequestBody,
    options?: RequestOptions,
  ): Promise<CalculateExportB2CResponse> {
    return this.httpPost({ signal: options?.signal, path: '/calculateExportB2C', json: body, idempotent: true });
  }
}
