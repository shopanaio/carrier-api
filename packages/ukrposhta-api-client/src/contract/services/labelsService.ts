// code and comments in English
import type { BinaryData } from '@shopana/carrier-core';
import type { CallOptions, StickerSize } from '../types/common';
import type { Form119eRequest, Form20eRequest, FormOption } from '../types/extra';
import { LabelsOperations } from '../generated/operations';
import type { UkrposhtaContractContext } from './base';
import { WITH_TOKEN } from './base';

/** What to leave off a sticker. */
export interface StickerHideOptions {
  hideDeliveryPrice?: boolean;
  hidePostpayDeliveryPrice?: boolean;
  hideWeight?: boolean;
}

export interface StickerOptions extends StickerHideOptions, CallOptions {
  /** 100 x 100 mm by default; `SIZE_A4` / `SIZE_A5` put the same sticker on a larger page. */
  size?: StickerSize;
}

export interface Form103aOptions extends CallOptions {
  /** Print the sender's name. */
  showSenderName?: boolean;
  /** Leave the declared price off the form. */
  hideDeclaredPrice?: boolean;
}

/** `page_10x10` for a thermal printer, `page_a4` for A4. */
export type Form119PageSize = 'page_10x10' | 'page_a4';
/** `shipment` for shipments, `letter` for domestic letters. */
export type Form119Dispatch = 'shipment' | 'letter';

const flag = (value: boolean | undefined) => (value === undefined ? undefined : value ? 1 : 0);

function hideQuery(options: StickerHideOptions) {
  return {
    hideDeliveryPrice: flag(options.hideDeliveryPrice),
    hidePostpayDeliveryPrice: flag(options.hidePostpayDeliveryPrice),
    hideWeight: flag(options.hideWeight),
  };
}

/**
 * Stickers and printed forms (`/forms/ecom/0.0.1`). Every method resolves with the file as `{ contentType, data }`
 * (a PDF; form 119e / 20e may come as a ZIP archive).
 */
export class LabelsService extends LabelsOperations {
  readonly namespace = 'labels' as const;

  /** `GET /shipments/{uuidOrBarcode}/sticker`. */
  getSticker(uuidOrBarcode: string, options: StickerOptions = {}): Promise<BinaryData> {
    return this.file({
      method: 'GET',
      path: '/shipments/{uuidOrBarcode}/sticker',
      pathParams: { uuidOrBarcode },
      query: { size: options.size, ...hideQuery(options) },
      signal: options.signal,
    });
  }

  /** `GET /shipments/sticker/parcel/{parcelBarcode}`: the sticker of one parcel of a multi-parcel shipment. */
  getParcelSticker(parcelBarcode: string, options: CallOptions = {}): Promise<BinaryData> {
    return this.file({
      method: 'GET',
      path: '/shipments/sticker/parcel/{parcelBarcode}',
      pathParams: { parcelBarcode },
      signal: options.signal,
    });
  }

  /**
   * `POST /shipments/stickers-by-barcodes`: one PDF for several shipments (uuid or barcode each). Per shipment
   * you can hide fields; the key is the uuid or barcode.
   */
  getStickers(
    shipments: string[] | Record<string, StickerHideOptions>,
    options: Pick<StickerOptions, 'size' | 'signal'> = {},
  ): Promise<BinaryData> {
    const entries = Array.isArray(shipments) ? shipments.map(id => [id, {}] as const) : Object.entries(shipments);
    const body: Record<string, Record<string, string>> = {};
    for (const [id, hide] of entries) {
      const fields: Record<string, string> = {};
      for (const [key, value] of Object.entries(hideQuery(hide))) if (value !== undefined) fields[key] = String(value);
      body[id] = fields;
    }
    return this.file({
      method: 'POST',
      path: '/shipments/stickers-by-barcodes',
      query: { size: options.size },
      json: body,
      // Printing changes nothing, so a repeat after a 5xx is safe.
      idempotent: true,
      signal: options.signal,
    });
  }

  /** `GET /shipment-groups/{groupUuid}/sticker`: stickers of every shipment of a group. */
  getGroupStickers(groupUuid: string, options: Pick<StickerOptions, 'size' | 'signal'> = {}): Promise<BinaryData> {
    return this.file({
      method: 'GET',
      path: '/shipment-groups/{groupUuid}/sticker',
      pathParams: { groupUuid },
      query: { size: options.size },
      signal: options.signal,
    });
  }

  /** `GET /shipment-groups/{groupUuid}/form103a`: the register of a group. Recommended from five shipments. */
  getForm103a(groupUuid: string, options: Form103aOptions = {}): Promise<BinaryData> {
    return this.file({
      method: 'GET',
      path: '/shipment-groups/{groupUuid}/form103a',
      pathParams: { groupUuid },
      query: { showSenderName: options.showSenderName, hideDeclaredPrice: flag(options.hideDeclaredPrice) },
      signal: options.signal,
    });
  }

  /** `GET /shipments/{uuidOrBarcode}/label`: the shipment label (form 103a of a single shipment). */
  getShipmentLabel(uuidOrBarcode: string, options: Pick<Form103aOptions, 'hideDeclaredPrice' | 'signal'> = {}) {
    return this.file({
      method: 'GET',
      path: '/shipments/{uuidOrBarcode}/label',
      pathParams: { uuidOrBarcode },
      query: { hideDeclaredPrice: flag(options.hideDeclaredPrice) },
      signal: options.signal,
    });
  }

  /** `GET /shipments/{uuidOrBarcode}/form119`: delivery notification form of a shipment. */
  getForm119(uuidOrBarcode: string, options: CallOptions = {}): Promise<BinaryData> {
    return this.file({
      method: 'GET',
      path: '/shipments/{uuidOrBarcode}/form119',
      pathParams: { uuidOrBarcode },
      signal: options.signal,
    });
  }

  /** `GET /shipment-groups/{groupUuid}/form119`. */
  getGroupForm119(groupUuid: string, options: CallOptions = {}): Promise<BinaryData> {
    return this.file({
      method: 'GET',
      path: '/shipment-groups/{groupUuid}/form119',
      pathParams: { groupUuid },
      signal: options.signal,
    });
  }

  /**
   * `POST /form2-service/sticker-form119`: the updated form 119 of one shipment or delivery notification.
   * `parent` is true when `barcode` is the primary shipment, false for the delivery notification.
   */
  getUpdatedForm119(
    params: { barcode: string; parent: boolean; pageSize: Form119PageSize; dispatch: Form119Dispatch },
    options: CallOptions = {},
  ): Promise<BinaryData> {
    return this.file({
      method: 'POST',
      path: '/form2-service/sticker-form119',
      query: {
        barcode: params.barcode,
        parent: params.parent,
        pagesize: params.pageSize,
        dispatch: params.dispatch,
      },
      idempotent: true,
      signal: options.signal,
    });
  }

  /** `POST /form2-service/sticker-form119-group`: the updated form 119 of a group (`barcode` is the group uuid). */
  getUpdatedGroupForm119(
    params: { groupUuid: string; pageSize: Form119PageSize; dispatch: Form119Dispatch; asPdf: boolean },
    options: CallOptions = {},
  ): Promise<BinaryData> {
    return this.file({
      method: 'POST',
      path: '/form2-service/sticker-form119-group',
      query: {
        asPdf: params.asPdf,
        barcode: params.groupUuid,
        pagesize: params.pageSize,
        dispatch: params.dispatch,
      },
      idempotent: true,
      signal: options.signal,
    });
  }

  /** `GET /shipments/delivery-notifications/{uuidOrBarcode}/form119`: form 119 by the uuid or barcode of the notification. */
  getNotificationForm119(uuidOrBarcode: string, options: CallOptions = {}): Promise<BinaryData> {
    return this.file({
      method: 'GET',
      path: '/shipments/delivery-notifications/{uuidOrBarcode}/form119',
      pathParams: { uuidOrBarcode },
      signal: options.signal,
    });
  }

  /** `GET /shipments/{uuidOrBarcode}/form107`: form 107 of a shipment. */
  getForm107(uuidOrBarcode: string, options: CallOptions = {}): Promise<BinaryData> {
    return this.file({
      method: 'GET',
      path: '/shipments/{uuidOrBarcode}/form107',
      pathParams: { uuidOrBarcode },
      signal: options.signal,
    });
  }

  /** `GET /shipment-groups/{shipmentGroupUuid}/form107`: form 107 of a group. */
  getGroupForm107(shipmentGroupUuid: string, options: CallOptions = {}): Promise<BinaryData> {
    return this.file({
      method: 'GET',
      path: '/shipment-groups/{shipmentGroupUuid}/form107',
      pathParams: { shipmentGroupUuid },
      signal: options.signal,
    });
  }

  /** `GET /document-back/{uuidOrBarcode}/sticker`: sticker of the return shipment of documents. */
  getDocumentBackSticker(uuidOrBarcode: string, options: CallOptions = {}): Promise<BinaryData> {
    return this.file({
      method: 'GET',
      path: '/document-back/{uuidOrBarcode}/sticker',
      pathParams: { uuidOrBarcode },
      signal: options.signal,
    });
  }

  /** `GET /document-back/by/shipment/{uuidOrBarcode}/sticker`: the same, by the direct shipment. */
  getDocumentBackStickerByShipment(uuidOrBarcode: string, options: CallOptions = {}): Promise<BinaryData> {
    return this.file({
      method: 'GET',
      path: '/document-back/by/shipment/{uuidOrBarcode}/sticker',
      pathParams: { uuidOrBarcode },
      signal: options.signal,
    });
  }

  /** `GET /shipment-groups/{shipmentGroupUuid}/document-back/sticker`: return stickers of a group. */
  getGroupDocumentBackStickers(shipmentGroupUuid: string, options: CallOptions = {}): Promise<BinaryData> {
    return this.file({
      method: 'GET',
      path: '/shipment-groups/{shipmentGroupUuid}/document-back/sticker',
      pathParams: { shipmentGroupUuid },
      signal: options.signal,
    });
  }

  /** `GET /shipments/{uuidOrBarcode}/with-document-back/sticker`: direct and return sticker, by the direct shipment. */
  getWithDocumentBackSticker(uuidOrBarcode: string, options: CallOptions = {}): Promise<BinaryData> {
    return this.file({
      method: 'GET',
      path: '/shipments/{uuidOrBarcode}/with-document-back/sticker',
      pathParams: { uuidOrBarcode },
      signal: options.signal,
    });
  }

  /** `GET /document-back/{uuidOrBarcode}/with-shipment/sticker`: direct and return sticker, by the return shipment. */
  getWithShipmentSticker(uuidOrBarcode: string, options: CallOptions = {}): Promise<BinaryData> {
    return this.file({
      method: 'GET',
      path: '/document-back/{uuidOrBarcode}/with-shipment/sticker',
      pathParams: { uuidOrBarcode },
      signal: options.signal,
    });
  }

  /** `GET /shipment-groups/{uuid}/shipment-with-document-back/sticker`: direct and return stickers of a group. */
  getGroupWithDocumentBackStickers(uuid: string, options: CallOptions = {}): Promise<BinaryData> {
    return this.file({
      method: 'GET',
      path: '/shipment-groups/{uuid}/shipment-with-document-back/sticker',
      pathParams: { uuid },
      signal: options.signal,
    });
  }

  /** `POST /shipments/form119e`: form 119e of a shipment with an electronic delivery notification (PDF or ZIP). */
  getForm119e(request: Form119eRequest, frmOption: FormOption, options: CallOptions = {}): Promise<BinaryData> {
    return this.postForm('/shipments/form119e', request, frmOption, options);
  }

  /** `POST /shipments/form20e`: form 20e, the reason a shipment was not delivered (PDF or ZIP). */
  getForm20e(request: Form20eRequest, frmOption: FormOption, options: CallOptions = {}): Promise<BinaryData> {
    return this.postForm('/shipments/form20e', request, frmOption, options);
  }

  private postForm(path: string, body: object, frmOption: FormOption, options: CallOptions): Promise<BinaryData> {
    return this.file({
      method: 'POST',
      path,
      query: { frmOption },
      json: body,
      idempotent: true,
      signal: options.signal,
    });
  }

  /** `GET /international/shipments/{uuidOrBarcode}/sticker`: sticker of an international shipment. */
  getInternationalSticker(
    uuidOrBarcode: string,
    options: { size?: StickerSize } & CallOptions = {},
  ): Promise<BinaryData> {
    return this.file({
      method: 'GET',
      path: '/international/shipments/{uuidOrBarcode}/sticker',
      pathParams: { uuidOrBarcode },
      query: { size: options.size },
      signal: options.signal,
    });
  }

  /** `GET /shipment-groups/{uuid}/forms`: every form the shipments of an international group need. */
  getGroupInternationalForms(uuid: string, options: { size?: StickerSize } & CallOptions = {}): Promise<BinaryData> {
    return this.groupForm(uuid, 'forms', options);
  }

  /** `GET /shipment-groups/{uuid}/cn22`: form CN22 of every shipment of an international group. */
  getGroupCn22(uuid: string, options: { size?: StickerSize } & CallOptions = {}): Promise<BinaryData> {
    return this.groupForm(uuid, 'cn22', options);
  }

  /** `GET /shipment-groups/{uuid}/cn23`: form CN23 of every shipment of an international group. */
  getGroupCn23(uuid: string, options: { size?: StickerSize } & CallOptions = {}): Promise<BinaryData> {
    return this.groupForm(uuid, 'cn23', options);
  }

  /** `GET /shipment-groups/{uuid}/dl`: form DL of every shipment of an international group. */
  getGroupDl(uuid: string, options: { size?: StickerSize } & CallOptions = {}): Promise<BinaryData> {
    return this.groupForm(uuid, 'dl', options);
  }

  /** `GET /shipment-groups/{uuid}/c6`: form C6 of every shipment of an international group. */
  getGroupC6(uuid: string, options: { size?: StickerSize } & CallOptions = {}): Promise<BinaryData> {
    return this.groupForm(uuid, 'c6', options);
  }

  private groupForm(
    uuid: string,
    form: 'forms' | 'cn22' | 'cn23' | 'dl' | 'c6',
    options: { size?: StickerSize } & CallOptions,
  ): Promise<BinaryData> {
    return this.file({
      method: 'GET',
      path: `/shipment-groups/{uuid}/${form}`,
      pathParams: { uuid },
      query: { size: options.size },
      signal: options.signal,
    });
  }

  private file(request: Parameters<UkrposhtaContractContext['forms']['request']>[0]): Promise<BinaryData> {
    return this.ctx.forms.request<BinaryData>({ ...request, responseType: 'binary', meta: WITH_TOKEN });
  }
}
