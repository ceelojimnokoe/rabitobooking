import { test } from "node:test";
import assert from "node:assert/strict";
import { hasSlotConflict, findSlotConflict } from "./conflicts";

const existing = [
  { id: "1", branch: "Accra Clinic", date: "2026-07-22", time: "09:00" },
  { id: "2", branch: "Tema Clinic", date: "2026-07-22", time: "09:00" },
];

test("detects a conflict for the same branch/date/time", () => {
  assert.equal(
    hasSlotConflict(existing, {
      branch: "Accra Clinic",
      date: "2026-07-22",
      time: "09:00",
    }),
    true,
  );
});

test("no conflict for a different time", () => {
  assert.equal(
    hasSlotConflict(existing, {
      branch: "Accra Clinic",
      date: "2026-07-22",
      time: "09:30",
    }),
    false,
  );
});

test("no conflict for a different branch at the same time", () => {
  assert.equal(
    hasSlotConflict(existing, {
      branch: "Kumasi Clinic",
      date: "2026-07-22",
      time: "09:00",
    }),
    false,
  );
});

test("excludeId allows an appointment to keep its own slot", () => {
  assert.equal(
    hasSlotConflict(existing, {
      branch: "Accra Clinic",
      date: "2026-07-22",
      time: "09:00",
      excludeId: "1",
    }),
    false,
  );
});

test("findSlotConflict returns the conflicting booking", () => {
  const conflict = findSlotConflict(existing, {
    branch: "Accra Clinic",
    date: "2026-07-22",
    time: "09:00",
  });
  assert.equal(conflict?.id, "1");
});
