import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Supabase client for Server Components / Route Handlers, bound to the
 * incoming request's cookies. Uses only the public anon key — this client
 * is for checking *who is signed in*, not for privileged data access (use
 * `createSupabaseAdminClient` for that, after verifying the session below).
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
