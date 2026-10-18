// code and comments in English
import { DeliveryNotificationsOperations } from '../generated/operations';
import type { Form119Pdf } from '../generated/types';
import type { CallOptions } from '../types/common';
import { WITH_TOKEN } from './base';

/**
 * Delivery notifications (form 119, section 4.4 and 4.5): every operation of the snapshot plus the JSON endpoints
 * under the paths the documentation uses (`/form119/json`).
 */
export class DeliveryNotificationsService extends DeliveryNotificationsOperations {
  /** `GET /shipments/{uuidOrBarcode}/form119/json`: the data to print form 119 of a shipment. */
  getForm119Json(uuidOrBarcode: string, options: CallOptions = {}): Promise<Form119Pdf> {
    return this.ctx.http.request<Form119Pdf>({
      method: 'GET',
      path: '/shipments/{uuidOrBarcode}/form119/json',
      pathParams: { uuidOrBarcode },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /shipments/delivery-notifications/{uuidOrBarcode}/form119/json`: by the uuid or barcode of the notification. */
  getForm119JsonByNotification(uuidOrBarcode: string, options: CallOptions = {}): Promise<Form119Pdf> {
    return this.ctx.http.request<Form119Pdf>({
      method: 'GET',
      path: '/shipments/delivery-notifications/{uuidOrBarcode}/form119/json',
      pathParams: { uuidOrBarcode },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /shipment-groups/{groupUuid}/form119/json`: for every shipment of a group. */
  getGroupForm119Json(groupUuid: string, options: CallOptions = {}): Promise<Form119Pdf[]> {
    return this.ctx.http.request<Form119Pdf[]>({
      method: 'GET',
      path: '/shipment-groups/{groupUuid}/form119/json',
      pathParams: { groupUuid },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }
}
