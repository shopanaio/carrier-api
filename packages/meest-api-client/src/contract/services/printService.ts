// code and comments in English
import type { BinaryData } from '@shopana/carrier-core';
import { ContractService, encodeIds } from './base';

export type PrintFormat = 'pdf' | 'html';

type Ids = string | readonly string[];

/** Print forms. `pdf` resolves to bytes, `html` to markup. */
export class PrintService extends ContractService {
  readonly namespace = 'print' as const;

  declaration(ids: Ids, format: 'pdf'): Promise<BinaryData>;
  declaration(ids: Ids, format: 'html'): Promise<string>;
  declaration(ids: Ids, format: PrintFormat): Promise<BinaryData | string> {
    return this.form('/print/declaration/{printValue}/{contentType}', ids, format);
  }

  cn23(ids: Ids, format: 'pdf'): Promise<BinaryData>;
  cn23(ids: Ids, format: 'html'): Promise<string>;
  cn23(ids: Ids, format: PrintFormat): Promise<BinaryData | string> {
    return this.form('/print/cn23/{printValue}/{contentType}', ids, format);
  }

  /** Register of parcels (receipt for a hand-over). */
  register(ids: Ids, format: 'pdf'): Promise<BinaryData>;
  register(ids: Ids, format: 'html'): Promise<string>;
  register(ids: Ids, format: PrintFormat): Promise<BinaryData | string> {
    return this.form('/print/register/{printValue}/{contentType}', ids, format);
  }

  /**
   * Sticker 100x100 mm (PDF). Print by `parcelID`, or by `parcelNumber`/`barCode` together with `agent`
   * (the contract id). Without `page` all pages are returned.
   */
  sticker100(ids: Ids, options: { agent?: string; page?: number } = {}): Promise<BinaryData> {
    return this.httpGet({
      path: `/print/sticker100/${encodeIds(ids)}`,
      query: { agent: options.agent, page: options.page },
      responseType: 'binary',
    });
  }

  /** Up to 6 stickers 100x100 on an A4 sheet, starting at `position` (default 1). */
  sticker100A4(ids: Ids, options: { position?: number } = {}): Promise<BinaryData> {
    return this.httpGet({
      path: `/print/sticker100A4/${encodeIds(ids)}`,
      query: { position: options.position ?? 1 },
      responseType: 'binary',
    });
  }

  private form(path: string, ids: Ids, format: PrintFormat): Promise<BinaryData | string> {
    return this.httpGet({
      path: path.replace('{printValue}', encodeIds(ids)),
      pathParams: { contentType: format },
      responseType: format === 'pdf' ? 'binary' : 'text',
    });
  }
}
