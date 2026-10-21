// code and comments in English
import type { CallOptions } from '../types/common';
import type { PostPayTransfer } from '../types/reference';
import type { UkrposhtaContractContext } from './base';
import { WITHOUT_TOKEN } from './base';

/** Cash-on-delivery (postpay) transfers (`/transfers`). */
export class TransfersService {
  readonly namespace = 'transfers' as const;
  private ctx!: UkrposhtaContractContext;

  attach(ctx: UkrposhtaContractContext) {
    this.ctx = ctx;
  }

  /** `GET /transfers/shipment-postpays/{barcode}/with-recipient`: where the cash on delivery of a shipment is. */
  getPostPayStatus(barcode: string, options: CallOptions = {}): Promise<PostPayTransfer> {
    return this.ctx.http.request<PostPayTransfer>({
      method: 'GET',
      path: '/transfers/shipment-postpays/{barcode}/with-recipient',
      pathParams: { barcode },
      meta: WITHOUT_TOKEN,
      signal: options.signal,
    });
  }
}
