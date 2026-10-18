// code and comments in English
import type { CallOptions } from '../types/common';
import type { Bank } from '../types/reference';
import type { UkrposhtaContractContext } from './base';
import { WITHOUT_TOKEN } from './base';

/** Reference data (`/banks`, `/dictionaries/error-codes`). */
export class ReferenceService {
  readonly namespace = 'reference' as const;
  private ctx!: UkrposhtaContractContext;

  attach(ctx: UkrposhtaContractContext) {
    this.ctx = ctx;
  }

  /** `GET /banks`. */
  listBanks(options: CallOptions = {}): Promise<Bank[]> {
    return this.ctx.http.request<Bank[]>({
      method: 'GET',
      path: '/banks',
      meta: WITHOUT_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /banks/{code}`: a bank by its MFO code. */
  getBank(code: string, options: CallOptions = {}): Promise<Bank> {
    return this.ctx.http.request<Bank>({
      method: 'GET',
      path: '/banks/{code}',
      pathParams: { code },
      meta: WITHOUT_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /dictionaries/error-codes`: the carrier's own list of `UPE` codes. */
  listErrorCodes(options: CallOptions = {}): Promise<Record<string, unknown>> {
    return this.ctx.http.request<Record<string, unknown>>({
      method: 'GET',
      path: '/dictionaries/error-codes',
      meta: WITHOUT_TOKEN,
      signal: options.signal,
    });
  }
}
