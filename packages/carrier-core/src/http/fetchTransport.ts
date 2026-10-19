// code and comments in English
import type { HttpRequest, HttpResponse, HttpTransport } from './types';
import { getHeader } from './types';
import { appendQuery } from './url';
import { attemptSignal } from '../utils/time';

export interface FetchTransportOptions {
  /** Defaults to the global `fetch` (Node 24+, browsers, edge runtimes). */
  fetchImpl?: typeof fetch;
  /** Headers added to every request; request headers win on conflict. */
  baseHeaders?: Record<string, string>;
}

/** Dependency-free `HttpTransport` on top of `fetch`. */
export function createFetchTransport(options: FetchTransportOptions = {}): HttpTransport {
  const doFetch = options.fetchImpl ?? (typeof fetch !== 'undefined' ? fetch.bind(globalThis) : undefined);
  if (!doFetch) {
    throw new TypeError('No fetch implementation available; pass `fetchImpl`');
  }

  return async function fetchTransport<T>(request: HttpRequest): Promise<HttpResponse<T>> {
    const { signal, cleanup } = attemptSignal(request.signal, request.timeoutMs);
    try {
      const headers: Record<string, string> = { ...(options.baseHeaders ?? {}), ...(request.headers ?? {}) };
      const body = encodeBody(request, headers);
      if (!getHeader(headers, 'accept')) {
        headers.Accept = acceptFor(request.responseType);
      }

      const response = await doFetch(appendQuery(request.url, request.query), {
        method: request.method,
        headers,
        body,
        signal,
      });

      const responseHeaders = toHeaderRecord(response.headers);
      const data = (await decodeBody(response, responseHeaders, request.responseType)) as T;
      return { status: response.status, headers: responseHeaders, data };
    } finally {
      cleanup();
    }
  };
}

function encodeBody(request: HttpRequest, headers: Record<string, string>): BodyInit | undefined {
  const body = request.body;
  if (!body) return undefined;
  const setType = (value: string) => {
    if (!getHeader(headers, 'content-type')) headers['Content-Type'] = value;
  };
  switch (body.kind) {
    case 'json':
      setType('application/json');
      return JSON.stringify(body.value);
    case 'form':
      setType('application/x-www-form-urlencoded');
      return new URLSearchParams(body.value).toString();
    case 'text':
      setType(body.contentType);
      return body.value;
    case 'binary':
      setType(body.contentType);
      return body.value as unknown as BodyInit;
  }
}

function acceptFor(responseType: HttpRequest['responseType']): string {
  if (responseType === 'binary') return '*/*';
  if (responseType === 'text') return 'text/plain, */*';
  return 'application/json';
}

async function decodeBody(
  response: Response,
  headers: Record<string, string>,
  responseType: HttpRequest['responseType'],
): Promise<unknown> {
  const contentType = headers['content-type'] ?? '';
  if (responseType === 'binary') {
    // Carriers report label errors as JSON with a 4xx status; decode those as JSON for error mapping.
    if (response.status >= 400 && isJson(contentType)) return parseJsonOrText(await response.text());
    return {
      contentType: contentType || 'application/octet-stream',
      data: new Uint8Array(await response.arrayBuffer()),
    };
  }
  const text = await response.text();
  if (responseType === 'text') return text;
  return parseJsonOrText(text);
}

function isJson(contentType: string): boolean {
  return /\bjson\b/i.test(contentType);
}

function parseJsonOrText(text: string): unknown {
  if (text === '') return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function toHeaderRecord(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key.toLowerCase()] = value;
  });
  return result;
}
