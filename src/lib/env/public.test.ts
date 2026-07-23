import { test } from "node:test";
import assert from "node:assert/strict";
import { checkPublicEnv, isPublicEnvConfigured } from "./public";

const KEYS = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "NEXT_PUBLIC_APP_URL"] as const;

function snapshot() {
  return Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
}
function restore(snap: Record<string, string | undefined>) {
  for (const k of KEYS) {
    if (snap[k] === undefined) delete process.env[k];
    else process.env[k] = snap[k];
  }
}

test("checkPublicEnv reports missing values", () => {
  const snap = snapshot();
  try {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const result = checkPublicEnv();
    assert.equal(result.ok, false);
    assert.ok(result.issues.some((i) => i.includes("NEXT_PUBLIC_SUPABASE_URL")));
    assert.ok(result.issues.some((i) => i.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY")));
    assert.equal(isPublicEnvConfigured(), false);
  } finally {
    restore(snap);
  }
});

test("checkPublicEnv accepts a well-formed configuration and strips quotes", () => {
  const snap = snapshot();
  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = '"https://hqewzupbhjzfloxbffpw.supabase.co"';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "a-real-looking-anon-key-value";
    const result = checkPublicEnv();
    assert.equal(result.ok, true);
    assert.deepEqual(result.issues, []);
    assert.equal(result.values.supabaseUrl, "https://hqewzupbhjzfloxbffpw.supabase.co");
    assert.equal(isPublicEnvConfigured(), true);
  } finally {
    restore(snap);
  }
});

test("checkPublicEnv flags a malformed Supabase URL", () => {
  const snap = snapshot();
  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://not-supabase.example.com";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "a-real-looking-anon-key-value";
    const result = checkPublicEnv();
    assert.equal(result.ok, false);
    assert.ok(result.issues.some((i) => /doesn't look like a Supabase project URL/.test(i)));
  } finally {
    restore(snap);
  }
});

test("checkPublicEnv flags placeholder values", () => {
  const snap = snapshot();
  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "your-project-url";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "changeme";
    const result = checkPublicEnv();
    assert.equal(result.ok, false);
    assert.ok(result.issues.some((i) => i.includes("placeholder")));
  } finally {
    restore(snap);
  }
});

test("checkPublicEnv defaults NEXT_PUBLIC_APP_URL to localhost when unset", () => {
  const snap = snapshot();
  try {
    delete process.env.NEXT_PUBLIC_APP_URL;
    const result = checkPublicEnv();
    assert.equal(result.values.appUrl, "http://localhost:3000");
  } finally {
    restore(snap);
  }
});
