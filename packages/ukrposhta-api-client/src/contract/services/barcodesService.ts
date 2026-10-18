// code and comments in English
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

  /** `GET /barcodes/all-of/{a}&{b}&...`: the documentation allows up to `BARCODES_MAX_PER_REQUEST` barcodes. */
  getMany(barcodes: string[], options: CallOptions = {}): Promise<BarcodeInfo[]> {
    return this.ctx.http.request<BarcodeInfo[]>({
      method: 'GET',
      // The barcodes are joined with a literal `&`, so the path is built here rather than from `pathParams`.
      path: `/barcodes/all-of/${barcodes.map(encodeURIComponent).join('&')}`,
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }
}
