// code and comments in English
import type { MeestInfo } from './envelope';

/**
 * The Swagger documents some responses without the usual envelope (the body is the payload itself), so the generator
 * has no useful type for them. These are written by hand from the schemas and examples in the Swagger.
 */

/** `POST /parcelReturn_new`. The documented keys contain a look-alike non-Latin letter, so the shape is an open record. */
export interface ParcelReturnResult {
  [key: string]: string | undefined;
}

/** `GET /contractClientInfo/{contractID}`: contract and client card; only the stable keys are typed. */
export interface ContractClientInfo {
  contractID?: string;
  contract?: string;
  number?: string;
  edrpou?: string;
  allowedCOD?: boolean;
  date?: string;
  dateTo?: string;
  deleted?: boolean;
  client?: string;
  clientID?: string;
  clientFullName?: string;
  phone?: string;
  eMail?: string;
  [key: string]: unknown;
}

/** `GET /CheckPhoneOnParcel/{barCode}/{phoneCheck}`. */
export interface PhoneCheckResult {
  PhoneCorrespondsParcel: boolean;
  phone?: string;
  parcel?: string;
}

/** `POST /contract_validation_check`: `status` is "Ok" when the contract belongs to the agent. */
export interface ContractValidation {
  info?: MeestInfo;
  result?: { status?: string; text?: string };
}
