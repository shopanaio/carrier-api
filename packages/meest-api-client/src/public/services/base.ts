// code and comments in English
import type { ClientContext } from '@shopana/carrier-core';
import type { RequestOptions } from '../../shared';

export type PublicContext = ClientContext<Record<string, never>>;

export abstract class PublicService {
  protected ctx!: PublicContext;

  attach(ctx: PublicContext): void {
    this.ctx = ctx;
  }

  protected getJson<T>(
    path: string,
    query?: Record<string, string | number | undefined>,
    pathParams?: Record<string, string>,
    options?: RequestOptions,
  ): Promise<T> {
    return this.ctx.http.request<T>({
      method: 'GET',
      path,
      ...(query ? { query } : {}),
      ...(pathParams ? { pathParams } : {}),
      ...(options?.signal ? { signal: options.signal } : {}),
    });
  }
}

/** Several values of one filter go to Meest as a comma separated list. */
export function joinFilter(value: string | readonly string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'string' ? value : value.join(',');
}
