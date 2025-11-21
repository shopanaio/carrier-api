// code and comments in English
import type { ClientContext } from '../core/client';
import type { HttpMethod } from '../http/transport';
import type { MeestResponse } from '../types/base';
import { assertOk } from '../errors';
import type { ServiceRequestConfig } from '../utils/requestBuilder';

export interface SendOptions extends ServiceRequestConfig {
  method: HttpMethod;
  path: string;
}

export abstract class BaseService {
  protected requestBuilder!: ClientContext['requestBuilder'];
  protected transport!: ClientContext['transport'];
  protected tokenManager!: ClientContext['tokenManager'];

  attach(ctx: ClientContext) {
    this.requestBuilder = ctx.requestBuilder;
    this.transport = ctx.transport;
    this.tokenManager = ctx.tokenManager;
  }

  protected async send<T>(options: SendOptions): Promise<T> {
    const request = this.requestBuilder.build(options);
    const response = await this.transport.request<MeestResponse<T>>(request);
    return assertOk(response.data, {
      request: { method: options.method, url: request.url, path: options.path },
      responseStatus: response.status,
    });
  }

  protected async sendRaw<T = unknown>(options: SendOptions): Promise<T> {
    const request = this.requestBuilder.build(options);
    const response = await this.transport.request<T>(request);
    return response.data;
  }
}
