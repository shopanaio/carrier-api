// code and comments in English
import type { BinaryData } from '@shopana/carrier-core';
import { DeliveryNotificationsOperations } from '../generated/operations';
import type { Form119Pdf, ShipmentDto } from '../generated/types';
import type { CallOptions } from '../types/common';
import type { ShipmentDeliveryNotificationBarcodes, SignedNotificationsRequest } from '../types/extra';
import { WITH_TOKEN } from './base';

/**
 * Delivery notifications (form 119, sections 4.4 and 4.5): every operation of the snapshot plus the ones only the
 * documentation lists.
 */
export class DeliveryNotificationsService extends DeliveryNotificationsOperations {
  /** `POST /shipments/delivery-notification`: the delivery notification barcodes of a list of shipment barcodes. */
  createForShipments(
    shipmentBarcodes: string[],
    options: CallOptions = {},
  ): Promise<ShipmentDeliveryNotificationBarcodes[]> {
    return this.ctx.http.request<ShipmentDeliveryNotificationBarcodes[]>({
      method: 'POST',
      path: '/shipments/delivery-notification',
      json: shipmentBarcodes,
      // Asking for the barcodes of existing notifications changes nothing a second time.
      idempotent: true,
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /shipment-groups/{uuid}/document-delivery-notification/json`: the data to print form 119 for a group. */
  getGroupDeliveryNotificationJson(uuid: string, options: CallOptions = {}): Promise<Form119Pdf[]> {
    return this.ctx.http.request<Form119Pdf[]>({
      method: 'GET',
      path: '/shipment-groups/{uuid}/document-delivery-notification/json',
      pathParams: { uuid },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /delivery-notifications/{uuidOrBarcode}/parent`: the shipment (or letter) a notification belongs to. */
  getParent(uuidOrBarcode: string, options: CallOptions = {}): Promise<ShipmentDto> {
    return this.ctx.http.request<ShipmentDto>({
      method: 'GET',
      path: '/delivery-notifications/{uuidOrBarcode}/parent',
      pathParams: { uuidOrBarcode },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /**
   * `POST /signed-notifications/{clientUuid}/batch`: signed delivery notifications of a period. The answer is a ZIP
   * archive (a `BinaryData`; several come as multipart/form-data) unless `responseType` is `JSON`, whose structure the
   * documentation does not describe.
   */
  getSignedNotifications(
    clientUuid: string,
    request: SignedNotificationsRequest & { responseType: 'JSON' },
    options?: CallOptions,
  ): Promise<unknown>;
  getSignedNotifications(
    clientUuid: string,
    request: SignedNotificationsRequest & { responseType?: 'ZIP' },
    options?: CallOptions,
  ): Promise<BinaryData>;
  getSignedNotifications(
    clientUuid: string,
    request: SignedNotificationsRequest,
    options?: CallOptions,
  ): Promise<unknown>;
  getSignedNotifications(
    clientUuid: string,
    request: SignedNotificationsRequest,
    options: CallOptions = {},
  ): Promise<unknown> {
    return this.ctx.http.request<unknown>({
      method: 'POST',
      path: '/signed-notifications/{clientUuid}/batch',
      pathParams: { clientUuid },
      json: request,
      ...(request.responseType === 'JSON' ? {} : { responseType: 'binary' as const }),
      idempotent: true,
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }
}
