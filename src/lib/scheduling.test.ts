import { test } from "node:test";
import assert from "node:assert/strict";
import {
  toDateKey,
  fromDateKey,
  isBranchOpenOn,
  validateDateKeyForBranch,
  allTimeSlotsForBranchDay,
  availableTimeSlotsForBranch,
  isValidTimeSlotForBranch,
  selectableDateKeysForBranch,
  formatTimeLabel,
} from "./scheduling";

// Wednesday, 22 July 2026, 10:00 UTC (Accra time).
const NOW = new Date(Date.UTC(2026, 6, 22, 10, 0, 0));

const OSU = "Osu";
const EAST_LEGON = "East Legon";
const KOFORIDUA = "Koforidua";

test("toDateKey/fromDateKey round-trip", () => {
  assert.equal(toDateKey(NOW), "2026-07-22");
  assert.equal(toDateKey(fromDateKey("2026-07-22")), "2026-07-22");
});

test("a default branch is open on weekdays and weekends", () => {
  // 2026-07-25 is a Saturday, 2026-07-26 is a Sunday.
  assert.equal(isBranchOpenOn(OSU, new Date(Date.UTC(2026, 6, 20))), true); // Mon
  assert.equal(isBranchOpenOn(OSU, new Date(Date.UTC(2026, 6, 25))), true); // Sat
  assert.equal(isBranchOpenOn(OSU, new Date(Date.UTC(2026, 6, 26))), true); // Sun
});

test("Koforidua is closed on weekends but open on weekdays", () => {
  assert.equal(isBranchOpenOn(KOFORIDUA, new Date(Date.UTC(2026, 6, 20))), true); // Mon
  assert.equal(isBranchOpenOn(KOFORIDUA, new Date(Date.UTC(2026, 6, 25))), false); // Sat
  assert.equal(isBranchOpenOn(KOFORIDUA, new Date(Date.UTC(2026, 6, 26))), false); // Sun
});

test("validateDateKeyForBranch rejects past dates", () => {
  const result = validateDateKeyForBranch("2026-07-21", NOW, OSU);
  assert.equal(result.ok, false);
  assert.match(result.reason ?? "", /past/i);
});

test("validateDateKeyForBranch rejects weekends for Koforidua", () => {
  // 2026-07-26 is the next Sunday after NOW (2026-07-22, a Wednesday).
  const result = validateDateKeyForBranch("2026-07-26", NOW, KOFORIDUA);
  assert.equal(result.ok, false);
  assert.match(result.reason ?? "", /weekend/i);
});

test("validateDateKeyForBranch accepts weekends for a default branch", () => {
  const result = validateDateKeyForBranch("2026-07-26", NOW, OSU);
  assert.equal(result.ok, true);
});

test("validateDateKeyForBranch rejects dates beyond the booking window", () => {
  const result = validateDateKeyForBranch("2026-12-25", NOW, OSU);
  assert.equal(result.ok, false);
});

test("validateDateKeyForBranch accepts today and a valid weekday", () => {
  assert.equal(validateDateKeyForBranch("2026-07-22", NOW, OSU).ok, true);
  assert.equal(validateDateKeyForBranch("2026-07-27", NOW, OSU).ok, true); // Monday
});

test("validateDateKeyForBranch rejects malformed input", () => {
  assert.equal(validateDateKeyForBranch("not-a-date", NOW, OSU).ok, false);
});

test("default branch weekday slots run 8am-4pm in 30-minute steps", () => {
  const monday = fromDateKey("2026-07-27");
  const slots = allTimeSlotsForBranchDay(OSU, monday);
  assert.equal(slots[0], "08:00");
  assert.equal(slots[slots.length - 1], "15:30");
  assert.equal(slots.length, 16);
});

test("default branch weekend slots run 8am-2pm", () => {
  const saturday = fromDateKey("2026-07-25");
  const slots = allTimeSlotsForBranchDay(OSU, saturday);
  assert.equal(slots[0], "08:00");
  assert.equal(slots[slots.length - 1], "13:30");
  assert.equal(slots.length, 12);
});

test("East Legon has extended weekday hours (8am-7pm)", () => {
  const monday = fromDateKey("2026-07-27");
  const slots = allTimeSlotsForBranchDay(EAST_LEGON, monday);
  assert.equal(slots[0], "08:00");
  assert.equal(slots[slots.length - 1], "18:30");
});

test("East Legon still uses default weekend hours (8am-2pm)", () => {
  const saturday = fromDateKey("2026-07-25");
  const slots = allTimeSlotsForBranchDay(EAST_LEGON, saturday);
  assert.equal(slots[slots.length - 1], "13:30");
});

test("Koforidua has no slots at all on weekends", () => {
  const saturday = fromDateKey("2026-07-25");
  assert.deepEqual(allTimeSlotsForBranchDay(KOFORIDUA, saturday), []);
});

test("availableTimeSlotsForBranch filters out past slots for today only", () => {
  const todaySlots = availableTimeSlotsForBranch("2026-07-22", NOW, OSU); // now is 10:00
  assert.ok(todaySlots.every((s) => s > "10:00"));
  assert.ok(!todaySlots.includes("08:00"));

  const futureSlots = availableTimeSlotsForBranch("2026-07-27", NOW, OSU);
  assert.equal(futureSlots.length, allTimeSlotsForBranchDay(OSU, fromDateKey("2026-07-27")).length);
});

test("isValidTimeSlotForBranch validates against the branch's grid for that day", () => {
  assert.equal(isValidTimeSlotForBranch("08:00", OSU, "2026-07-27"), true);
  assert.equal(isValidTimeSlotForBranch("08:15", OSU, "2026-07-27"), false);
  assert.equal(isValidTimeSlotForBranch("16:00", OSU, "2026-07-27"), false); // past close
  assert.equal(isValidTimeSlotForBranch("08:00", KOFORIDUA, "2026-07-25"), false); // Koforidua Saturday
});

test("selectableDateKeysForBranch excludes Koforidua's weekends but keeps them for other branches", () => {
  const koforiduaKeys = selectableDateKeysForBranch(NOW, KOFORIDUA);
  assert.ok(!koforiduaKeys.includes("2026-07-25")); // Saturday
  assert.ok(!koforiduaKeys.includes("2026-07-26")); // Sunday
  assert.ok(koforiduaKeys.includes("2026-07-27")); // Monday

  const osuKeys = selectableDateKeysForBranch(NOW, OSU);
  assert.ok(osuKeys.includes("2026-07-25"));
  assert.ok(osuKeys.includes("2026-07-26"));
});

test("formatTimeLabel formats 24h time as 12h", () => {
  assert.equal(formatTimeLabel("09:00"), "9:00 AM");
  assert.equal(formatTimeLabel("13:30"), "1:30 PM");
  assert.equal(formatTimeLabel("00:00"), "12:00 AM");
});

test("formatTimeLabel returns malformed input unchanged instead of throwing", () => {
  assert.equal(formatTimeLabel(""), "");
  assert.equal(formatTimeLabel("not-a-time"), "not-a-time");
});
