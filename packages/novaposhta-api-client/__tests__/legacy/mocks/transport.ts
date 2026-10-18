import type { HttpPostJsonTransport } from '../../../src/core/client';

export interface MockTransportCall {
  url: string;
  body: any;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

export function createMockTransport(mockResponse?: any): {
  transport: HttpPostJsonTransport;
  calls: MockTransportCall[];
  setResponse: (response: any) => void;
} {
  const calls: MockTransportCall[] = [];
  let response = mockResponse || { success: true, data: [] };

  const transport: HttpPostJsonTransport = async args => {
    calls.push({ ...args });
    return {
      status: 200,
      data: response,
    };
  };

  return {
    transport,
    calls,
    setResponse: (newResponse: any) => {
      response = newResponse;
    },
  };
}
