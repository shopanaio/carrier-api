import { CarrierError } from '@shopana/carrier-core';
import { createNovaPoshtaClient, createNovaPoshtaContext } from '../../src';
import { toHttpTransport } from '../../src/core/client';
import type { NovaPoshtaRequest } from '../../src/types/base';
import { createMockTransport } from '../mocks/transport';

const baseUrl = 'https://api.novaposhta.ua/v2.0/json/';
const request: NovaPoshtaRequest = {
  modelName: 'AddressGeneral',
  calledMethod: 'getWarehouses',
  methodProperties: {},
};
const envelope = (extra: object) => ({
  success: true,
  data: [],
  errors: [],
  warnings: [],
  info: [],
  messageCodes: [],
  errorCodes: [],
  warningCodes: [],
  infoCodes: [],
  ...extra,
});

describe('carrier-core transport adapter', () => {
  it('posts the JSON body to the base URL and returns the response as is', async () => {
    const { transport, calls, setResponse } = createMockTransport();
    const body = envelope({ data: [{ Ref: 'r' }] });
    setResponse(body);

    const ctx = createNovaPoshtaContext({ transport, apiKey: 'key', system: 'DevCentre' });
    const response = await toHttpTransport(ctx).request(request);

    expect(response).toEqual(body);
    expect(calls[0]?.url).toBe(baseUrl);
    expect(calls[0]?.request.method).toBe('POST');
    expect(calls[0]?.body).toEqual({ ...request, system: 'DevCentre' });
  });

  it('lets a request override apiKey and system', async () => {
    const { transport, calls } = createMockTransport();
    const ctx = createNovaPoshtaContext({ transport, apiKey: 'default', system: 'DevCentre' });

    await toHttpTransport(ctx).request({ ...request, apiKey: 'own' } as NovaPoshtaRequest);

    expect(calls[0]?.body.apiKey).toBe('own');
  });

  it('retries API-level rate limiting reported in a 200 body', async () => {
    const limited = envelope({ success: false, errorCodes: ['20000401501'] });
    const done = envelope({ data: [{ Ref: 'result-ref' }] });
    const responses = [limited, done];
    const calls: unknown[] = [];
    const transport = (async (req: unknown) => {
      calls.push(req);
      return { status: 200, headers: {}, data: responses[calls.length - 1] };
    }) as never;

    const ctx = createNovaPoshtaContext({ transport, retry: { maxRetries: 1, baseDelayMs: 0, jitter: 'none' } });
    const response = await toHttpTransport(ctx).request(request);

    expect(response).toEqual(done);
    expect(calls).toHaveLength(2);
  });

  it('throws CarrierError for a non-2xx response', async () => {
    const transport = (async () => ({ status: 500, headers: {}, data: { message: 'boom' } })) as never;
    const ctx = createNovaPoshtaContext({ transport, retry: false });

    await expect(toHttpTransport(ctx).request(request)).rejects.toBeInstanceOf(CarrierError);
  });

  it('createNovaPoshtaClient mounts every service', () => {
    const client = createNovaPoshtaClient({ apiKey: 'key' });

    expect(Object.keys(client).sort()).toEqual(
      ['address', 'contactPerson', 'counterparty', 'reference', 'tracking', 'use', 'waybill'].sort(),
    );
  });
});

describe('custom retry predicate', () => {
  it('runs next to the built-in rate-limit check', async () => {
    const shouldRetryResponse = jest.fn(
      (response: { data: unknown }) => (response.data as { info: string[] }).info[0] === 'again',
    );
    const responses = [
      envelope({ info: ['again'] }),
      envelope({ success: false, errorCodes: ['20000401501'] }),
      envelope({}),
    ];
    let n = 0;
    const transport = (async () => ({ status: 200, headers: {}, data: responses[n++] })) as never;

    const ctx = createNovaPoshtaContext({
      transport,
      retry: { maxRetries: 2, baseDelayMs: 0, jitter: 'none', shouldRetryResponse },
    });
    const response = await toHttpTransport(ctx).request(request);

    expect(n).toBe(3);
    expect(shouldRetryResponse).toHaveBeenCalled();
    expect(response).toEqual(responses[2]);
  });
});
