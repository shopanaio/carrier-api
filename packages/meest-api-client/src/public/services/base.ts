// code and comments in English
import type { ClientContext } from '@shopana/carrier-core';
import type { RequestOptions } from '../../shared';
import type { MeestPublicContextConfig } from '../config';

export type PublicContext = ClientContext<MeestPublicContextConfig>;

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

  /** Reads through the optional ReferenceCache; arrays are stored as returned. */
  protected async cached<T>(key: string, load: () => Promise<T>): Promise<T> {
    const { cache, cacheTtlSec } = this.ctx.config;
    if (!cache) return load();
    const hit = await cache.get<T>(`meest:public:${key}`);
    if (hit !== undefined) return hit;
    const value = await load();
    await cache.set(`meest:public:${key}`, value, cacheTtlSec);
    return value;
  }
}

/** Several values of one filter go to Meest as a comma separated list. */
export function joinFilter(value: string | readonly string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'string' ? value : value.join(',');
}
