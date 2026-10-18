// code and comments in English

const KYIV_ZONE = 'Europe/Kyiv';

/**
 * Ukrposhta reports local Kyiv time without a zone (`2017-07-27T16:33:00`). Returns the same instant
 * as an ISO 8601 string with the real UTC offset (+02:00 or +03:00), so consumers can sort events across carriers.
 * Returns the input unchanged when it does not parse.
 */
export function kyivLocalToIso(local: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/.exec(local);
  if (!match) return local;
  const [, y, mo, d, h, mi, s = '00'] = match;
  const asUtc = Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s));
  // Pick the offset that is real at that instant. A local time that happens twice (clocks go back) takes the
  // earlier one (+03:00); one that never happens (clocks go forward) takes the offset before the switch (+02:00).
  const candidates = [180, 120];
  const offsetMinutes =
    candidates.find(candidate => kyivOffsetMinutes(asUtc - candidate * 60_000) === candidate) ?? 120;
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMinutes);
  const offset = `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
  return `${y}-${mo}-${d}T${h}:${mi}:${s}${offset}`;
}

function kyivOffsetMinutes(utcMs: number): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: KYIV_ZONE,
    timeZoneName: 'longOffset',
    hour: '2-digit',
  }).formatToParts(new Date(utcMs));
  const name = parts.find(part => part.type === 'timeZoneName')?.value ?? 'GMT';
  const m = /GMT(?:([+-])(\d{1,2})(?::(\d{2}))?)?/.exec(name);
  if (!m?.[1]) return 0;
  const minutes = Number(m[2]) * 60 + Number(m[3] ?? 0);
  return m[1] === '-' ? -minutes : minutes;
}
