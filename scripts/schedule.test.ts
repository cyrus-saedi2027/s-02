import {
  zonedTimeToInstant,
  zoneOffset,
  slotsOn,
  openCountOn,
  formatTime,
  civilDateIn,
  monthGrid,
  SLOT_MINUTES,
} from "../src/lib/schedule";

let fails = 0;
const check = (name: string, got: unknown, want: unknown) => {
  const ok = String(got) === String(want);
  if (!ok) fails++;
  console.log(`${ok ? "ok  " : "FAIL"} ${name}: got ${got}${ok ? "" : `, want ${want}`}`);
};

// 10:00 Amsterdam in winter (CET, UTC+1) is 09:00 UTC.
check("winter wall->instant",
  new Date(zonedTimeToInstant({ y: 2026, m: 0, d: 14 }, 10, 0, "Europe/Amsterdam")).toISOString(),
  "2026-01-14T09:00:00.000Z");

// 10:00 Amsterdam in summer (CEST, UTC+2) is 08:00 UTC — offset is NOT fixed.
check("summer wall->instant",
  new Date(zonedTimeToInstant({ y: 2026, m: 6, d: 14 }, 10, 0, "Europe/Amsterdam")).toISOString(),
  "2026-07-14T08:00:00.000Z");

// The day the EU springs forward (2026-03-29): 10:00 local is 08:00 UTC.
check("DST-transition day",
  new Date(zonedTimeToInstant({ y: 2026, m: 2, d: 29 }, 10, 0, "Europe/Amsterdam")).toISOString(),
  "2026-03-29T08:00:00.000Z");

check("offset winter", zoneOffset(Date.UTC(2026, 0, 14), "Europe/Amsterdam") / 3600000, 1);
check("offset summer", zoneOffset(Date.UTC(2026, 6, 14), "Europe/Amsterdam") / 3600000, 2);
check("offset UTC", zoneOffset(Date.now(), "UTC"), 0);

// The published window: the whole day, in half hours, every day.
const avail = { days: [0, 1, 2, 3, 4, 5, 6], start: 0, end: 24, horizon: 90 };
const FULL = ((avail.end - avail.start) * 60) / SLOT_MINUTES;
const now = Date.UTC(2026, 6, 1, 6, 0);
const slots = slotsOn({ y: 2026, m: 6, d: 14 }, avail, now, "Europe/Amsterdam");

check("a whole day is 48 half hours", slots.length, FULL);
check("slots are ascending", slots.every((v, i) => i === 0 || v > slots[i - 1]), true);

// The complaint that started this: a column of times with holes in it. Every
// step from one slot to the next has to be exactly half an hour.
const steps = slots.slice(1).map((at, i) => (at - slots[i]) / 60000);
check("no gaps between slots", steps.every((m) => m === SLOT_MINUTES), true);
check("first slot is 00:00", formatTime(slots[0], "Europe/Amsterdam"), "00:00");
check("last slot is 23:30", formatTime(slots[slots.length - 1], "Europe/Amsterdam"), "23:30");

// Twenty-four hour clock, always, with midnight at the bottom rather than 24.
check("midnight reads 00", formatTime(slots[0], "Europe/Amsterdam"), "00:00");
check("afternoon does not read 1", formatTime(slots[26], "Europe/Amsterdam"), "13:00");
check("first slot in NY", formatTime(slots[0], "America/New_York").length, 5);

// Weekend and past days.
check("weekend open", slotsOn({ y: 2026, m: 6, d: 18 }, avail, now, "Europe/Amsterdam").length, FULL);
check("past day closed", slotsOn({ y: 2026, m: 5, d: 1 }, avail, now, "Europe/Amsterdam").length, 0);

// Today only offers what has not already gone by.
const midday = Date.UTC(2026, 6, 14, 12, 0); // 14:00 in Amsterdam
const rest = slotsOn({ y: 2026, m: 6, d: 14 }, avail, midday, "Europe/Amsterdam");
check("today's past slots dropped", rest.length < FULL, true);
check("today starts at 14:30", formatTime(rest[0], "Europe/Amsterdam"), "14:30");
check("today still has no gaps",
  rest.slice(1).every((at, i) => at - rest[i] === SLOT_MINUTES * 60000), true);

// The count the calendar draws its dots from has to agree with the list.
for (const [label, at] of [["ahead", now], ["today", midday]] as const) {
  check(`count matches list (${label})`,
    openCountOn({ y: 2026, m: 6, d: 14 }, avail, at, "Europe/Amsterdam"),
    slotsOn({ y: 2026, m: 6, d: 14 }, avail, at, "Europe/Amsterdam").length);
}
check("count is zero on a past day", openCountOn({ y: 2026, m: 5, d: 1 }, avail, now, "Europe/Amsterdam"), 0);

// Spring forward: 02:00–03:00 does not exist in Amsterdam on 2026-03-29, so
// that day is an hour short and must still come out strictly ascending.
const springs = slotsOn({ y: 2026, m: 2, d: 29 }, avail, Date.UTC(2026, 2, 1), "Europe/Amsterdam");
check("spring-forward day is two slots short", springs.length, FULL - 2);
check("spring-forward day stays ascending", springs.every((v, i) => i === 0 || v > springs[i - 1]), true);
check("spring-forward day has no repeats", new Set(springs).size, springs.length);

// Stability: the same day generates the same slots every time.
check("deterministic",
  JSON.stringify(slotsOn({ y: 2026, m: 6, d: 14 }, avail, now, "Europe/Amsterdam")) ===
    JSON.stringify(slotsOn({ y: 2026, m: 6, d: 14 }, avail, now, "Europe/Amsterdam")), true);

// The grid always covers the month in six rows.
const grid = monthGrid(2026, 1, 0);
check("grid length", grid.length, 42);
check("grid covers month start", grid.some((d) => d.m === 1 && d.d === 1), true);
check("grid covers month end", grid.some((d) => d.m === 1 && d.d === 28), true);

check("civilDateIn rolls over the date line",
  JSON.stringify(civilDateIn(Date.UTC(2026, 6, 14, 23, 0), "Asia/Tokyo")),
  JSON.stringify({ y: 2026, m: 6, d: 15 }));

// The day is the visitor's own, in whichever zone they read it: it must run
// 00:00 to 23:30 on their clock, not slide by the offset to the studio's.
for (const zone of ["Europe/Amsterdam", "Asia/Tehran", "America/New_York", "Asia/Kathmandu", "UTC"]) {
  const day = slotsOn({ y: 2026, m: 7, d: 31 }, avail, Date.UTC(2026, 7, 28, 9, 0), zone);
  check(`${zone} runs 00:00 to 23:30`,
    `${formatTime(day[0], zone)}–${formatTime(day[day.length - 1], zone)}`, "00:00–23:30");
  check(`${zone} has every half hour`, day.length, FULL);
}

console.log(fails ? `\n${fails} FAILED` : "\nall passed");
process.exit(fails ? 1 : 0);
