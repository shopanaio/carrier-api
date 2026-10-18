// code and comments in English
import type { QueryParams } from './types';

/** Joins a base URL and a path without doubling or dropping slashes. */
export function joinUrl(baseUrl: string, path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  if (!path) return baseUrl;
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

/**
 * Substitutes `{name}` placeholders with URI-encoded values.
 * Throws when a placeholder has no value, so a missing id never hits the wire as "undefined".
 */
export function expandPath(template: string, params: Record<string, string | number | boolean> = {}): string {
  return template.replace(/\{([^}]+)\}/g, (_, name: string) => {
    const value = params[name];
    if (value === undefined || value === null || value === '') {
      throw new TypeError(`Missing path parameter "${name}" for ${template}`);
    }
    return encodeURIComponent(String(value));
  });
}

/** Appends query parameters; `undefined`/`null` values are skipped, arrays repeat the key. */
export function appendQuery(url: string, query?: QueryParams): string {
  if (!query) return url;
  const parts: string[] = [];
  for (const [key, raw] of Object.entries(query)) {
    const values = Array.isArray(raw) ? raw : [raw];
    for (const value of values) {
      if (value === undefined || value === null) continue;
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }
  if (parts.length === 0) return url;
  const [withoutHash, hash] = splitHash(url);
  const separator = withoutHash.includes('?')
    ? withoutHash.endsWith('?') || withoutHash.endsWith('&')
      ? ''
      : '&'
    : '?';
  return `${withoutHash}${separator}${parts.join('&')}${hash}`;
}

function splitHash(url: string): [string, string] {
  const index = url.indexOf('#');
  return index === -1 ? [url, ''] : [url.slice(0, index), url.slice(index)];
}
