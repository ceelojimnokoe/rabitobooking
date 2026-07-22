import { test } from "node:test";
import assert from "node:assert/strict";
import { generateRequestReference, generateAppointmentReference } from "./reference";

test("generateRequestReference has the REQ-<year>-<code> shape", () => {
  const ref = generateRequestReference(new Date(Date.UTC(2026, 0, 1)));
  assert.match(ref, /^REQ-2026-[A-Z0-9]{6}$/);
});

test("generateAppointmentReference has the RAB-<year>-<code> shape", () => {
  const ref = generateAppointmentReference(new Date(Date.UTC(2026, 0, 1)));
  assert.match(ref, /^RAB-2026-[A-Z0-9]{6}$/);
});

test("generated references are not predictably identical", () => {
  const refs = new Set(
    Array.from({ length: 50 }, () => generateRequestReference()),
  );
  assert.equal(refs.size, 50);
});

test("generated codes avoid ambiguous characters (0/O/1/I)", () => {
  for (let i = 0; i < 50; i++) {
    const ref = generateRequestReference();
    const code = ref.split("-")[2];
    assert.doesNotMatch(code, /[01OI]/);
  }
});
