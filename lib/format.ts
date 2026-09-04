/**
 * Display formatters shared across the admin panel.
 *
 * These live here rather than in each table so every screen renders the same
 * value the same way — a date is "Aug 24, 2026" everywhere, a missing value is
 * an em dash everywhere, and a fix applied here reaches all of them.
 */

/** Rendered in place of any value that is absent or unparseable. */
export const EM_DASH = '—';

const DAY_MS = 86_400_000;

/* ---------------------------------- dates --------------------------------- */

const DATE_ONLY: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
};

/** A bare calendar day with no time part, e.g. "2026-08-24". */
const DATE_ONLY_STRING = /^d{4}-d{2}-d{2}$/;

/**
 * Timestamp as a local calendar date — "Aug 24, 2026".
 *
 * Absent OR unparseable input returns the em dash: a bad timestamp must never
 * reach the screen as the string "Invalid Date".
 *
 * A bare "YYYY-MM-DD" is routed to {@link formatUtcDay} instead of being
 * rendered in the viewer's zone. JS parses such a string as UTC midnight, so
 * formatting it locally would move it a day BACKWARDS for every viewer west of
 * UTC — "2026-08-24" would read "Aug 23" in New York. A calendar day carries no
 * instant to convert, so it must be shown exactly as sent.
 */
export function formatDate(iso?: string | null): string {
  if (!iso) return EM_DASH;
  if (DATE_ONLY_STRING.test(iso.trim())) return formatUtcDay(iso.trim());
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? EM_DASH
    : d.toLocaleDateString(undefined, DATE_ONLY);
}

/**
 * A date-only string from the API ("2026-08-24") as a calendar date.
 *
 * Pinned to UTC deliberately. The API sends a calendar day with no time, so
 * parsing it in the viewer's zone would shift it a day backwards for anyone
 * west of UTC — the chart would then label a bucket with the wrong date.
 */
export function formatUtcDay(
  day: string,
  opts: Intl.DateTimeFormatOptions = DATE_ONLY,
): string {
  const d = new Date(`${day}T00:00:00Z`);
  return Number.isNaN(d.getTime())
    ? EM_DASH
    : d.toLocaleDateString(undefined, { ...opts, timeZone: 'UTC' });
}

/** "Aug 24" — for dense chart axes where the year would not fit. */
export const formatUtcDayShort = (day: string): string =>
  formatUtcDay(day, { month: 'short', day: 'numeric' });

/** "August 24, 2026" — for tooltips, where the full date is worth the space. */
export const formatUtcDayLong = (day: string): string =>
  formatUtcDay(day, { month: 'long', day: 'numeric', year: 'numeric' });


const NEVER_EXPIRES_YEAR = 9999;

/**
 * An expiry timestamp as a date — or the word "Lifetime".
 *
 * Rendering the sentinel with {@link formatDate} would put "Dec 31, 9999" on
 * screen, which reads as a data bug rather than as a deliberate forever-grant.
 */
export function formatEntitlementExpiry(iso?: string | null): string {
  if (!iso) return EM_DASH;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return EM_DASH;
  if (d.getUTCFullYear() >= NEVER_EXPIRES_YEAR) return 'Lifetime';
  return formatDate(iso);
}

/** A day count with its unit — "1 day", "30 days". */
export const formatDays = (n: number): string =>
  `${formatNumber(n)} ${n === 1 ? 'day' : 'days'}`;

export function formatDateTime(iso?: string | null): string {
  if (!iso) return EM_DASH;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? EM_DASH
    : d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
}

export function utcDayOf(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}


export function utcDayRange(
  start: string,
  end: string,
  maxDays: number,
): string[] {
  const from = Date.parse(`${start}T00:00:00Z`);
  const to = Date.parse(`${end}T00:00:00Z`);
  if (Number.isNaN(from) || Number.isNaN(to) || to < from) return [];

  const days: string[] = [];
  for (let t = from; t <= to && days.length < maxDays; t += DAY_MS) {
    days.push(new Date(t).toISOString().slice(0, 10));
  }
  return days;
}

/* ------------------------------ date & time inputs ------------------------ */

const pad2 = (n: number) => String(n).padStart(2, '0');


export function combineDateTime(date: string, time: string): string {
  return date && time ? `${date}T${time}` : '';
}


export function localInputToIso(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function todayForInput(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function nowForTimeInput(): string {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/* --------------------------------- strings -------------------------------- */

export const truncateLabel = (value: string, max: number): string =>
  value.length > max ? `${value.slice(0, max - 1)}…` : value;

/* --------------------------------- numbers -------------------------------- */

/** Thousands-separated, in the viewer's locale — "1,234,567". */
export const formatNumber = (n: number): string => n.toLocaleString();

/**
 * Shortened for stat tiles — "1.2M", "34.5K", "812".
 * Always pair it with the exact figure in a `title`, so the precise number
 * stays one hover away.
 */
export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/**
 * USD cost. Sub-cent amounts keep 4 decimals — GPT costs are frequently below
 * $0.01 per request, and rounding those to "$0.00" would read as free.
 */
export function formatUsd(n: number | null): string {
  if (n === null) return EM_DASH;
  if (n === 0) return '$0.00';
  if (n < 0.01) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(2)}`;
}
