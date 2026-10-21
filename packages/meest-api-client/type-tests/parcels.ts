// Compile-time checks: `yarn type-check` fails when the generated request types drift from the Swagger snapshot
// (a Swagger-valid body must compile, an invalid one must not).
import type { ParcelPutRequestBody, ParcelRequestBody } from '../src';
import { createMeestContractClient } from '../src';

const client = createMeestContractClient({ username: 'user', password: 'pass' });

const party = {
  name: 'Name',
  phone: '+380671112233',
  branchID: 'b1',
  addressID: 'a1',
  building: '1',
  service: 'Branch',
};

// The current contract requires quantity, placeWeight and placeVolume for every place, and the card owner's phone.
const valid: ParcelPutRequestBody = {
  payType: 'cash',
  receiverPay: false,
  sender: party,
  receiver: party,
  placesItems: [{ quantity: 1, placeWeight: 1.5, placeVolume: 0.01 }],
  cardForCOD: { number: '1234123412341234', ownermobile: '+380671112233' },
};

export function updateParcel(signal: AbortSignal) {
  return client.parcels.update('parcel-id', valid, { signal });
}

export const createValid: ParcelRequestBody = valid;

// A place without placeWeight and placeVolume (the shape the previous snapshot required) is rejected.
export const legacyPlace: ParcelPutRequestBody = {
  ...valid,
  // @ts-expect-error placeWeight and placeVolume are required
  placesItems: [{ quantity: 1, weight: 1.5 }],
};

// The owner's phone is required together with the card number.
export const cardWithoutPhone: ParcelPutRequestBody = {
  ...valid,
  // @ts-expect-error ownermobile is required
  cardForCOD: { number: '1234123412341234' },
};

// payType and receiverPay are required.
// @ts-expect-error payType is required
export const noPayType: ParcelRequestBody = { receiverPay: false, sender: party, receiver: party };
