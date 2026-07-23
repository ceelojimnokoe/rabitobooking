import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cleanEnvValue,
  wasQuoted,
  looksLikePlaceholder,
  isValidSupabaseUrl,
  supabaseProjectRefFromUrl,
} from "./shared";

test("cleanEnvValue strips one layer of wrapping quotes and trims", () => {
  assert.equal(cleanEnvValue('"https://abc.supabase.co"'), "https://abc.supabase.co");
  assert.equal(cleanEnvValue("'value'"), "value");
  assert.equal(cleanEnvValue("  plain  "), "plain");
  assert.equal(cleanEnvValue(undefined), "");
  assert.equal(cleanEnvValue(""), "");
});

test("cleanEnvValue does not strip mismatched or partial quotes", () => {
  assert.equal(cleanEnvValue('"mismatched\''), '"mismatched\'');
  assert.equal(cleanEnvValue('"'), '"');
});

test("wasQuoted detects quote-wrapped raw values", () => {
  assert.equal(wasQuoted('"value"'), true);
  assert.equal(wasQuoted("'value'"), true);
  assert.equal(wasQuoted("value"), false);
  assert.equal(wasQuoted(undefined), false);
});

test("looksLikePlaceholder flags empty and obvious placeholder strings", () => {
  assert.equal(looksLikePlaceholder(""), true);
  assert.equal(looksLikePlaceholder("your-anon-key"), true);
  assert.equal(looksLikePlaceholder("changeme"), true);
  assert.equal(looksLikePlaceholder("<your-key-here>"), true);
  assert.equal(looksLikePlaceholder("eyJhbGciOiJIUzI1NiJ9.real.key"), false);
});

test("isValidSupabaseUrl accepts only https://<ref>.supabase.co", () => {
  assert.equal(isValidSupabaseUrl("https://hqewzupbhjzfloxbffpw.supabase.co"), true);
  assert.equal(isValidSupabaseUrl("http://hqewzupbhjzfloxbffpw.supabase.co"), false);
  assert.equal(isValidSupabaseUrl("https://example.com"), false);
  assert.equal(isValidSupabaseUrl("not-a-url"), false);
});

test("supabaseProjectRefFromUrl extracts the project ref", () => {
  assert.equal(
    supabaseProjectRefFromUrl("https://hqewzupbhjzfloxbffpw.supabase.co"),
    "hqewzupbhjzfloxbffpw",
  );
  assert.equal(supabaseProjectRefFromUrl("https://example.com"), null);
});
