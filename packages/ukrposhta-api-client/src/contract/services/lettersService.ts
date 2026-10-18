// code and comments in English
import type { BinaryData } from '@shopana/carrier-core';
import { LettersOperations } from '../generated/operations';
import type { LetterDto } from '../generated/types';
import type { CallOptions } from '../types/common';
import type { Form119eRequest, Form20eRequest, FormOption } from '../types/extra';
import { WITH_TOKEN } from './base';

/**
 * Domestic letters (`/letters/domestic`, letters documentation of 07.10.2026): every operation of the snapshot plus
 * the ones only the documentation lists.
 */
export class LettersService extends LettersOperations {
  /** `POST /letters/domestic/groups/{letterGroupUuid}/letters/async`: creates several letters in a group. */
  createInGroupAsync(letterGroupUuid: string, letters: LetterDto[], options: CallOptions = {}): Promise<unknown> {
    return this.ctx.http.request({
      method: 'POST',
      path: '/letters/domestic/groups/{letterGroupUuid}/letters/async',
      pathParams: { letterGroupUuid },
      json: letters,
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `PUT /letters/domestic/management/{letterUuidOrBarcode}/recipient/{newClientUuid}`: another recipient. */
  changeRecipient(letterUuidOrBarcode: string, newClientUuid: string, options: CallOptions = {}): Promise<LetterDto> {
    return this.ctx.http.request<LetterDto>({
      method: 'PUT',
      path: '/letters/domestic/management/{letterUuidOrBarcode}/recipient/{newClientUuid}',
      pathParams: { letterUuidOrBarcode, newClientUuid },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /letters/domestic/{uuidOrBarcode}/form107`: form 107, the list of enclosed items of a valuable letter. */
  getForm107(uuidOrBarcode: string, options: CallOptions = {}): Promise<BinaryData> {
    return this.ctx.forms.request<BinaryData>({
      method: 'GET',
      path: '/letters/domestic/{uuidOrBarcode}/form107',
      pathParams: { uuidOrBarcode },
      responseType: 'binary',
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `PUT /letters/domestic/{letterUuid}/forward/{addressId}`: changes the recipient's address. */
  forward(letterUuid: string, addressId: number | string, options: CallOptions = {}): Promise<LetterDto> {
    return this.ctx.http.request<LetterDto>({
      method: 'PUT',
      path: '/letters/domestic/{letterUuid}/forward/{addressId}',
      pathParams: { letterUuid, addressId },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `PUT /letters/domestic/{uuidOrBarcode}/return-after-storage-days/{days}`: the storage period. */
  setReturnAfterStorageDays(uuidOrBarcode: string, days: number, options: CallOptions = {}): Promise<LetterDto> {
    return this.ctx.http.request<LetterDto>({
      method: 'PUT',
      path: '/letters/domestic/{uuidOrBarcode}/return-after-storage-days/{days}',
      pathParams: { uuidOrBarcode, days },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `PUT /letters/domestic/{uuidOrBarcode}/sms/{enabled}`: turns the SMS notification on or off. */
  setSms(uuidOrBarcode: string, enabled: boolean, options: CallOptions = {}): Promise<LetterDto> {
    return this.ctx.http.request<LetterDto>({
      method: 'PUT',
      path: '/letters/domestic/{uuidOrBarcode}/sms/{enabled}',
      pathParams: { uuidOrBarcode, enabled },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `POST /letters/domestic/form119e`: form 119e of a letter with an electronic delivery notification (PDF or ZIP). */
  getForm119e(request: Form119eRequest, frmOption: FormOption, options: CallOptions = {}): Promise<BinaryData> {
    return this.postForm('/letters/domestic/form119e', request, frmOption, options);
  }

  /** `POST /letters/domestic/form20e`: form 20e, the reason a letter was not delivered (PDF or ZIP). */
  getForm20e(request: Form20eRequest, frmOption: FormOption, options: CallOptions = {}): Promise<BinaryData> {
    return this.postForm('/letters/domestic/form20e', request, frmOption, options);
  }

  private postForm(path: string, body: object, frmOption: FormOption, options: CallOptions): Promise<BinaryData> {
    return this.ctx.forms.request<BinaryData>({
      method: 'POST',
      path,
      query: { frmOption },
      json: body,
      responseType: 'binary',
      idempotent: true,
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }
}
