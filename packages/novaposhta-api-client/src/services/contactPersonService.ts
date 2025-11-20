/**
 * Contact person service for Nova Poshta API
 * Handles contact person CRUD operations
 */

import type { HttpTransport } from '../http/transport';
import type { ClientContext } from '../core/client';
import { toHttpTransport } from '../core/client';
import type {
  SaveContactPersonRequest,
  SaveContactPersonResponse,
  UpdateContactPersonRequest,
  UpdateContactPersonResponse,
  DeleteContactPersonRequest,
  DeleteContactPersonResponse,
} from '../types/contactPerson';
import type { NovaPoshtaRequest } from '../types/base';
import { NovaPoshtaModel, NovaPoshtaMethod } from '../types/enums';

/**
 * Service for managing contact person operations
 *
 * @example
 * ```typescript
 * const client = createClient({ apiKey, transport, baseUrl })
 *   .use(new ContactPersonService());
 *
 * await client.contactPerson.save({
 *   counterpartyRef: 'counterparty-ref',
 *   firstName: 'Іван',
 *   lastName: 'Петренко',
 *   phone: '380501234567',
 * });
 * ```
 */
export class ContactPersonService {
  readonly namespace = 'contactPerson' as const;
  private transport!: HttpTransport;
  private apiKey?: string;

  attach(ctx: ClientContext) {
    this.transport = toHttpTransport(ctx);
    this.apiKey = ctx.apiKey;
  }

  /**
   * Save contact person
   * @description Creates a new contact person for a counterparty
   */
  async save(request: SaveContactPersonRequest): Promise<SaveContactPersonResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.ContactPerson,
      calledMethod: NovaPoshtaMethod.Save,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<SaveContactPersonResponse['data']>(apiRequest);
  }

  /**
   * Update contact person
   * @description Updates an existing contact person record
   */
  async update(request: UpdateContactPersonRequest): Promise<UpdateContactPersonResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.ContactPerson,
      calledMethod: NovaPoshtaMethod.Update,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<UpdateContactPersonResponse['data']>(apiRequest);
  }

  /**
   * Delete contact person
   * @description Deletes a contact person by reference
   */
  async delete(request: DeleteContactPersonRequest): Promise<DeleteContactPersonResponse> {
    const apiRequest: NovaPoshtaRequest = {
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
      modelName: NovaPoshtaModel.ContactPerson,
      calledMethod: NovaPoshtaMethod.Delete,
      methodProperties: request as unknown as Record<string, unknown>,
    };

    return await this.transport.request<DeleteContactPersonResponse['data']>(apiRequest);
  }
}
