import type { ClientContext } from '../core/client';

export interface PrintDocumentRequest {
  readonly documentRef: string;
  readonly pageSize: 'A4' | '100x100';
}

/** Nova Poshta PDF routes. The binary transport enforces deployment-specific network policy. */
export class DocumentService {
  readonly namespace = 'documents' as const;
  private apiKey?: string;
  private downloadPdf?: (url: URL) => Promise<Uint8Array>;

  attach(ctx: ClientContext): void {
    this.apiKey = ctx.apiKey;
    this.downloadPdf = ctx.downloadPdf;
  }

  async printPdf(request: PrintDocumentRequest): Promise<Uint8Array> {
    if (!this.apiKey || !this.downloadPdf) throw new Error('DOCUMENT_TRANSPORT_REQUIRED');
    if (!request.documentRef || !['A4', '100x100'].includes(request.pageSize))
      throw new Error('DOCUMENT_REQUEST_INVALID');
    const method = request.pageSize === 'A4' ? 'printDocument' : 'printMarking100x100';
    const url = new URL(
      `https://my.novaposhta.ua/orders/${method}/orders[]/${encodeURIComponent(request.documentRef)}/type/pdf/apiKey/${encodeURIComponent(this.apiKey)}`,
    );
    return this.downloadPdf(url);
  }
}
