// code and comments in English
// Contract of the eCom API: the SwaggerHub snapshot (contracts/ukrposhta-ecom.openapi.json) plus the
// differences of the 09.03.2026 documentation (contracts/overrides.json), embedded by scripts/gen-ecom-spec.mjs.
import { contractFromOpenApi } from '@shopana/carrier-testing';
import type { ApiContract, OperationContract } from '@shopana/carrier-testing';
import { ukrposhtaBaseUrls } from '../config';
import { ukrposhtaEcomSpec } from './generated/ecomSpec';

export const ukrposhtaEcomContract: ApiContract = contractFromOpenApi(ukrposhtaEcomSpec, {
  name: 'ukrposhta-ecom',
  baseUrl: ukrposhtaBaseUrls('production').ecom,
});

/** Whether the operation takes the counterparty token (`?token=` in the Swagger). */
export function takesCounterpartyToken(operation: OperationContract): boolean {
  const query = operation.params?.query;
  if (typeof query !== 'object') return false;
  const properties = (query as { properties?: Record<string, unknown> }).properties;
  return properties !== undefined && 'token' in properties;
}
