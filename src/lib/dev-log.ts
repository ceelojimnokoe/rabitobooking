/**
 * Development-only diagnostic logging. No-ops in production builds.
 *
 * Rules for callers: pass error codes, operation names and non-sensitive
 * identifiers (e.g. an appointment id). Never pass passwords, API keys,
 * or full patient contact details (name/phone/email) — a truncated or
 * redacted form is fine if context is genuinely useful.
 *
 * Safe to import from both Client and Server Components — it only reads
 * `NODE_ENV`, which Next.js inlines on both sides.
 */

const isDev = process.env.NODE_ENV !== "production";

export function devLog(scope: string, details: Record<string, unknown>): void {
  if (!isDev) return;
  console.error(`[dev:${scope}]`, details);
}
