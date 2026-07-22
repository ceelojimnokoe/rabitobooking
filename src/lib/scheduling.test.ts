import { test } from "node:test";
import assert from "node:assert/strict";
import {
  toDateKey,
  fromDateKey,
  isWorkingDay,
  validateDateKey,
  allTimeSlotsForDay,
  availableTimeSlots,
  isValidTimeSlot,
  selectableDateKeys,
  formatTimeLabel,
} from "./scheduling";

// Wednesday, 22 July 2026, 10:00 UTC (Accra time).
const NOW = new Date(Date.UTC(2026, 6, 22, 10, 0, 0));

test("toDateKey/fromDateKey round-trip", () => {
  assert.equal(toDateKey(NOW), "2026-07-22");
  assert.equal(toDateKey(fromDateKey("2026-07-22")), "2026-07-22");
});

test("isWorkingDay excludes Sunday, includes Mon-Sat", () => {
  // 2026-07-19 is a Sunday.
  assert.equal(isWorkingDay(new Date(Date.UTC(2026, 6, 19))), false);
  assert.equal(isWorkingDay(new Date(Date.UTC(2026, 6, 20))), true); // Mon
  assert.equal(isWorkingDay(new Date(Date.UTC(2026, 6, 25))), true); // Sat
});

test("validateDateKey rejects past dates", () => {
  const result = validateDateKey("2026-07-21", NOW);
  assert.equal(result.ok, false);
  assert.match(result.reason ?? "", /past/i);
});

test("validateDateKey rejects Sundays", () => {
  // 2026-07-26 is the next Sunday after NOW (2026-07-22, a Wednesday).
  const result = validateDateKey("2026-07-26", NOW);
  assert.equal(result.ok, false);
  assert.match(result.reason ?? "", /sunday/i);
});

test("validateDateKey rejects dates beyond the booking window", () => {
  const result = validateDateKey("2026-12-25", NOW);
  assert.equal(result.ok, false);
});

test("validateDateKey accepts today and a valid weekday", () => {
  assert.equal(validateDateKey("2026-07-22", NOW).ok, true);
  assert.equal(validateDateKey("2026-07-27", NOW).ok, true); // Monday
});

test("validateDateKey rejects malformed input", () => {
  assert.equal(validateDateKey("not-a-date", NOW).ok, false);
});

test("allTimeSlotsForDay produces 30-minute slots from 9-5", () => {
  const slots = allTimeSlotsForDay();
  assert.equal(slots[0], "09:00");
  assert.equal(slots[slots.length - 1], "16:30");
  assert.equal(slots.length, 16);
});

test("availableTimeSlots filters out past slots for today only", () => {
  const todaySlots = availableTimeSlots("2026-07-22", NOW); // now is 10:00
  assert.ok(todaySlots.every((s) => s > "10:00"));
  assert.ok(!todaySlots.includes("09:00"));

  const futureSlots = availableTimeSlots("2026-07-27", NOW);
  assert.equal(futureSlots.length, allTimeSlotsForDay().length);
});

test("isValidTimeSlot validates against the configured grid", () => {
  assert.equal(isValidTimeSlot("09:00"), true);
  assert.equal(isValidTimeSlot("09:15"), false);
  assert.equal(isValidTimeSlot("17:00"), false);
});

test("selectableDateKeys excludes Sundays and includes today", () => {
  const keys = selectableDateKeys(NOW);
  assert.ok(keys.includes("2026-07-22"));
  assert.ok(!keys.includes("2026-07-26")); // future Sunday, excluded
  assert.ok(keys.every((k) => isWorkingDay(fromDateKey(k))));
});

test("formatTimeLabel formats 24h time as 12h", () => {
  assert.equal(formatTimeLabel("09:00"), "9:00 AM");
  assert.equal(formatTimeLabel("13:30"), "1:30 PM");
  assert.equal(formatTimeLabel("00:00"), "12:00 AM");
});
