import {
  ErrorCategory,
  ErrorSeverity,
  NovaPoshtaErrorCode,
  categorizeError,
  getErrorInfo,
  getErrorSeverity,
} from '../src/types/errors';

describe('Nova Poshta postomat errors', () => {
  it('maps the unsupported sender postomat response to a non-retryable business rule', () => {
    const info = getErrorInfo(NovaPoshtaErrorCode.SendingFromPostomatUnavailable);

    expect(NovaPoshtaErrorCode.SendingFromPostomatUnavailable).toBe('20000204037');
    expect(info).toEqual({
      en: 'Sending from a postomat is available only in the Nova Poshta mobile application',
      ua: 'Відправка з поштомату доступна лише з мобільного додатку Nova Poshta',
      ru: 'Отправка из почтомата доступна только в мобильном приложении Nova Poshta',
      category: ErrorCategory.BusinessLogic,
      severity: ErrorSeverity.Medium,
      retryable: false,
    });
    expect(categorizeError(NovaPoshtaErrorCode.SendingFromPostomatUnavailable)).toBe(ErrorCategory.BusinessLogic);
    expect(getErrorSeverity(NovaPoshtaErrorCode.SendingFromPostomatUnavailable)).toBe(ErrorSeverity.Medium);
  });
});
