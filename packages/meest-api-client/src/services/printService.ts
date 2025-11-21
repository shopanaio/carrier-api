import { BaseService } from './baseService';
import type { ResponseFormat } from '../types/base';
import type {
  Cn23PathParams,
  DeclarationPathParams,
  RegisterPathParams,
  Sticker100PathParams,
  Sticker100QueryParams,
  Sticker100A4PathParams,
  Sticker100A4QueryParams,
} from '../types/print';

const encode = (value: string | number) => encodeURIComponent(String(value));

export type PrintArtifact = ArrayBuffer | ReadableStream<Uint8Array> | NodeJS.ReadableStream | unknown;

export interface PrintRequestOptions {
  responseType?: ResponseFormat;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

interface PrintRequestConfig extends PrintRequestOptions {
  query?: Record<string, unknown>;
}

export class PrintService extends BaseService {
  readonly namespace = 'print' as const;

  private async fetchArtifact(path: string, config: PrintRequestConfig = {}): Promise<PrintArtifact> {
    return this.sendRaw<PrintArtifact>({
      method: 'GET',
      path,
      query: config.query,
      headers: config.headers,
      signal: config.signal,
      responseType: config.responseType ?? 'arraybuffer',
    });
  }

  async cn23(params: Cn23PathParams, options?: PrintRequestOptions): Promise<PrintArtifact> {
    const path = `/print/cn23/${encode(params.printValue)}/${encode(params.contentType)}`;
    return this.fetchArtifact(path, options);
  }

  async declaration(params: DeclarationPathParams, options?: PrintRequestOptions): Promise<PrintArtifact> {
    const path = `/print/declaration/${encode(params.printValue)}/${encode(params.contentType)}`;
    return this.fetchArtifact(path, options);
  }

  async register(params: RegisterPathParams, options?: PrintRequestOptions): Promise<PrintArtifact> {
    const path = `/print/register/${encode(params.printValue)}/${encode(params.contentType)}`;
    return this.fetchArtifact(path, options);
  }

  async sticker100(
    params: Sticker100PathParams,
    query?: Sticker100QueryParams,
    options?: PrintRequestOptions,
  ): Promise<PrintArtifact> {
    const path = `/print/sticker100/${encode(params.printValue)}`;
    return this.fetchArtifact(path, { ...options, query });
  }

  async sticker100A4(
    params: Sticker100A4PathParams,
    query: Sticker100A4QueryParams,
    options?: PrintRequestOptions,
  ): Promise<PrintArtifact> {
    const path = `/print/sticker100A4/${encode(params.printValue)}`;
    return this.fetchArtifact(path, { ...options, query });
  }
}
