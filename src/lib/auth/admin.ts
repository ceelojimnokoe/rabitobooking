import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Parses the comma-separated ADMIN_EMAILS env var into a normalized list. */
export function getAdminAllowlist(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowlistedAdminEmail(
  email: string | null | undefined,
): boolean {
  if (!email) return false;
  return getAdminAllowlist().includes(email.toLowerCase());
}

export interface AdminSession {
  userId: string;
  email: string;
}

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/**
 * Returns the current admin session only if the caller has a valid
 * Supabase session AND their email is on the ADMIN_EMAILS allowlist.
 * This is the single source of truth for "is this request an admin" —
 * called from the proxy (for redirects) and again from every admin
 * page/route handler (defense in depth).
 *
 * Returns null (rather than throwing) when Supabase isn't configured yet,
 * so unconfigured demo checkouts redirect to a clear login-page notice
 * instead of a 500 error.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !user.email) return null;
  if (!isAllowlistedAdminEmail(user.email)) return null;

  return { userId: user.id, email: user.email };
}
