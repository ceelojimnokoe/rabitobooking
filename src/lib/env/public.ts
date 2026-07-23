/**
 * Validation for the three `NEXT_PUBLIC_*` variables. Safe to import from
 * Client Components — contains no server-only secrets and no Node-only
 * APIs. See `src/lib/env/server.ts` for the server-only counterpart.
 */
import { cleanEnvValue, looksLikePlaceholder, isValidSupabaseUrl } from "./shared";

export interface PublicEnvValues {
  supabaseUrl: string;
  supabaseAnonKey: string;
  appUrl: string;
}

export interface EnvCheck {
  ok: boolean;
  issues: string[];
}

export interface PublicEnvCheck extends EnvCheck {
  values: PublicEnvValues;
}

export function checkPublicEnv(): PublicEnvCheck {
  const issues: string[] = [];

  const supabaseUrl = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseAnonKey = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const appUrl = cleanEnvValue(process.env.NEXT_PUBLIC_APP_URL) || "http://localhost:3000";

  if (!supabaseUrl) {
    issues.push("NEXT_PUBLIC_SUPABASE_URL is missing.");
  } else if (looksLikePlaceholder(supabaseUrl)) {
    issues.push("NEXT_PUBLIC_SUPABASE_URL looks like a placeholder value, not a real project URL.");
  } else if (!isValidSupabaseUrl(supabaseUrl)) {
    issues.push(
      "NEXT_PUBLIC_SUPABASE_URL doesn't look like a Supabase project URL (expected https://<project-ref>.supabase.co).",
    );
  }

  if (!supabaseAnonKey) {
    issues.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.");
  } else if (looksLikePlaceholder(supabaseAnonKey)) {
    issues.push("NEXT_PUBLIC_SUPABASE_ANON_KEY looks like a placeholder value, not a real key.");
  }

  return { ok: issues.length === 0, issues, values: { supabaseUrl, supabaseAnonKey, appUrl } };
}

/** Cheap boolean check for UI branches (e.g. "show a not-configured notice"). */
export function isPublicEnvConfigured(): boolean {
  const { supabaseUrl, supabaseAnonKey } = checkPublicEnv().values;
  return Boolean(supabaseUrl && supabaseAnonKey);
}
