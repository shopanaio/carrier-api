export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isTrackingNumber(value: unknown): value is string {
  return typeof value === 'string' && /^\d{14}$/.test(value.trim());
}

export function isPhoneNumber(value: unknown): value is string {
  return typeof value === 'string' && /^380\d{9}$/.test(value.trim());
}

export function isDateFormat(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  // Format: dd.mm.yyyy
  if (!/^\d{2}\.\d{2}\.\d{4}$/.test(trimmed)) return false;

  // Validate actual date values
  const [day, month, year] = trimmed.split('.').map(Number);
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > 2100) return false;

  return true;
}

export function isUUID(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value.trim())
  );
}

export function sanitizePhone(phone: string): string {
  // Remove all non-digit characters and trim
  let sanitized = phone.replace(/\D/g, '');

  // If starts with +380, remove the +
  if (phone.startsWith('+')) {
    sanitized = sanitized;
  }

  // If starts with 80, replace with 380
  if (sanitized.startsWith('80')) {
    sanitized = '3' + sanitized;
  }

  // If starts with 0, replace with 380
  if (sanitized.startsWith('0')) {
    sanitized = '38' + sanitized;
  }

  return sanitized;
}

export function assertString(value: unknown, field: string): string {
  if (!isNonEmptyString(value)) {
    throw new Error(`Field "${field}" must be a non-empty string`);
  }
  return value.trim();
}

export function assertNumber(value: unknown, field: string): number {
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`Field "${field}" must be a valid number`);
  }
  return value;
}

export function assertOptionalString(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  return assertString(value, field);
}

export function assertOptionalNumber(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  return assertNumber(value, field);
}
