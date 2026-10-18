// code and comments in English
import type { CalculateRequestBody, CalculateResult, OrderDateInfoResult, SpecConditionsResult } from '../types/generated';
import { ContractService } from './base';

export class PricingService extends ContractService {
  readonly namespace = 'pricing' as const;

  /** Cost and delivery dates. Needs `sender`, `receiver` and `placesItems` at least. */
  calculate(body: CalculateRequestBody): Promise<CalculateResult> {
    return this.httpPost({ path: '/calculate', json: body, idempotent: true });
  }

  /** Special delivery conditions to put into `specConditionsItems`. */
  specConditions(): Promise<SpecConditionsResult> {
    return this.httpGet({ path: '/specConditions' });
  }

  /** Earliest order dates for door service on a street. */
  orderDateInfo(streetId: string): Promise<OrderDateInfoResult> {
    return this.httpGet({ path: '/orderDateInfo/{streetID}', pathParams: { streetID: streetId } });
  }
}
