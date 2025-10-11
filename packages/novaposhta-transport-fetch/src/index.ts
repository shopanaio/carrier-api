// code and comments in English
import fetchPonyfill from 'cross-fetch';

export type HttpTransport = <TReq, TRes>(args: {
  url: string;
  body: TReq;
  signal?: AbortSignal;
}) => Promise<{ status: number; data: TRes }>;

export function createFetchHttpTransport(init?: {
  fetchImpl?: typeof fetch;
  baseHeaders?: Record<string, string>;
}): HttpTransport {
  const doFetch = init?.fetchImpl ?? (typeof fetch !== 'undefined' ? fetch : (fetchPonyfill as unknown as typeof fetch));
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json', ...(init?.baseHeaders ?? {}) };

  async function transport<TReq, TRes>({ url, body, signal }: { url: string; body: TReq; signal?: AbortSignal }) {
    const res = await doFetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal,
    });
    const data = (await res.json()) as TRes;
    return { status: res.status, data };
  }

  return transport as HttpTransport;
}
