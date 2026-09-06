/**
 * Time Zone Converter.
 * Built entirely on the Intl API — no external dependencies.
 *
 * All conversion logic treats instants correctly: a wall-clock time in
 * the source zone is converted to a UTC instant, then formatted in the
 * target zone, so DST and historical offsets are handled by the ICU
 * database that ships with the runtime.
 */

/** Number of IANA zones offered in the picker (curated common list). */
export type TimeZoneInfo = {
  id: string;
  /** e.g. "India Standard Time" */
  name: string;
  /** e.g. "GMT+5:30" */
  offsetLabel: string;
  /** Offset in minutes east of UTC (at the reference instant). */
  offsetMinutes: number;
  /** City part of the IANA id, e.g. "Kolkata" from "Asia/Kolkata". */
  city: string;
};

/** Seconds → minutes east of UTC for a zone at a given instant. */
export function getOffsetMinutes(timeZone: string, date: Date = new Date()): number {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const parts = dtf.formatToParts(date);
    const get = (type: string) =>
      Number(parts.find((p) => p.type === type)?.value ?? "0");
    const asUTC = Date.UTC(
      get("year"),
      get("month") - 1,
      get("day"),
      get("hour") % 24,
      get("minute"),
      get("second")
    );
    return Math.round((asUTC - date.getTime()) / 60_000);
  } catch {
    return 0;
  }
}

/** "GMT+5:30" style label from a minute offset. */
export function formatOffset(offsetMinutes: number): string {
  const sign = offsetMinutes < 0 ? "−" : "+";
  const abs = Math.abs(offsetMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `GMT${sign}${h}${m ? `:${String(m).padStart(2, "0")}` : ""}`;
}

/** Friendly zone name via Intl (e.g. "India Standard Time"). */
export function getZoneName(timeZone: string, date: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "long",
    }).formatToParts(date);
    return parts.find((p) => p.type === "timeZoneName")?.value ?? timeZone;
  } catch {
    return timeZone;
  }
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

/** Curated, friendly-first zone list for the pickers (common regions). */
const COMMON_ZONES = [
  "Pacific/Honolulu",
  "America/Anchorage",
  "America/Los_Angeles",
  "America/Vancouver",
  "America/Denver",
  "America/Mexico_City",
  "America/Chicago",
  "America/Winnipeg",
  "America/New_York",
  "America/Toronto",
  "America/Bogota",
  "America/Lima",
  "America/Sao_Paulo",
  "America/Argentina/Buenos_Aires",
  "UTC",
  "Europe/London",
  "Europe/Dublin",
  "Europe/Lisbon",
  "Europe/Madrid",
  "Europe/Paris",
  "Europe/Amsterdam",
  "Europe/Berlin",
  "Europe/Zurich",
  "Europe/Rome",
  "Europe/Stockholm",
  "Europe/Warsaw",
  "Europe/Prague",
  "Europe/Athens",
  "Europe/Helsinki",
  "Europe/Istanbul",
  "Europe/Moscow",
  "Africa/Casablanca",
  "Africa/Lagos",
  "Africa/Cairo",
  "Africa/Johannesburg",
  "Africa/Nairobi",
  "Asia/Jerusalem",
  "Asia/Riyadh",
  "Asia/Dubai",
  "Asia/Tehran",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Colombo",
  "Asia/Kathmandu",
  "Asia/Dhaka",
  "Asia/Yangon",
  "Asia/Bangkok",
  "Asia/Jakarta",
  "Asia/Singapore",
  "Asia/Kuala_Lumpur",
  "Asia/Manila",
  "Asia/Shanghai",
  "Asia/Hong_Kong",
  "Asia/Taipei",
  "Asia/Seoul",
  "Asia/Tokyo",
  "Australia/Perth",
  "Australia/Adelaide",
  "Australia/Brisbane",
  "Australia/Sydney",
  "Pacific/Auckland",
  "Pacific/Fiji",
];

/**
 * Zones for the picker. `at` fixes the instant used for offset labels
 * (defaults to now, so DST is reflected live).
 */
export function listTimeZones(at: Date = new Date()): TimeZoneInfo[] {
  const ids = COMMON_ZONES.filter((z) => isValidTimeZone(z));
  return ids
    .map((id) => {
      const offsetMinutes = getOffsetMinutes(id, at);
      const city = id.split("/").pop()!.replace(/_/g, " ");
      return {
        id,
        city,
        name: getZoneName(id, at),
        offsetMinutes,
        offsetLabel: formatOffset(offsetMinutes),
      } satisfies TimeZoneInfo;
    })
    .sort((a, b) => a.offsetMinutes - b.offsetMinutes || a.city.localeCompare(b.city));
}

/** Fallback list if the runtime lacks the curated zones. */
export function fallbackZones(): string[] {
  const known = ["UTC", "Asia/Kolkata", "America/New_York", "Europe/London", "Asia/Tokyo"];
  return known.filter((z) => isValidTimeZone(z));
}

export interface ConvertInput {
  /** Wall-clock in the source zone: "YYYY-MM-DD" */
  date: string;
  /** Wall-clock in the source zone: "HH:mm" (24h) */
  time: string;
  sourceZone: string;
  targetZone: string;
}

export interface ConvertedTime {
  date: string;
  /** 24h "HH:mm" */
  time24: string;
  /** e.g. "2:30 PM" */
  time12: string;
  weekday: string;
  offsetLabel: string;
  /** Whole days shifted vs the source wall-clock date. */
  dayShift: number;
}

/** Parts of a wall-clock in a zone, from a UTC instant. */
function partsInZone(
  instant: Date,
  timeZone: string
): { date: string; time24: string; time12: string; weekday: string } {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "long",
  });
  const p = new Map(fmt.formatToParts(instant).map((x) => [x.type, x.value]));
  const date = `${p.get("year")}-${p.get("month")}-${p.get("day")}`;
  const hour = p.get("hour") === "24" ? "00" : p.get("hour");
  return {
    date,
    time24: `${hour}:${p.get("minute")}`,
    time12: new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(instant),
    weekday: p.get("weekday") ?? "",
  };
}

/** Day difference between two YYYY-MM-DD strings (target − source). */
function dayShift(sourceDate: string, targetDate: string): number {
  const a = Date.parse(`${sourceDate}T00:00:00Z`);
  const b = Date.parse(`${targetDate}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.round((b - a) / 86_400_000);
}

/**
 * Convert a wall-clock time from one zone to another.
 * Returns null when the inputs are malformed or zones are unknown.
 */
export function convertTimeZone(input: ConvertInput): ConvertedTime | null {
  const { date, time, sourceZone, targetZone } = input;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  if (!isValidTimeZone(sourceZone) || !isValidTimeZone(targetZone)) return null;

  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59) return null;

  // Wall-clock → UTC instant: guess with UTC, correct by the source zone's
  // offset at that guess (two-pass handles DST boundaries well enough).
  const guessUtc = Date.UTC(y, mo - 1, d, h, mi);
  let instant = guessUtc - getOffsetMinutes(sourceZone, new Date(guessUtc)) * 60_000;
  instant = guessUtc - getOffsetMinutes(sourceZone, new Date(instant)) * 60_000;

  const source = partsInZone(new Date(instant), sourceZone);
  const target = partsInZone(new Date(instant), targetZone);

  return {
    date: target.date,
    time24: target.time24,
    time12: target.time12,
    weekday: target.weekday,
    offsetLabel: formatOffset(getOffsetMinutes(targetZone, new Date(instant))),
    dayShift: dayShift(source.date, target.date),
  };
}

export function validateConvertInput(input: ConvertInput): string | null {
  if (!isValidTimeZone(input.sourceZone)) return "Unknown source time zone.";
  if (!isValidTimeZone(input.targetZone)) return "Unknown target time zone.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return "Enter a valid date.";
  if (!/^\d{2}:\d{2}$/.test(input.time)) return "Enter a valid time.";
  return null;
}

/** "Local time in {zone} is {time} ({offset})" — one-line live summary. */
export function nowInZone(timeZone: string, at: Date = new Date()): string {
  const p = partsInZone(at, timeZone);
  return `${p.time12} ${p.weekday}`;
}
