// code and comments in English
export function serializeQueryParams(params: Record<string, unknown> = {}): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry === undefined || entry === null) return;
        searchParams.append(key, String(entry));
      });
      continue;
    }
    if (value instanceof Date) {
      searchParams.append(key, value.toISOString());
      continue;
    }
    searchParams.append(key, String(value));
  }

  const serialized = searchParams.toString();
  return serialized ? `?${serialized}` : '';
}

export function normalizePathSegment(segment: string): string {
  return segment.startsWith('/') ? segment : `/${segment}`;
}

export function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

export function ensureLeadingSlash(value: string): string {
  return value.startsWith('/') ? value : `/${value}`;
}

export function normalizeDateInput(input: string | number | Date): string {
  if (input instanceof Date) {
    return input.toISOString();
  }
  if (typeof input === 'number') {
    return new Date(input).toISOString();
  }
  return input;
}
