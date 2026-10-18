// code and comments in English
import { resolveSecret } from '@shopana/carrier-core';
import type { CallOptions } from '../types/common';
import type { ForwardRequest, ReturnOrderAnswer, ReturnOrderRequest } from '../types/management';
import type { ClientRef, Shipment } from '../types/shipment';
import type { UkrposhtaContractContext } from './base';
import { WITH_TOKEN } from './base';

/**
 * Changes to a shipment after dispatch (`/shipments/management`, `/dispatch`). Each operation is allowed only in
 * certain statuses; the carrier answers `UPE01001` otherwise.
 */
export class ManagementService {
  readonly namespace = 'management' as const;
  private ctx!: UkrposhtaContractContext;

  attach(ctx: UkrposhtaContractContext) {
    this.ctx = ctx;
  }

  /**
   * `PUT /shipments/management/{uuid}/return-after-storage-days/{days}`: extends the storage period. Allowed for the
   * sender and the recipient, not for CARGO or PROCESS_AS_REFUSAL shipments, and never shortens the period.
   */
  extendStorage(shipmentUuid: string, days: number, options: CallOptions = {}): Promise<Shipment> {
    return this.ctx.http.request<Shipment>({
      method: 'PUT',
      path: '/shipments/management/{shipmentUuid}/return-after-storage-days/{days}',
      pathParams: { shipmentUuid, days },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `PUT /shipments/management/{uuid}/recipient`: a new phone number for the recipient. */
  changeRecipientPhone(shipmentUuid: string, recipientPhone: string, options: CallOptions = {}): Promise<Shipment> {
    return this.putRecipient(shipmentUuid, { recipientPhone }, options);
  }

  /**
   * `PUT /shipments/management/{uuid}/recipient`: another recipient. To change a name or phone, create a new client
   * first and pass its uuid. Allowed while the shipment is CREATED, REGISTERED, DELIVERING or with a courier.
   */
  changeRecipient(shipmentUuid: string, recipient: ClientRef, options: CallOptions = {}): Promise<Shipment> {
    return this.putRecipient(shipmentUuid, { recipient }, options);
  }

  /** `POST /dispatch/return-order`: orders the return of a registered shipment to the sender. */
  async createReturnOrder(request: ReturnOrderRequest, options: CallOptions = {}): Promise<ReturnOrderAnswer> {
    return this.ctx.http.request<ReturnOrderAnswer>({
      method: 'POST',
      path: '/dispatch/return-order',
      json: {
        barcode: request.barcode,
        // The return order also wants the counterparty token in its body.
        senderToken: await resolveSecret(this.ctx.config.counterpartyToken),
        returnAddressId: String(request.returnAddressId),
      },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /**
   * `POST /shipments/management/{uuid}/forward`: redirects the shipment to another address. The name, e-mail and
   * phone of the new recipient must equal the original ones; only the address may differ.
   */
  forward(shipmentUuid: string, request: ForwardRequest, options: CallOptions = {}): Promise<Shipment> {
    return this.ctx.http.request<Shipment>({
      method: 'POST',
      path: '/shipments/management/{shipmentUuid}/forward',
      pathParams: { shipmentUuid },
      json: request,
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /**
   * `PUT /shipments/management/{uuid}/postpay`: changes the cash on delivery (1 to 29 999 UAH, not above the declared
   * price). A commission paid by the sender cannot grow; only the sender may change the amount.
   */
  changePostPay(shipmentUuid: string, postPay: number, options: CallOptions = {}): Promise<Shipment> {
    return this.ctx.http.request<Shipment>({
      method: 'PUT',
      path: '/shipments/management/{shipmentUuid}/postpay',
      pathParams: { shipmentUuid },
      json: { postPay },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  private putRecipient(shipmentUuid: string, body: Record<string, unknown>, options: CallOptions): Promise<Shipment> {
    return this.ctx.http.request<Shipment>({
      method: 'PUT',
      path: '/shipments/management/{shipmentUuid}/recipient',
      pathParams: { shipmentUuid },
      json: body,
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }
}
