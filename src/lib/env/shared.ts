/**
 * Framework-agnostic env-value helpers shared by both the public and
 * server-only validators. No Node-only APIs here (besides `atob`-style
 * base64 decoding done manually) so this stays safe to bundle client-side.
 */

/**
 * Trims whitespace and defensively strips ONE layer of accidental
 * wrapping quotes.
 *
 * Next's own env loader (and Node's `--env-file`) already strip quotes
 * from `.env*` files correctly, so this isn't needed for local dev. It
 * matters for platforms like Vercel's dashboard, which store an env var's
 * value verbatim — if someone copy-pastes `KEY="value"` into the *value*
 * field there, the quotes become part of the literal value in production.
 */
export function cleanEnvValue(raw: string | undefined | null): string {
  if (!raw) return "";
  let value = raw.trim();
  const wrappedInDoubleQuotes = value.startsWith('"') && value.endsWith('"') && value.length >= 2;
  const wrappedInSingleQuotes = value.startsWith("'") && value.endsWith("'") && value.length >= 2;
  if (wrappedInDoubleQuotes || wrappedInSingleQuotes) {
    value = value.slice(1, -1).trim();
  }
  return value;
}

/** True if the raw (untrimmed) value was wrapped in quotes, before cleaning. */
export function wasQuoted(raw: string | undefined | null): boolean {
  if (!raw) return false;
  const trimmed = raw.trim();
  return (
    (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'") && trimmed.length >= 2)
  );
}

const PLACEHOLDER_PATTERN = /^(your[-_]|xxx+$|changeme|placeholder|<.*>|replace[-_]me)/i;

export function looksLikePlaceholder(value: string): boolean {
  return value.length === 0 || PLACEHOLDER_PATTERN.test(value);
}

const SUPABASE_URL_PATTERN = /^https:\/\/([a-z0-9]+)\.supabase\.co\/?$/i;

export function supabaseProjectRefFromUrl(url: string): string | null {
  const match = url.match(SUPABASE_URL_PATTERN);
  return match ? match[1].toLowerCase() : null;
}

export function isValidSupabaseUrl(url: string): boolean {
  return SUPABASE_URL_PATTERN.test(url);
}
