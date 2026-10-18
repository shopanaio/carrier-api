// code and comments in English

/** Money as a decimal string to avoid float drift, plus an ISO 4217 currency code. */
export interface Money {
  amount: string;
  currency: string;
}

const DECIMAL = /^-?\d+(\.\d+)?$/;

// ISO 4217 minor units that differ from the usual 2 (KWD, BHD, OMR, JOD, TND have 3; JPY, KRW have 0).
const MINOR_UNITS: Record<string, number> = {
  BIF: 0,
  CLP: 0,
  DJF: 0,
  GNF: 0,
  ISK: 0,
  JPY: 0,
  KMF: 0,
  KRW: 0,
  PYG: 0,
  RWF: 0,
  UGX: 0,
  UYI: 0,
  VND: 0,
  VUV: 0,
  XAF: 0,
  XOF: 0,
  XPF: 0,
  BHD: 3,
  IQD: 3,
  JOD: 3,
  KWD: 3,
  LYD: 3,
  OMR: 3,
  TND: 3,
  CLF: 4,
  UYW: 4,
};

/** Number of decimal places of a currency (ISO 4217 minor units); 2 when not listed. */
export function currencyDecimals(currency: string): number {
  return MINOR_UNITS[currency] ?? 2;
}

/**
 * Builds Money. Numbers and strings are normalised the same way: rounded half away from zero to the
 * currency's minor units (`money(1.2345, 'KWD')` → `1.235`, `money('1.005', 'UAH')` → `1.01`),
 * trailing fractional zeros dropped (`'10,50'` → `10.5`). `,` is accepted as the decimal separator.
 */
export function money(amount: number | string, currency: string): Money {
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new TypeError(`Invalid ISO 4217 currency: ${currency}`);
  }
  const decimals = currencyDecimals(currency);
  const decimal = typeof amount === 'number' ? numberToDecimal(amount) : amount.trim().replace(',', '.');
  if (!DECIMAL.test(decimal)) {
    throw new TypeError(`Invalid money amount: ${amount}`);
  }
  return { amount: roundDecimal(decimal, decimals), currency };
}

/** Converts to a number for display or comparisons; do not use for arithmetic on totals. */
export function moneyToNumber(value: Money): number {
  return Number(value.amount);
}

function numberToDecimal(amount: number): string {
  // toFixed and String switch to exponent notation from 1e21 on, which is not a decimal string.
  if (!Number.isFinite(amount) || Math.abs(amount) >= 1e21) throw new TypeError(`Invalid money amount: ${amount}`);
  // The shortest string that round-trips (1.005 → "1.005", 0.1 + 0.2 → "0.30000000000000004") is
  // rounded as a decimal below, so no binary noise and no precision loss on large amounts.
  const text = String(amount);
  // Only |amount| < 1e-6 uses exponent notation here; it rounds to zero at up to 4 minor units.
  return text.includes('e') ? '0' : text;
}

/** Rounds a decimal string half away from zero without going through floats, then canonicalises it. */
function roundDecimal(value: string, decimals: number): string {
  const negative = value.startsWith('-');
  const [intPart, fracPart = ''] = (negative ? value.slice(1) : value).split('.') as [string, string?];
  let digits = intPart + fracPart.slice(0, decimals).padEnd(decimals, '0');
  if (fracPart.length > decimals && fracPart[decimals] >= '5') digits = incrementDigits(digits);
  // `digits` keeps at least one integer digit, so `int` is never empty.
  const int = (decimals === 0 ? digits : digits.slice(0, -decimals)).replace(/^0+(?=\d)/, '');
  const frac = (decimals === 0 ? '' : digits.slice(-decimals)).replace(/0+$/, '');
  const result = frac ? `${int}.${frac}` : int;
  return negative && /[1-9]/.test(result) ? `-${result}` : result;
}

function incrementDigits(digits: string): string {
  const chars = digits.split('');
  for (let i = chars.length - 1; i >= 0; i -= 1) {
    if (chars[i] !== '9') {
      chars[i] = String(Number(chars[i]) + 1);
      return chars.join('');
    }
    chars[i] = '0';
  }
  return `1${chars.join('')}`;
}
