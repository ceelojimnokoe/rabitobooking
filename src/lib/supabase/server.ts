import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { checkPublicEnv } from "@/lib/env/public";

/**
 * Supabase client for Server Components / Route Handlers, bound to the
 * incoming request's cookies. Uses only the public anon key — this client
 * is for checking *who is signed in*, not for privileged data access (use
 * `createSupabaseAdminClient` for that, after verifying the session below).
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { values } = checkPublicEnv();

  return createServerClient<Database>(
    values.supabaseUrl,
    values.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component that can't set cookies —
            // the proxy (middleware) is responsible for refreshing the
            // session in that case.
          }
        },
      },
    },
  );
}
