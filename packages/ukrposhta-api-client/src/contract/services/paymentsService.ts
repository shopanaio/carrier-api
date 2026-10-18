// code and comments in English
import type { CallOptions } from '../types/common';
import type {
  EstampCashlessPaymentRequest,
  EstampPaymentRequest,
  InternationalEstampPaymentRequest,
  LetterGroupPaymentRequest,
  PaymentBalance,
} from '../types/extra';
import type { UkrposhtaContractContext } from './base';
import { WITH_TOKEN } from './base';

/**
 * Payment of letters with an electronic stamp. Create the letters with `paymentType: 'DIGITAL_POSTAGE_STAMP'`,
 * then pay: after the payment the letters can no longer be edited.
 */
export class PaymentsService {
  readonly namespace = 'payments' as const;
  private ctx!: UkrposhtaContractContext;

  attach(ctx: UkrposhtaContractContext) {
    this.ctx = ctx;
  }

  /** `POST /payments/payments-bank-account/payment`: pays letters; `amount` is the sum with VAT. */
  pay(request: EstampPaymentRequest, options: CallOptions = {}): Promise<PaymentBalance> {
    return this.send('POST', '/payments/payments-bank-account/payment', request, options);
  }

  /** `POST /payments/payments-bank-account/by-letter-group`: pays every letter of a group. */
  payLetterGroup(request: LetterGroupPaymentRequest, options: CallOptions = {}): Promise<PaymentBalance> {
    return this.send('POST', '/payments/payments-bank-account/by-letter-group', request, options);
  }

  /** `PUT /payments/letters/estamp/paid-cashless`: pays letters by bank transfer. */
  payCashless(request: EstampCashlessPaymentRequest, options: CallOptions = {}): Promise<PaymentBalance> {
    return this.send('PUT', '/payments/letters/estamp/paid-cashless', request, options);
  }

  /** `POST /payments-bank-account/payment-international`: pays international letters. */
  payInternational(request: InternationalEstampPaymentRequest, options: CallOptions = {}): Promise<PaymentBalance> {
    return this.send('POST', '/payments-bank-account/payment-international', request, options);
  }

  private send(method: 'POST' | 'PUT', path: string, body: object, options: CallOptions): Promise<PaymentBalance> {
    return this.ctx.http.request<PaymentBalance>({
      method,
      path,
      json: body,
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }
}
