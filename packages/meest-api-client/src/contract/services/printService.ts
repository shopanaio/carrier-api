// code and comments in English
import type { BinaryData } from '@shopana/carrier-core';
import { ContractService, encodeIds } from './base';
import type { RequestOptions } from './base';

export type PrintFormat = 'pdf' | 'html';

type Ids = string | readonly string[];

export interface Sticker100Options extends RequestOptions {
  /** Contract id; required when printing by `parcelNumber` or `barCode`, optional by `parcelID`. */
  agent?: string;
  /** Page to print; all pages when omitted. */
  page?: number;
}

export interface Sticker100A4Options extends RequestOptions {
  /** Start position on the A4 sheet (up to 6 stickers). Default 1. */
  position?: number;
}

/** Print forms. `pdf` resolves to bytes, `html` to markup. */
export class PrintService extends ContractService {
  readonly namespace = 'print' as const;

  /**
   * Cargo declaration (`/print/declarationForm`). Meest requires the phone number of the sender or recipient
   * of the parcel next to its id.
   */
  declaration(ids: Ids, phone: string, format: 'pdf', options?: RequestOptions): Promise<BinaryData>;
  declaration(ids: Ids, phone: string, format: 'html', options?: RequestOptions): Promise<string>;
  declaration(
    ids: Ids,
    phone: string,
    format: PrintFormat,
    options: RequestOptions = {},
  ): Promise<BinaryData | string> {
    return this.httpGet({
      signal: options.signal,
      path: `/print/declarationForm/${encodeIds(ids)}/${encodeURIComponent(phone)}/{contentType}`,
      pathParams: { contentType: format },
      responseType: format === 'pdf' ? 'binary' : 'text',
    });
  }

  /** Customs form CN23 as PDF (`/print/cn23Form`); needs the phone number like `declaration`. */
  cn23(ids: Ids, phone: string, options: RequestOptions = {}): Promise<BinaryData> {
    return this.httpGet({
      signal: options.signal,
      path: `/print/cn23Form/${encodeIds(ids)}/${encodeURIComponent(phone)}`,
      responseType: 'binary',
    });
  }

  /** Register of parcels (receipt for a hand-over). */
  register(ids: Ids, format: 'pdf', options?: RequestOptions): Promise<BinaryData>;
  register(ids: Ids, format: 'html', options?: RequestOptions): Promise<string>;
  register(ids: Ids, format: PrintFormat, options: RequestOptions = {}): Promise<BinaryData | string> {
    return this.httpGet({
      signal: options.signal,
      path: `/print/register/${encodeIds(ids)}/{contentType}`,
      pathParams: { contentType: format },
      responseType: format === 'pdf' ? 'binary' : 'text',
    });
  }

  /**
   * Sticker 100x100 mm (PDF). Print by `parcelID`, or by `parcelNumber`/`barCode` together with `agent`
   * (the contract id). Without `page` all pages are returned.
   */
  sticker100(ids: Ids, options: Sticker100Options = {}): Promise<BinaryData> {
    return this.httpGet({
      signal: options.signal,
      path: `/print/sticker100/${encodeIds(ids)}`,
      query: { agent: options.agent, page: options.page },
      responseType: 'binary',
    });
  }

  /** Up to 6 stickers 100x100 on an A4 sheet, starting at `position` (default 1). */
  sticker100A4(ids: Ids, options: Sticker100A4Options = {}): Promise<BinaryData> {
    return this.httpGet({
      signal: options.signal,
      path: `/print/sticker100A4/${encodeIds(ids)}`,
      query: { position: options.position ?? 1 },
      responseType: 'binary',
    });
  }
}
