// code and comments in English
import type { CallOptions } from '../types/common';
import type {
  InternationalParcelTariff,
  InternationalWrapperTariff,
  LetterPriority,
  LetterSurchargeTariff,
  LetterTariff,
} from '../types/extra';
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

  /** `GET /dictionaries/letter-tariffs`, optionally for one priority and weight (grams). */
  listLetterTariffs(
    filter: { priority?: LetterPriority; weight?: number } = {},
    options: CallOptions = {},
  ): Promise<LetterTariff[]> {
    return this.ctx.http.request<LetterTariff[]>({
      method: 'GET',
      path: '/dictionaries/letter-tariffs',
      query: { priority: filter.priority, weight: filter.weight },
      meta: WITHOUT_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /dictionaries/letter-tariffs/{uuid}`. */
  getLetterTariff(uuid: string, options: CallOptions = {}): Promise<LetterTariff> {
    return this.ctx.http.request<LetterTariff>({
      method: 'GET',
      path: '/dictionaries/letter-tariffs/{uuid}',
      pathParams: { uuid },
      meta: WITHOUT_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /dictionaries/letter-surcharge-tariffs`: tariffs of the additional services of letters. */
  listLetterSurchargeTariffs(options: CallOptions = {}): Promise<LetterSurchargeTariff[]> {
    return this.ctx.http.request<LetterSurchargeTariff[]>({
      method: 'GET',
      path: '/dictionaries/letter-surcharge-tariffs',
      meta: WITHOUT_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /dictionaries/tariffs/international/parcel`. */
  listInternationalParcelTariffs(options: CallOptions = {}): Promise<InternationalParcelTariff[]> {
    return this.ctx.http.request<InternationalParcelTariff[]>({
      method: 'GET',
      path: '/dictionaries/tariffs/international/parcel',
      meta: WITHOUT_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /dictionaries/tariffs/international/parcel/{id}`. */
  getInternationalParcelTariff(id: number | string, options: CallOptions = {}): Promise<InternationalParcelTariff> {
    return this.ctx.http.request<InternationalParcelTariff>({
      method: 'GET',
      path: '/dictionaries/tariffs/international/parcel/{id}',
      pathParams: { id },
      meta: WITHOUT_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /dictionaries/tariffs/international/wrapper`: tariffs of letters and small bags. */
  listInternationalWrapperTariffs(options: CallOptions = {}): Promise<InternationalWrapperTariff[]> {
    return this.ctx.http.request<InternationalWrapperTariff[]>({
      method: 'GET',
      path: '/dictionaries/tariffs/international/wrapper',
      meta: WITHOUT_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /dictionaries/tariffs/international/wrapper/{id}`. */
  getInternationalWrapperTariff(id: number | string, options: CallOptions = {}): Promise<InternationalWrapperTariff> {
    return this.ctx.http.request<InternationalWrapperTariff>({
      method: 'GET',
      path: '/dictionaries/tariffs/international/wrapper/{id}',
      pathParams: { id },
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
