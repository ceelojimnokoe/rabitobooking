import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminAllowlist, isServerEnvConfigured } from "@/lib/env/server";
import { isPublicEnvConfigured } from "@/lib/env/public";
import { devLog } from "@/lib/dev-log";

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
  // Only the public vars are needed to check a session; requiring the
  // service-role key here too would needlessly block login while, say,
  // Resend env vars are still being set up.
  if (!isPublicEnvConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    devLog("admin-session", { code: error.code, status: error.status, name: error.name });
    return null;
  }
  if (!user || !user.email) return null;

  if (!isAllowlistedAdminEmail(user.email)) {
    if (!isServerEnvConfigured()) {
      devLog("admin-session", {
        note: "ADMIN_EMAILS or another server-only var is missing/invalid — see checkServerEnv().issues",
      });
    }
    return null;
  }

  return { userId: user.id, email: user.email };
}
