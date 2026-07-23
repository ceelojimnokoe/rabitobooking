/**
 * Pure date/time scheduling helpers for the booking flow. Availability
 * depends on which branch is selected — see `branchSchedules` in
 * src/config/clinic.ts for each branch's weekday/weekend hours.
 *
 * Ghana Standard Time (Africa/Accra) is UTC+00:00 year-round with no DST,
 * so reading a Date's UTC fields directly gives Accra wall-clock time
 * regardless of the server or browser's local timezone. This keeps the
 * logic identical on server and client (important for avoiding
 * hydration mismatches) without needing a timezone library.
 */
import { scheduling, branches, branchSchedules, type DayHours } from "@/config/clinic";

export interface AccraDateParts {
  year: number;
  month: number; // 1-12
  day: number;
}

export function toAccraDateParts(date: Date): AccraDateParts {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

/** YYYY-MM-DD string for a date, in Accra local time. */
export function toDateKey(date: Date): string {
  const { year, month, day } = toAccraDateParts(date);
  return `${year.toString().padStart(4, "0")}-${month
    .toString()
    .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

/** Build a UTC-midnight Date from a YYYY-MM-DD key (Accra calendar day). */
export function fromDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function compareDateKeys(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function isWeekend(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

function resolveBranchId(branchLabel: string) {
  return branches.find((b) => b.label === branchLabel)?.id;
}

/** The branch's hours for the given date's day of week, or null if closed. */
export function getDayHoursForBranch(
  branchLabel: string,
  date: Date,
): DayHours | null {
  const id = resolveBranchId(branchLabel);
  if (!id) return null;
  const schedule = branchSchedules[id];
  return isWeekend(date) ? schedule.weekend : schedule.weekday;
}

export function isBranchOpenOn(branchLabel: string, date: Date): boolean {
  return getDayHoursForBranch(branchLabel, date) !== null;
}

/** Whether `dateKey` is strictly before "today" in Accra time. */
export function isPastDateKey(dateKey: string, now: Date): boolean {
  return compareDateKeys(dateKey, toDateKey(now)) < 0;
}

/** Whether `dateKey` falls within the configured booking window (inclusive). */
export function isWithinBookingWindow(dateKey: string, now: Date): boolean {
  const maxDate = new Date(now);
  maxDate.setUTCDate(maxDate.getUTCDate() + scheduling.bookingWindowDays);
  return compareDateKeys(dateKey, toDateKey(maxDate)) <= 0;
}

export interface DateValidationResult {
  ok: boolean;
  reason?: string;
}

/** Full validation of a candidate date key against all booking rules. */
export function validateDateKeyForBranch(
  dateKey: string,
  now: Date,
  branchLabel: string,
): DateValidationResult {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return { ok: false, reason: "Enter a valid date." };
  }
  const date = fromDateKey(dateKey);
  if (Number.isNaN(date.getTime())) {
    return { ok: false, reason: "Enter a valid date." };
  }
  if (isPastDateKey(dateKey, now)) {
    return { ok: false, reason: "Past dates cannot be selected." };
  }
  if (!isWithinBookingWindow(dateKey, now)) {
    return {
      ok: false,
      reason: `Please choose a date within the next ${scheduling.bookingWindowDays} days.`,
    };
  }
  if (!isBranchOpenOn(branchLabel, date)) {
    return {
      ok: false,
      reason: isWeekend(date)
        ? `${branchLabel} is closed on weekends.`
        : `${branchLabel} is closed on this day.`,
    };
  }
  return { ok: true };
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function slotsBetween(hours: DayHours): string[] {
  const slots: string[] = [];
  const open = timeToMinutes(hours.open);
  const close = timeToMinutes(hours.close);
  for (
    let t = open;
    t + scheduling.slotDurationMinutes <= close;
    t += scheduling.slotDurationMinutes
  ) {
    slots.push(minutesToTime(t));
  }
  return slots;
}

/** All time slots for a branch on a given date, [] if closed that day. */
export function allTimeSlotsForBranchDay(
  branchLabel: string,
  date: Date,
): string[] {
  const hours = getDayHoursForBranch(branchLabel, date);
  return hours ? slotsBetween(hours) : [];
}

/**
 * Time slots available for a branch on a given date key, factoring in
 * "now" so that slots earlier today are not offered.
 */
export function availableTimeSlotsForBranch(
  dateKey: string,
  now: Date,
  branchLabel: string,
): string[] {
  const slots = allTimeSlotsForBranchDay(branchLabel, fromDateKey(dateKey));
  if (dateKey !== toDateKey(now)) {
    return slots;
  }
  const nowMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  return slots.filter((slot) => timeToMinutes(slot) > nowMinutes);
}

/** Whether `time` is one of the branch's configured slot start times on that date. */
export function isValidTimeSlotForBranch(
  time: string,
  branchLabel: string,
  dateKey: string,
): boolean {
  return allTimeSlotsForBranchDay(branchLabel, fromDateKey(dateKey)).includes(time);
}

/**
 * List of selectable date keys for a branch's date picker, spanning the
 * booking window, excluding days the branch is closed.
 */
export function selectableDateKeysForBranch(
  now: Date,
  branchLabel: string,
): string[] {
  const keys: string[] = [];
  for (let i = 0; i <= scheduling.bookingWindowDays; i++) {
    const candidate = new Date(now);
    candidate.setUTCDate(candidate.getUTCDate() + i);
    if (!isBranchOpenOn(branchLabel, candidate)) continue;
    const dateKey = toDateKey(candidate);
    if (i === 0 && availableTimeSlotsForBranch(dateKey, now, branchLabel).length === 0) {
      continue;
    }
    keys.push(dateKey);
  }
  return keys;
}

/** Human-friendly formatting, e.g. "Mon, 22 Jul 2026", from a date key. */
export function formatDateKeyLong(dateKey: string): string {
  const date = fromDateKey(dateKey);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Human-friendly 12-hour time, e.g. "9:00 AM", from a "HH:mm" string.
 * Returns the input unchanged if it isn't a well-formed "HH:mm" string
 * (e.g. legacy data referencing a branch/date combination with no slots)
 * rather than crashing the page that's trying to display it.
 */
export function formatTimeLabel(time: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return time;
  const h = Number(match[1]);
  const m = Number(match[2]);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}
