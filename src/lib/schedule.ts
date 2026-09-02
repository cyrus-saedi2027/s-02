/**
 * Scheduling helpers for the booking panel.
 *
 * Everything here works in real instants (UTC milliseconds) and converts for
 * display only. The host publishes working hours as wall-clock time in their
 * own zone, the visitor reads them in theirs, and the two are not a fixed
 * number of hours apart — the offset moves with daylight saving on both sides.
 * So a slot is resolved to an instant first, and only then formatted.
 */

/** A calendar date with no time and no zone attached. */
export type CivilDate = { y: number; m: number; d: number };

/**
 * Cached formatters, keyed by zone.
 *
 * Building an `Intl.DateTimeFormat` is by far the expensive half of using one —
 * it loads and compiles the zone's rules — and resolving a month of days walks
 * this path thousands of times. Constructed per call it was most of the cost of
 * opening the panel.
 */
const cache = new Map<string, Intl.DateTimeFormat>();
const formatter = (key: string, make: () => Intl.DateTimeFormat) => {
  let f = cache.get(key);
  if (!f) cache.set(key, (f = make()));
  return f;
};

/** Milliseconds a zone is ahead of UTC at a given instant. */
export function zoneOffset(at: number, timeZone: string): number {
  const parts = formatter(
    `offset:${timeZone}`,
    () =>
      new Intl.DateTimeFormat("en-US", {
        timeZone,
        hourCycle: "h23",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
  ).formatToParts(new Date(at));

  const f = (type: string) => Number(parts.find((p) => p.type === type)!.value);
  const asIfUtc = Date.UTC(f("year"), f("month") - 1, f("day"), f("hour"), f("minute"), f("second"));
  // Instants carry milliseconds the formatter drops, so compare on whole seconds.
  return asIfUtc - Math.floor(at / 1000) * 1000;
}

/**
 * The instant at which a wall clock in `timeZone` reads the given date and time.
 *
 * The offset depends on the instant we are solving for, so this guesses once,
 * corrects with the offset that guess lands in, and re-checks. The second pass
 * matters only across a DST boundary, where the first guess can land on the
 * wrong side of the jump.
 */
export function zonedTimeToInstant(
  date: CivilDate,
  hour: number,
  minute: number,
  timeZone: string
): number {
  const guess = Date.UTC(date.y, date.m, date.d, hour, minute);
  const first = guess - zoneOffset(guess, timeZone);
  const second = guess - zoneOffset(first, timeZone);
  return second;
}

/** The civil date an instant falls on, as read in `timeZone`. */
export function civilDateIn(at: number, timeZone: string): CivilDate {
  const parts = formatter(
    `date:${timeZone}`,
    () =>
      new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
  ).formatToParts(new Date(at));
  const f = (type: string) => Number(parts.find((p) => p.type === type)!.value);
  return { y: f("year"), m: f("month") - 1, d: f("day") };
}

/** The clock the panel reads and writes with: 24 hour, zero padded. */
const clock = (timeZone: string) =>
  formatter(
    `clock:${timeZone}`,
    () => new Intl.DateTimeFormat("en-GB", { timeZone, hourCycle: "h23", hour: "2-digit", minute: "2-digit" })
  );

/** Minutes since midnight on the clock in `timeZone`. */
export function minutesOfDayIn(at: number, timeZone: string): number {
  const parts = clock(timeZone).formatToParts(new Date(at));
  const f = (type: string) => Number(parts.find((p) => p.type === type)!.value);
  return f("hour") * 60 + f("minute");
}

export const sameDate = (a: CivilDate, b: CivilDate) =>
  a.y === b.y && a.m === b.m && a.d === b.d;

/** Sorts as a plain number so dates compare without building Date objects. */
export const dateKey = (d: CivilDate) => d.y * 10000 + d.m * 100 + d.d;

/** Day of week for a civil date, 0 = Sunday. */
export const weekdayOf = (d: CivilDate) => new Date(Date.UTC(d.y, d.m, d.d)).getUTCDay();

export const addMonths = (d: CivilDate, n: number): CivilDate => {
  const t = new Date(Date.UTC(d.y, d.m + n, 1));
  return { y: t.getUTCFullYear(), m: t.getUTCMonth(), d: 1 };
};

/**
 * Six weeks of dates covering the month, starting on `weekStart`.
 *
 * Always six rows: a grid that changes height as you page through months makes
 * the panel jump, and the whole layout is anchored to it.
 */
export function monthGrid(year: number, month: number, weekStart = 0): CivilDate[] {
  const first = new Date(Date.UTC(year, month, 1));
  const lead = (first.getUTCDay() - weekStart + 7) % 7;
  return Array.from({ length: 42 }, (_, i) => {
    const t = new Date(Date.UTC(year, month, 1 - lead + i));
    return { y: t.getUTCFullYear(), m: t.getUTCMonth(), d: t.getUTCDate() };
  });
}

export type Availability = {
  /** Open weekdays, 0 = Sunday. */
  days: readonly number[];
  /**
   * The window, in whole hours on the visitor's own clock — so the day runs
   * from `start` to `end` wherever they are reading it, rather than sliding by
   * the offset between them and the studio. `end` is exclusive.
   */
  start: number;
  end: number;
  /** How far ahead bookings are open, in days. */
  horizon: number;
};

/** Every slot is half an hour, and they run back to back. */
export const SLOT_MINUTES = 30;

/** Whether a date is inside the open window at all, before looking at times. */
function isOpenDay(date: CivilDate, avail: Availability, now: number, timeZone: string): boolean {
  const today = civilDateIn(now, timeZone);
  if (dateKey(date) < dateKey(today)) return false;

  const horizon = new Date(Date.UTC(today.y, today.m, today.d + avail.horizon));
  if (dateKey(date) > dateKey(civilDateIn(horizon.getTime(), "UTC"))) return false;

  return avail.days.includes(weekdayOf(date));
}

/**
 * Open slots on a date, as instants, ascending.
 *
 * A continuous run from the first half hour of the window to the last, with
 * nothing left out in the middle. A gap in a column of times does not read as a
 * booked hour, it reads as arithmetic that went wrong — 10:45 followed by 11:15
 * looks like a bug whatever it means — so the only slots missing here are the
 * ones that have already gone by.
 */
export function slotsOn(
  date: CivilDate,
  avail: Availability,
  now: number,
  timeZone: string
): number[] {
  if (!isOpenDay(date, avail, now, timeZone)) return [];

  const out: number[] = [];
  let last = -Infinity;

  for (let mins = avail.start * 60; mins + SLOT_MINUTES <= avail.end * 60; mins += SLOT_MINUTES) {
    const at = zonedTimeToInstant(date, Math.floor(mins / 60), mins % 60, timeZone);
    if (at <= now) continue; // today, already gone
    // The hour a spring-forward skips has no instant of its own: its half hours
    // resolve onto the hour that replaced it. Keep the run strictly ascending
    // and the duplicates fall out.
    if (at <= last) continue;
    last = at;
    out.push(at);
  }
  return out;
}

/**
 * How many slots a date still has open, without resolving any of them.
 *
 * The calendar asks this of forty-two cells at a time and only wants a count,
 * so it is arithmetic on the window rather than a walk through the day. On the
 * two days a year a zone changes offset it can be one slot out, which reaches
 * no further than the dot under a date.
 */
export function openCountOn(
  date: CivilDate,
  avail: Availability,
  now: number,
  timeZone: string
): number {
  if (!isOpenDay(date, avail, now, timeZone)) return 0;

  const last = avail.end * 60 - SLOT_MINUTES;
  const from =
    dateKey(date) > dateKey(civilDateIn(now, timeZone))
      ? avail.start * 60
      : Math.max(avail.start * 60, Math.ceil((minutesOfDayIn(now, timeZone) + 1) / SLOT_MINUTES) * SLOT_MINUTES);

  return Math.max(0, Math.floor((last - from) / SLOT_MINUTES) + 1);
}

/** Formats an instant as a time of day, on the viewer's clock. */
export function formatTime(at: number, timeZone: string): string {
  return clock(timeZone).format(new Date(at));
}

/** The zones offered in the picker, with the viewer's own first. */
export function timeZoneChoices(): string[] {
  const here = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const common = [
    "Europe/Amsterdam",
    "Europe/London",
    "America/New_York",
    "America/Los_Angeles",
    "Asia/Tehran",
    "Asia/Dubai",
    "Asia/Tokyo",
    "Australia/Sydney",
    "UTC",
  ];
  return [here, ...common.filter((z) => z !== here)];
}

/** Short label for a zone, e.g. "Amsterdam · GMT+2". */
export function zoneLabel(timeZone: string, at: number): string {
  const city = timeZone.split("/").pop()!.replace(/_/g, " ");
  const mins = zoneOffset(at, timeZone) / 60000;
  const sign = mins < 0 ? "−" : "+";
  const h = Math.floor(Math.abs(mins) / 60);
  const m = Math.abs(mins) % 60;
  return `${city} · GMT${mins === 0 ? "" : sign + h + (m ? `:${String(m).padStart(2, "0")}` : "")}`;
}
