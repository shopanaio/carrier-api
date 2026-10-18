// code and comments in English
import { CarrierError, CarrierErrorCategory } from '@shopana/carrier-core';
import type { CallOptions } from '../types/common';
import type { BarcodeInfo } from '../types/reference';
import { BarcodesOperations } from '../generated/operations';
import { WITH_TOKEN } from './base';

export const BARCODES_MAX_PER_REQUEST = 100;

/** Barcode types (`/barcodes`): a shipment, a letter, a delivery notification or a document-back shipment. */
export class BarcodesService extends BarcodesOperations {
  readonly namespace = 'barcodes' as const;

  /** `GET /barcodes/{barcode}`. */
  get(barcode: string, options: CallOptions = {}): Promise<BarcodeInfo> {
    return this.ctx.http.request<BarcodeInfo>({
      method: 'GET',
      path: '/barcodes/{barcode}',
      pathParams: { barcode },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /barcodes/all-of/{a}&{b}&...`: up to 100 barcodes at once. */
  getMany(barcodes: string[], options: CallOptions = {}): Promise<BarcodeInfo[]> {
    if (barcodes.length === 0 || barcodes.length > BARCODES_MAX_PER_REQUEST) {
      throw new CarrierError({
        carrier: 'ukrposhta',
        code: 'INVALID_REQUEST',
        message: `Between 1 and ${BARCODES_MAX_PER_REQUEST} barcodes per request, got ${barcodes.length}`,
        category: CarrierErrorCategory.Validation,
      });
    }
    return this.ctx.http.request<BarcodeInfo[]>({
      method: 'GET',
      // The barcodes are joined with a literal `&`, so the path is built here rather than from `pathParams`.
      path: `/barcodes/all-of/${barcodes.map(encodeURIComponent).join('&')}`,
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }
}
