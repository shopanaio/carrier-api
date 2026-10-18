// Compile-time checks for responses the Swagger documents without the usual envelope.
import type { ContractClientInfoResult, ParcelReturnNewResult } from '../src';
import { createMeestContractClient } from '../src';

const client = createMeestContractClient({ username: 'user', password: 'pass' });

export async function readReturn(): Promise<string | undefined> {
  const result: ParcelReturnNewResult = await client.misc.returnParcel({ parcelID: 'p1', reasonID: 'r1' });
  // The documented keys use a look-alike non-Latin letter; they are exact keys, not an open record.
  return result['do\u0441Number'];
}

export async function readContract(): Promise<string> {
  const info: ContractClientInfoResult = await client.misc.contractInfo('k1');
  // Required by the Swagger, so no optional chaining is needed.
  return info.contractID + info.client_postalCode + info.contract_term;
}

// @ts-expect-error an unknown key is not part of the documented return document
export const unknownKey: ParcelReturnNewResult = { doc: 'x' };
