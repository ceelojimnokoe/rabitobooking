/**
 * Validation for server-only environment variables. Guarded by
 * `server-only` so any accidental import from a Client Component fails
 * the build instead of silently bundling secrets into client JS.
 */
import "server-only";
import { cleanEnvValue, looksLikePlaceholder, wasQuoted, supabaseProjectRefFromUrl } from "./shared";
import { checkPublicEnv } from "./public";

export interface ServerEnvValues {
  supabaseUrl: string;
  serviceRoleKey: string;
  adminEmails: string[];
  resendApiKey: string;
  resendFromEmail: string;
}

export interface ServerEnvCheck {
  ok: boolean;
  issues: string[];
  warnings: string[];
  values: ServerEnvValues;
}

function parseAdminEmails(raw: string): string[] {
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Single source of truth for the ADMIN_EMAILS allowlist. Deliberately
 * lightweight (no JWT decoding, no `Buffer`) since this runs on every
 * /admin request via the proxy — including possibly the Edge runtime,
 * which doesn't guarantee Node.js built-ins like `Buffer`. The heavier
 * cross-project diagnostic checks live in `checkServerEnv()` below,
 * which nothing on the proxy's request path calls.
 */
export function getAdminAllowlist(): string[] {
  return parseAdminEmails(cleanEnvValue(process.env.ADMIN_EMAILS));
}

/** Decodes a Supabase JWT's payload (unsigned, non-secret) to read `ref`/`role`. */
function decodeSupabaseKeyClaims(token: string): { ref?: string; role?: string } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(Buffer.from(base64, "base64").toString("utf8"));
    return { ref: payload.ref, role: payload.role };
  } catch {
    return null;
  }
}

/**
 * Full server-env diagnostic: placeholder/format/quote checks plus the
 * cross-project consistency check (decodes JWTs via `Buffer`, so this is
 * Node-runtime only — call it from Route Handlers/Server Components/
 * scripts, never from `src/proxy.ts`).
 */
export function checkServerEnv(): ServerEnvCheck {
  const issues: string[] = [];
  const warnings: string[] = [];
  const pub = checkPublicEnv();

  const rawServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const serviceRoleKey = cleanEnvValue(rawServiceRoleKey);
  if (wasQuoted(rawServiceRoleKey)) {
    warnings.push(
      "SUPABASE_SERVICE_ROLE_KEY is wrapped in quotation marks in its raw value — harmless in .env.local (Next strips them), but if pasted with quotes into a dashboard like Vercel's, the quotes become part of the value.",
    );
  }
  if (!serviceRoleKey) {
    issues.push("SUPABASE_SERVICE_ROLE_KEY is missing.");
  } else if (looksLikePlaceholder(serviceRoleKey)) {
    issues.push("SUPABASE_SERVICE_ROLE_KEY looks like a placeholder value, not a real key.");
  }

  const adminEmails = getAdminAllowlist();
  if (adminEmails.length === 0) {
    warnings.push("ADMIN_EMAILS is empty — no one will be able to access /admin.");
  }

  const resendApiKey = cleanEnvValue(process.env.RESEND_API_KEY);
  const resendFromEmail = cleanEnvValue(process.env.RESEND_FROM_EMAIL);
  if (Boolean(resendApiKey) !== Boolean(resendFromEmail)) {
    warnings.push(
      "Only one of RESEND_API_KEY / RESEND_FROM_EMAIL is set. Both are required to send real email — falling back to preview-only mode until both are set.",
    );
  }

  // Cross-project consistency: catches pasting keys from a different
  // Supabase project than the URL (a common copy-paste mistake).
  if (pub.values.supabaseUrl && serviceRoleKey) {
    const urlRef = supabaseProjectRefFromUrl(pub.values.supabaseUrl);
    const anonClaims = decodeSupabaseKeyClaims(pub.values.supabaseAnonKey);
    const serviceClaims = decodeSupabaseKeyClaims(serviceRoleKey);

    if (urlRef && anonClaims?.ref && anonClaims.ref !== urlRef) {
      issues.push(
        "NEXT_PUBLIC_SUPABASE_ANON_KEY belongs to a different Supabase project than NEXT_PUBLIC_SUPABASE_URL.",
      );
    }
    if (anonClaims && anonClaims.role !== "anon") {
      warnings.push(`NEXT_PUBLIC_SUPABASE_ANON_KEY has role "${anonClaims.role}", expected "anon".`);
    }

    if (urlRef && serviceClaims?.ref && serviceClaims.ref !== urlRef) {
      issues.push(
        "SUPABASE_SERVICE_ROLE_KEY belongs to a different Supabase project than NEXT_PUBLIC_SUPABASE_URL.",
      );
    }
    if (serviceClaims && serviceClaims.role !== "service_role") {
      warnings.push(
        `SUPABASE_SERVICE_ROLE_KEY has role "${serviceClaims.role}", expected "service_role" (are the anon and service-role keys swapped?).`,
      );
    }
  }

  return {
    ok: pub.ok && issues.length === 0,
    issues: [...pub.issues, ...issues],
    warnings,
    values: {
      supabaseUrl: pub.values.supabaseUrl,
      serviceRoleKey,
      adminEmails,
      resendApiKey,
      resendFromEmail,
    },
  };
}

export function isServerEnvConfigured(): boolean {
  return checkServerEnv().ok;
}
