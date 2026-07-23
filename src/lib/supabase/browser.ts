"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { checkPublicEnv } from "@/lib/env/public";

/**
 * Supabase client for Client Components. Uses only the public anon key.
 * Only call this after confirming `isPublicEnvConfigured()` — like
 * `createSupabaseServerClient`, this throws immediately if the URL/key
 * are missing, since the underlying SDK validates them eagerly.
 */
export function createSupabaseBrowserClient() {
  const { values } = checkPublicEnv();
  return createBrowserClient<Database>(values.supabaseUrl, values.supabaseAnonKey);
}
