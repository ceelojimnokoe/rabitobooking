import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Privileged Supabase client using the service-role key. This bypasses Row
 * Level Security entirely, so it must never be imported into client
 * components and must only be used after the caller's identity has already
 * been verified (authenticated session + ADMIN_EMAILS allowlist, or the
 * server's own trusted booking-submission code path).
 *
 * The `server-only` import makes any accidental client-side import fail
 * the build instead of silently shipping the service-role key to browsers.
 *
 * Deliberately untyped (no `Database` generic): this project's single
 * table is accessed exclusively through the typed wrapper functions in
 * `src/lib/db/appointments.ts`, which apply explicit types at the
 * boundary. postgrest-js's generic inference for insert/update/select
 * chains proved unreliable with a hand-written Database type in this
 * dependency combination, so the wrapper module is the single place that
 * takes responsibility for correctness instead of fighting the generics
 * throughout the app.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
