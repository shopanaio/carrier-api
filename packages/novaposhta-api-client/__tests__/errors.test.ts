import {
  ErrorCategory,
  ErrorSeverity,
  NovaPoshtaErrorCode,
  categorizeError,
  getErrorInfo,
  getErrorSeverity,
} from '../src/types/errors';

describe('Nova Poshta postomat errors', () => {
  it('maps a sender postomat availability response to a non-retryable business rule', () => {
    const info = getErrorInfo(NovaPoshtaErrorCode.SendingFromPostomatUnavailable);

    expect(NovaPoshtaErrorCode.SendingFromPostomatUnavailable).toBe('20000204037');
    expect(info).toEqual({
      en: 'The selected sender postomat or request configuration is unavailable; verify the postomat, payment method, and seat fields',
      ua: 'Обраний поштомат відправника або конфігурація запиту недоступні; перевірте поштомат, спосіб оплати та параметри місць',
      ru: 'Выбранный почтомат отправителя или конфигурация запроса недоступны; проверьте почтомат, способ оплаты и параметры мест',
      category: ErrorCategory.BusinessLogic,
      severity: ErrorSeverity.Medium,
      retryable: false,
    });
    expect(categorizeError(NovaPoshtaErrorCode.SendingFromPostomatUnavailable)).toBe(ErrorCategory.BusinessLogic);
    expect(getErrorSeverity(NovaPoshtaErrorCode.SendingFromPostomatUnavailable)).toBe(ErrorSeverity.Medium);
  });
});
