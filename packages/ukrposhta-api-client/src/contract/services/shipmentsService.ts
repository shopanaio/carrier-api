// code and comments in English
import type { CallOptions } from '../types/common';
import type {
  ParcelInput,
  Shipment,
  ShipmentField,
  ShipmentInput,
  ShipmentLifecycleInfo,
  ShipmentPatch,
} from '../types/shipment';
import type { UkrposhtaContractContext } from './base';
import { WITH_TOKEN } from './base';

/** Shipments (`/shipments`). */
export class ShipmentsService {
  readonly namespace = 'shipments' as const;
  private ctx!: UkrposhtaContractContext;

  attach(ctx: UkrposhtaContractContext) {
    this.ctx = ctx;
  }

  /**
   * `POST /shipments`. The price is calculated on creation and returned as `deliveryPrice`.
   * Not repeated automatically after a 5xx or a lost connection: the carrier may have created the shipment.
   */
  create(shipment: ShipmentInput, options?: CallOptions): Promise<Shipment>;
  /** `POST /shipments` with an array: several shipments in one request. */
  create(shipments: ShipmentInput[], options?: CallOptions): Promise<Shipment[]>;
  create(body: ShipmentInput | ShipmentInput[], options: CallOptions = {}): Promise<Shipment | Shipment[]> {
    return this.ctx.http.request({
      method: 'POST',
      path: '/shipments',
      json: body,
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `PUT /shipments/{uuid}`. A parcel to change is addressed by its `uuid` or `barcode`; to add one use `addParcel`. */
  update(uuid: string, patch: ShipmentPatch, options: CallOptions = {}): Promise<Shipment> {
    return this.ctx.http.request<Shipment>({
      method: 'PUT',
      path: '/shipments/{uuid}',
      pathParams: { uuid },
      json: patch,
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `PUT /shipments` with an array of patches, each carrying its shipment `uuid`. */
  updateMany(patches: Array<ShipmentPatch & { uuid: string }>, options: CallOptions = {}): Promise<Shipment[]> {
    return this.ctx.http.request<Shipment[]>({
      method: 'PUT',
      path: '/shipments',
      json: patches,
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /shipments/{uuid}`. */
  get(uuid: string, options: CallOptions = {}): Promise<Shipment> {
    return this.ctx.http.request<Shipment>({
      method: 'GET',
      path: '/shipments/{uuid}',
      pathParams: { uuid },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /shipments/barcode/{barcode}`: the barcode of any parcel of the shipment works. */
  getByBarcode(barcode: string, options: CallOptions = {}): Promise<Shipment> {
    return this.ctx.http.request<Shipment>({
      method: 'GET',
      path: '/shipments/barcode/{barcode}',
      pathParams: { barcode },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `POST /shipments/{uuidOrBarcode}` with a field list: reads only the named fields. */
  getFields<K extends ShipmentField>(
    uuidOrBarcode: string,
    fields: K[],
    options: CallOptions = {},
  ): Promise<Pick<Shipment, K>> {
    return this.ctx.http.request<Pick<Shipment, K>>({
      method: 'POST',
      path: '/shipments/{uuidOrBarcode}',
      pathParams: { uuidOrBarcode },
      json: fields,
      idempotent: true,
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /shipments/{uuidOrBarcode}/lifecycle`: the delivery status. */
  getLifecycle(uuidOrBarcode: string, options: CallOptions = {}): Promise<ShipmentLifecycleInfo> {
    return this.ctx.http.request<ShipmentLifecycleInfo>({
      method: 'GET',
      path: '/shipments/{uuidOrBarcode}/lifecycle',
      pathParams: { uuidOrBarcode },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /shipments/barcode/{barcode}/isPriceChangedInPostOffice`: whether the post office corrected the price. */
  async isPriceChangedInPostOffice(barcode: string, options: CallOptions = {}): Promise<boolean> {
    const answer = await this.ctx.http.request<{ message: string }>({
      method: 'GET',
      path: '/shipments/barcode/{barcode}/isPriceChangedInPostOffice',
      pathParams: { barcode },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
    return /true/i.test(answer.message);
  }

  /** Shipments of a sender whose price changed in a post office within `[from, to]` (`YYYY-MM-DD`): barcodes or uuids. */
  listPriceChanged(
    senderUuid: string,
    range: { from: string; to: string; barcodes?: boolean },
    options: CallOptions = {},
  ): Promise<string[]> {
    return this.ctx.http.request<string[]>({
      method: 'GET',
      path: '/shipments/sender/{senderUuid}/from/{from}/to/{to}/isPriceChangedInPostOffice',
      pathParams: { senderUuid, from: range.from, to: range.to },
      query: { barcodes: range.barcodes ?? false },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `DELETE /shipments/{uuidOrBarcode}`. Allowed only while the shipment is `CREATED` (not yet registered). */
  async delete(uuidOrBarcode: string, options: CallOptions = {}): Promise<void> {
    await this.ctx.http.request({
      method: 'DELETE',
      path: '/shipments/{uuidOrBarcode}',
      pathParams: { uuidOrBarcode },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `POST /shipments/{uuidOrBarcode}/parcels`: adds a parcel to a multi-parcel shipment. */
  addParcel(uuidOrBarcode: string, parcel: ParcelInput, options: CallOptions = {}): Promise<Shipment> {
    return this.ctx.http.request<Shipment>({
      method: 'POST',
      path: '/shipments/{uuidOrBarcode}/parcels',
      pathParams: { uuidOrBarcode },
      json: parcel,
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `DELETE /shipments/{uuid}/parcels/{barcode}`: returns the shipment without the parcel. */
  deleteParcel(shipmentUuid: string, parcelBarcode: string, options: CallOptions = {}): Promise<Shipment> {
    return this.ctx.http.request<Shipment>({
      method: 'DELETE',
      path: '/shipments/{shipmentUuid}/parcels/{parcelBarcode}',
      pathParams: { shipmentUuid, parcelBarcode },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }
}
