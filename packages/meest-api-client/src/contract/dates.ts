// code and comments in English

/** Meest mixes date formats between methods; each path parameter has one formatter. */
export type DateInput = Date | string;

const TIME_ZONE = 'Europe/Kyiv';

function parts(date: Date): Record<string, string> {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  return Object.fromEntries(formatter.formatToParts(date).map(p => [p.type, p.value]));
}

function check(date: Date): Date {
  if (Number.isNaN(date.getTime())) throw new TypeError('Invalid date');
  return date;
}

/** `dd.MM.yyyy`: parcel send dates, `parcelsList`, `registersList`. A string is passed through unchanged. */
export function formatDate(input: DateInput): string {
  if (typeof input === 'string') return input;
  const p = parts(check(input));
  return `${p.day}.${p.month}.${p.year}`;
}

/** `yyyy-MM-dd`: `trackingByDate`. A string is passed through unchanged. */
export function formatIsoDate(input: DateInput): string {
  if (typeof input === 'string') return input;
  const p = parts(check(input));
  return `${p.year}-${p.month}-${p.day}`;
}

/** `yyyy-MM-dd HH:mm:ss` in Kyiv time: `trackingByPeriod`, `trackingDelivered`. A string is passed through unchanged. */
export function formatDateTime(input: DateInput): string {
  if (typeof input === 'string') return input;
  const p = parts(check(input));
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`;
}
