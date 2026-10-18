// code and comments in English
import type { Address } from './address';
import type { ClientType, PostPayPaymentType, UkrposhtaDateTime } from './common';

export type PhoneType = 'WORK' | 'PERSONAL';
export type ClientAddressType = 'PHYSICAL' | 'LEGAL';

export interface ClientAddressInput {
  addressId: number | string;
  main?: boolean;
  type?: ClientAddressType;
}

export interface ClientAddress {
  uuid: string;
  addressId: number;
  address: Address;
  type: ClientAddressType;
  main: boolean;
}

export interface ClientPhone {
  uuid: string;
  phoneId: number;
  phoneNumber: string;
  type: PhoneType;
  main: boolean;
  isConfirmed?: boolean;
}

export interface ClientEmail {
  uuid: string;
  email: string;
  main: boolean;
}

/**
 * Body of `POST /clients`. An individual or a private entrepreneur needs `firstName` and `lastName`
 * (`name` is built from them); a company needs `name`. A company needs `edrpou`, a private entrepreneur `tin`.
 */
export interface ClientInput {
  type?: ClientType;
  name?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  latinName?: string;
  /** Id of a created address (see `addresses.create`). */
  addressId: number | string;
  /** Digits, up to 25. Required for EXPRESS and STANDARD shipments. */
  phoneNumber: string;
  email?: string;
  edrpou?: string;
  tin?: string;
  /** IBAN. Give only this field to create a client with a bank account. */
  bankAccount?: string;
  uniqueRegistrationNumber?: string;
  /** Your own id of the client, readable through `clients.getByExternalId`. */
  externalId?: string;
  contactPersonName?: string;
  resident?: boolean;
  addresses?: ClientAddressInput[];
}

/** Body of `PUT /clients/{uuid}`: any subset of the creation fields. */
export type ClientPatch = Partial<Omit<ClientInput, 'type'>>;

export interface PostPayRecipient {
  uuid: string;
  name: string;
  type: ClientType;
  counterpartyUuid?: string;
  postPayPaymentType?: PostPayPaymentType;
  edrpou?: string;
  tin?: string;
  bankAccount?: string;
  personalDataApproved?: boolean;
}

export interface Client {
  uuid: string;
  name: string;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  latinName: string | null;
  postId: string | null;
  externalId: string | null;
  uniqueRegistrationNumber: string | null;
  counterpartyUuid: string;
  addressId: number;
  addresses: ClientAddress[];
  phoneNumber: string;
  phones: ClientPhone[];
  email: string;
  emails: ClientEmail[];
  type: ClientType;
  postPayPaymentType?: PostPayPaymentType;
  edrpou?: string | null;
  tin?: string | null;
  bankAccount?: string | null;
  contactPersonName: string | null;
  resident: boolean;
  GDPRRead: boolean;
  GDPRAccept: boolean;
  personalDataApproved: boolean;
  /** Inspection on delivery and return of documents are allowed for this client. */
  checkOnDeliveryAllowed: boolean;
  postPayRecipients?: PostPayRecipient[];
}

export interface PostPayRecipientLink {
  uuid: string;
  recipient: PostPayRecipient;
  created: UkrposhtaDateTime;
}

export interface ProhibitedPhone {
  phone: string;
  fromDate: string;
  country: string;
}

export interface PhoneInfo {
  id: number;
  rawNumber: string;
  phoneNumber: string;
  countryCode: string;
  providerCode: string;
  localCode: string;
  normalized: boolean;
  country: string;
}
