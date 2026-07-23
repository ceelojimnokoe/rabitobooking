import { test } from "node:test";
import assert from "node:assert/strict";
import { checkServerEnv, getAdminAllowlist, isServerEnvConfigured } from "./server";

const KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ADMIN_EMAILS",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
] as const;

function snapshot() {
  return Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
}
function restore(snap: Record<string, string | undefined>) {
  for (const k of KEYS) {
    if (snap[k] === undefined) delete process.env[k];
    else process.env[k] = snap[k];
  }
}

/** Builds an unsigned-but-well-formed JWT for testing claim decoding only. */
function fakeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.fake-signature`;
}

test("getAdminAllowlist parses, trims, lowercases and drops empty entries", () => {
  const snap = snapshot();
  try {
    process.env.ADMIN_EMAILS = " Admin@Example.com ,, second@Example.COM ,";
    assert.deepEqual(getAdminAllowlist(), ["admin@example.com", "second@example.com"]);
  } finally {
    restore(snap);
  }
});

test("getAdminAllowlist returns an empty array when unset", () => {
  const snap = snapshot();
  try {
    delete process.env.ADMIN_EMAILS;
    assert.deepEqual(getAdminAllowlist(), []);
  } finally {
    restore(snap);
  }
});

test("checkServerEnv reports missing service-role key", () => {
  const snap = snapshot();
  try {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const result = checkServerEnv();
    assert.equal(result.ok, false);
    assert.ok(result.issues.some((i) => i.includes("SUPABASE_SERVICE_ROLE_KEY")));
  } finally {
    restore(snap);
  }
});

test("checkServerEnv warns (but doesn't fail) when Resend is only half-configured", () => {
  const snap = snapshot();
  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://hqewzupbhjzfloxbffpw.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = fakeJwt({ ref: "hqewzupbhjzfloxbffpw", role: "anon" });
    process.env.SUPABASE_SERVICE_ROLE_KEY = fakeJwt({ ref: "hqewzupbhjzfloxbffpw", role: "service_role" });
    process.env.RESEND_API_KEY = "re_something";
    delete process.env.RESEND_FROM_EMAIL;

    const result = checkServerEnv();
    assert.equal(result.ok, true, `expected ok, got issues: ${result.issues.join("; ")}`);
    assert.ok(result.warnings.some((w) => /Only one of RESEND_API_KEY/.test(w)));
  } finally {
    restore(snap);
  }
});

test("checkServerEnv warns when ADMIN_EMAILS is empty", () => {
  const snap = snapshot();
  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://hqewzupbhjzfloxbffpw.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = fakeJwt({ ref: "hqewzupbhjzfloxbffpw", role: "anon" });
    process.env.SUPABASE_SERVICE_ROLE_KEY = fakeJwt({ ref: "hqewzupbhjzfloxbffpw", role: "service_role" });
    delete process.env.ADMIN_EMAILS;

    const result = checkServerEnv();
    assert.ok(result.warnings.some((w) => w.includes("ADMIN_EMAILS is empty")));
  } finally {
    restore(snap);
  }
});

test("checkServerEnv flags a service-role key from a different Supabase project", () => {
  const snap = snapshot();
  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://hqewzupbhjzfloxbffpw.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = fakeJwt({ ref: "hqewzupbhjzfloxbffpw", role: "anon" });
    process.env.SUPABASE_SERVICE_ROLE_KEY = fakeJwt({ ref: "some-other-project", role: "service_role" });

    const result = checkServerEnv();
    assert.equal(result.ok, false);
    assert.ok(result.issues.some((i) => /SUPABASE_SERVICE_ROLE_KEY belongs to a different Supabase project/.test(i)));
  } finally {
    restore(snap);
  }
});

test("checkServerEnv flags an anon key from a different Supabase project", () => {
  const snap = snapshot();
  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://hqewzupbhjzfloxbffpw.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = fakeJwt({ ref: "some-other-project", role: "anon" });
    process.env.SUPABASE_SERVICE_ROLE_KEY = fakeJwt({ ref: "hqewzupbhjzfloxbffpw", role: "service_role" });

    const result = checkServerEnv();
    assert.equal(result.ok, false);
    assert.ok(result.issues.some((i) => /NEXT_PUBLIC_SUPABASE_ANON_KEY belongs to a different Supabase project/.test(i)));
  } finally {
    restore(snap);
  }
});

test("checkServerEnv warns when anon/service-role keys look swapped", () => {
  const snap = snapshot();
  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://hqewzupbhjzfloxbffpw.supabase.co";
    // Swapped: anon key has role "service_role", service key has role "anon".
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = fakeJwt({ ref: "hqewzupbhjzfloxbffpw", role: "service_role" });
    process.env.SUPABASE_SERVICE_ROLE_KEY = fakeJwt({ ref: "hqewzupbhjzfloxbffpw", role: "anon" });

    const result = checkServerEnv();
    assert.ok(result.warnings.some((w) => /expected "anon"/.test(w)));
    assert.ok(result.warnings.some((w) => /swapped/.test(w)));
  } finally {
    restore(snap);
  }
});

test("isServerEnvConfigured mirrors checkServerEnv().ok", () => {
  const snap = snapshot();
  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://hqewzupbhjzfloxbffpw.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = fakeJwt({ ref: "hqewzupbhjzfloxbffpw", role: "anon" });
    process.env.SUPABASE_SERVICE_ROLE_KEY = fakeJwt({ ref: "hqewzupbhjzfloxbffpw", role: "service_role" });
    assert.equal(isServerEnvConfigured(), true);

    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    assert.equal(isServerEnvConfigured(), false);
  } finally {
    restore(snap);
  }
});
