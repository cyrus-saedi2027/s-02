/**
 * "2025-11-04" as "4 November 2025".
 *
 * Its own file rather than an extra export from the page that first needed it:
 * a module that exports both a component and a helper cannot be hot-reloaded,
 * so every edit to the writing index was reloading the whole page in dev.
 *
 * Parsed and formatted in UTC on purpose. Left to the local timezone, a date
 * written as the 4th shows as the 3rd to anyone west of Greenwich, because
 * "2025-11-04" is parsed as midnight UTC and then rendered locally.
 */
export function longDate(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
