import { toHttpTransport, type ClientContext } from '../../src/core/client';
import type { NovaPoshtaRequest, NovaPoshtaResponse } from '../../src/types/base';

describe('HTTP transport adapter', () => {
  const request: NovaPoshtaRequest = {
    modelName: 'AddressGeneral',
    calledMethod: 'getWarehouses',
    methodProperties: {},
  };

  it('retries Nova Poshta API rate-limit responses', async () => {
    const rateLimited: NovaPoshtaResponse<never[]> = {
      success: false,
      data: [],
      errors: ['Too many requests'],
      warnings: [],
      info: [],
      messageCodes: [],
      errorCodes: ['20000401501'],
      warningCodes: [],
      infoCodes: [],
    };
    const success: NovaPoshtaResponse<readonly [{ Ref: string }]> = {
      success: true,
      data: [{ Ref: 'result-ref' }],
      errors: [],
      warnings: [],
      info: [],
      messageCodes: [],
      errorCodes: [],
      warningCodes: [],
      infoCodes: [],
    };
    const transport = jest.fn().mockResolvedValueOnce({ status: 200, data: rateLimited }).mockResolvedValueOnce({
      status: 200,
      data: success,
    });
    const context: ClientContext = {
      transport,
      baseUrl: 'https://api.novaposhta.ua/v2.0/json/',
      rateLimitRetry: { maxRetries: 1, delayMs: 0 },
    };
    const response = await toHttpTransport(context).request(request);

    expect(response).toEqual(success);
    expect(transport).toHaveBeenCalledTimes(2);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, -1, 1.5])(
    'rejects invalid maxRetries value %s',
    maxRetries => {
      const context: ClientContext = {
        transport: jest.fn(),
        baseUrl: 'https://api.novaposhta.ua/v2.0/json/',
        rateLimitRetry: { maxRetries },
      };

      expect(() => toHttpTransport(context)).toThrow(
        'rateLimitRetry.maxRetries must be a finite non-negative integer',
      );
    },
  );

  it.each([Number.NaN, Number.NEGATIVE_INFINITY, -1, 0.5])('rejects invalid delayMs value %s', delayMs => {
    const context: ClientContext = {
      transport: jest.fn(),
      baseUrl: 'https://api.novaposhta.ua/v2.0/json/',
      rateLimitRetry: { delayMs },
    };

    expect(() => toHttpTransport(context)).toThrow(
      'rateLimitRetry.delayMs must be a finite non-negative integer',
    );
  });
});
