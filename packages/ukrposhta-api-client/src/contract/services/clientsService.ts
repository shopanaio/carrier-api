// code and comments in English
import type { CallOptions, UkrposhtaMessage } from '../types/common';
import type { FreeShipments } from '../types/extra';
import type {
  Client,
  ClientAddress,
  ClientEmail,
  ClientInput,
  ClientPatch,
  ClientPhone,
  PhoneInfo,
  PostPayRecipientLink,
  ProhibitedPhone,
} from '../types/client';
import { ClientsOperations } from '../generated/operations';
import { WITH_TOKEN } from './base';

/** Clients (`/clients`): senders, recipients and postpay recipients of the counterparty. */
export class ClientsService extends ClientsOperations {
  readonly namespace = 'clients' as const;

  /** `POST /clients`. */
  create(client: ClientInput, options?: CallOptions): Promise<Client>;
  /** `POST /clients` with an array: several clients in one request. */
  create(clients: ClientInput[], options?: CallOptions): Promise<Client[]>;
  create(body: ClientInput | ClientInput[], options: CallOptions = {}): Promise<Client | Client[]> {
    return this.ctx.http.request({
      method: 'POST',
      path: '/clients',
      json: body,
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `PUT /clients/{uuid}`. To make another address the main one, send `addresses: [{ addressId, main: true }]`. */
  update(uuid: string, patch: ClientPatch, options: CallOptions = {}): Promise<Client> {
    return this.ctx.http.request<Client>({
      method: 'PUT',
      path: '/clients/{uuid}',
      pathParams: { uuid },
      json: patch,
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /clients/{uuid}`. */
  get(uuid: string, options: CallOptions = {}): Promise<Client> {
    return this.ctx.http.request<Client>({
      method: 'GET',
      path: '/clients/{uuid}',
      pathParams: { uuid },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `POST /clients/{uuid}` with a field list: reads only the named fields. */
  getFields<K extends keyof Client>(uuid: string, fields: K[], options: CallOptions = {}): Promise<Pick<Client, K>> {
    return this.ctx.http.request<Pick<Client, K>>({
      method: 'POST',
      path: '/clients/{uuid}',
      pathParams: { uuid },
      json: fields,
      idempotent: true,
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /clients/external-id/{externalId}`. */
  getByExternalId(externalId: string, options: CallOptions = {}): Promise<Client> {
    return this.ctx.http.request<Client>({
      method: 'GET',
      path: '/clients/external-id/{externalId}',
      pathParams: { externalId },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /**
   * `GET /clients/phone`. The Swagger declares a list, the documentation one client: the type admits both and the
   * answer is returned as the service sent it.
   */
  getByPhone(phoneNumber: string, countryISO3166: string, options: CallOptions = {}): Promise<Client | Client[]> {
    return this.ctx.http.request<Client | Client[]>({
      method: 'GET',
      path: '/clients/phone',
      query: { countryISO3166, phoneNumber },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /clients/{clientUuidOrPostId}/free-shipments/{freeShipmentsType}`: the bonus shipments of a client. */
  getFreeShipments(
    clientUuidOrPostId: string,
    freeShipmentsType: string,
    options: CallOptions = {},
  ): Promise<FreeShipments[]> {
    return this.ctx.http.request<FreeShipments[]>({
      method: 'GET',
      path: '/clients/{clientUuidOrPostId}/free-shipments/{freeShipmentsType}',
      pathParams: { clientUuidOrPostId, freeShipmentsType },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /client-addresses?clientUuid=`. */
  listAddresses(clientUuid: string, options: CallOptions = {}): Promise<ClientAddress[]> {
    return this.ctx.http.request<ClientAddress[]>({
      method: 'GET',
      path: '/client-addresses',
      query: { clientUuid },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /client-emails?clientUuid=`. */
  listEmails(clientUuid: string, options: CallOptions = {}): Promise<ClientEmail[]> {
    return this.ctx.http.request<ClientEmail[]>({
      method: 'GET',
      path: '/client-emails',
      query: { clientUuid },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /client-phones?clientUuid=`. */
  listPhones(clientUuid: string, options: CallOptions = {}): Promise<ClientPhone[]> {
    return this.ctx.http.request<ClientPhone[]>({
      method: 'GET',
      path: '/client-phones',
      query: { clientUuid },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `DELETE /client-addresses/{uuid}`: not the main address. */
  deleteAddress(addressUuid: string, options: CallOptions = {}): Promise<void> {
    return this.remove('/client-addresses/{uuid}', addressUuid, options);
  }

  /** `DELETE /client-emails/{uuid}`: not the main e-mail. */
  deleteEmail(emailUuid: string, options: CallOptions = {}): Promise<void> {
    return this.remove('/client-emails/{uuid}', emailUuid, options);
  }

  /** `DELETE /client-phones/{uuid}`: not the main phone. */
  deletePhone(phoneUuid: string, options: CallOptions = {}): Promise<void> {
    return this.remove('/client-phones/{uuid}', phoneUuid, options);
  }

  /** `GET /phones/UA/prohibited`: phone numbers the API rejects. */
  listProhibitedPhones(options: CallOptions = {}): Promise<ProhibitedPhone[]> {
    return this.ctx.http.request<ProhibitedPhone[]>({
      method: 'GET',
      path: '/phones/UA/prohibited',
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /phones/UA/prohibited/{phone}`. Resolves with the entry when the number is prohibited. */
  getProhibitedPhone(phone: string, options: CallOptions = {}): Promise<ProhibitedPhone> {
    return this.ctx.http.request<ProhibitedPhone>({
      method: 'GET',
      path: '/phones/UA/prohibited/{phone}',
      pathParams: { phone },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /phones/{id}`. */
  getPhone(id: number | string, options: CallOptions = {}): Promise<PhoneInfo> {
    return this.ctx.http.request<PhoneInfo>({
      method: 'GET',
      path: '/phones/{id}',
      pathParams: { id },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `POST /clients/{clientUuid}/post-pay-recipients/{postPayRecipientUuid}`: pay the cash on delivery to another client. */
  addPostPayRecipient(clientUuid: string, postPayRecipientUuid: string, options: CallOptions = {}) {
    return this.ctx.http.request<UkrposhtaMessage>({
      method: 'POST',
      path: '/clients/{clientUuid}/post-pay-recipients/{postPayRecipientUuid}',
      pathParams: { clientUuid, postPayRecipientUuid },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `DELETE /clients/{clientUuid}/post-pay-recipients/{postPayRecipientUuid}`. */
  removePostPayRecipient(clientUuid: string, postPayRecipientUuid: string, options: CallOptions = {}) {
    return this.ctx.http.request<UkrposhtaMessage>({
      method: 'DELETE',
      path: '/clients/{clientUuid}/post-pay-recipients/{postPayRecipientUuid}',
      pathParams: { clientUuid, postPayRecipientUuid },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /clients/{clientUuid}/post-pay-recipients`. */
  listPostPayRecipients(clientUuid: string, options: CallOptions = {}): Promise<PostPayRecipientLink[]> {
    return this.ctx.http.request<PostPayRecipientLink[]>({
      method: 'GET',
      path: '/clients/{clientUuid}/post-pay-recipients',
      pathParams: { clientUuid },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  private async remove(path: string, uuid: string, options: CallOptions): Promise<void> {
    await this.ctx.http.request({
      method: 'DELETE',
      path,
      pathParams: { uuid },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }
}
