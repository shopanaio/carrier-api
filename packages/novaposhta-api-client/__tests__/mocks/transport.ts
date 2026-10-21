import type { HttpRequest, HttpResponse, HttpTransport } from '@shopana/carrier-core';

export interface MockTransportCall {
  url: string;
  body: any;
  request: HttpRequest;
}

export function createMockTransport(mockResponse?: any): {
  transport: HttpTransport;
  calls: MockTransportCall[];
  setResponse: (response: any) => void;
} {
  const calls: MockTransportCall[] = [];
  let response = mockResponse || { success: true, data: [] };

  const transport = (async (request: HttpRequest): Promise<HttpResponse<unknown>> => {
    calls.push({ url: request.url, body: request.body?.kind === 'json' ? request.body.value : undefined, request });
    return { status: 200, headers: {}, data: response };
  }) as HttpTransport;

  return {
    transport,
    calls,
    setResponse: (newResponse: any) => {
      response = newResponse;
    },
  };
}
