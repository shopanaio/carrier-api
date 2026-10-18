// Compile-time checks for the overloads of `branches.list`.
import type { BranchesFilter, MeestBranchFull, MeestBranchShort, MeestPublicEnvelope } from '../src';
import { createMeestPublicClient } from '../src';

type Eq<A, B> = (<X>() => X extends A ? 1 : 2) extends <X>() => X extends B ? 1 : 2 ? true : false;
type Assert<V extends true> = V;

const client = createMeestPublicClient();
const variable: BranchesFilter = { viewdata: 'full' };

export async function overloads() {
  const noFilter = await client.branches.list();
  const short = await client.branches.list({ city: 'Lviv' });
  const full = await client.branches.list({ city: 'Lviv', viewdata: 'full' });
  const general = await client.branches.list(variable);

  const a: Assert<Eq<typeof noFilter, MeestPublicEnvelope<MeestBranchShort[]>>> = true;
  const b: Assert<Eq<typeof short, MeestPublicEnvelope<MeestBranchShort[]>>> = true;
  const c: Assert<Eq<typeof full, MeestPublicEnvelope<MeestBranchFull[]>>> = true;
  // A filter typed as BranchesFilter may or may not ask for the full view, so either form can come back.
  const d: Assert<Eq<typeof general, MeestPublicEnvelope<Array<MeestBranchShort | MeestBranchFull>>>> = true;
  return [a, b, c, d];
}

export async function variableFilterIsNotTreatedAsShort() {
  const answer = await client.branches.list(variable);
  for (const branch of answer.result ?? []) {
    // @ts-expect-error parcel_max_kg is not required in the full form, so it is not guaranteed on the union
    const kg: string | number = branch.parcel_max_kg;
    void kg;
  }
}
