import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidGhanaPhone, normalizePhone } from "./phone";

test("accepts local 0-prefixed numbers", () => {
  assert.equal(isValidGhanaPhone("0244123456"), true);
});

test("accepts +233-prefixed numbers", () => {
  assert.equal(isValidGhanaPhone("+233244123456"), true);
});

test("accepts 233-prefixed numbers without a plus", () => {
  assert.equal(isValidGhanaPhone("233244123456"), true);
});

test("tolerates spaces, dashes and parentheses", () => {
  assert.equal(isValidGhanaPhone("024-412-3456"), true);
  assert.equal(isValidGhanaPhone("024 412 3456"), true);
  assert.equal(isValidGhanaPhone("+233 (24) 412-3456"), true);
});

test("rejects too-short or malformed numbers", () => {
  assert.equal(isValidGhanaPhone("12345"), false);
  assert.equal(isValidGhanaPhone("024412345"), false); // 9 digits after 0
  assert.equal(isValidGhanaPhone("abcdefghij"), false);
  assert.equal(isValidGhanaPhone(""), false);
});

test("normalizePhone strips separators", () => {
  assert.equal(normalizePhone(" 024-412 3456 "), "0244123456");
});
