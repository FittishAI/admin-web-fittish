/**
 * Calendar-date helpers for date-range pickers.
 *
 * WHY THIS EXISTS — `new Date().toISOString().slice(0, 10)` is wrong here.
 * `toISOString()` converts to UTC first, so for anyone east of UTC in the small
 * hours (or west of UTC late in the evening) it yields the WRONG CALENDAR DAY:
 *
 *   Karachi (UTC+5), 2026-08-14 02:00 local
 *     toISOString() -> "2026-08-13T21:00:00.000Z" -> slice -> "2026-08-13"  ✗
 *     localDate()   ->                                        "2026-08-14"  ✓
 *
 * The picker shows the user their LOCAL calendar day, so the string sent to the
 * API must be that same local day. The backend then interprets a bare
 * YYYY-MM-DD as a whole UTC day.
 */

/** `YYYY-MM-DD` for the given date in the viewer's own timezone. */
export function localDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** `YYYY-MM-DD` for N days before today, in local time. */
export function localDateDaysAgo(days: number, from: Date = new Date()): string {
  const date = new Date(from);
  date.setDate(date.getDate() - days);
  return localDate(date);
}

/** True when `value` is a well-formed, real `YYYY-MM-DD` calendar date. */
export function isValidDateInput(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  // Rejects rollovers like 2026-02-31 -> 2026-03-03.
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
