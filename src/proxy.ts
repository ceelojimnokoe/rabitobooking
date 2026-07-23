import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAllowlistedAdminEmail } from "@/lib/auth/admin";
import { checkPublicEnv } from "@/lib/env/public";

/**
 * Route protection for /admin/*. Runs before rendering, refreshes the
 * Supabase session cookies, and redirects away from admin pages when the
 * visitor is not signed in or not on the ADMIN_EMAILS allowlist. Every
 * admin page/route handler re-checks this server-side too (see
 * src/lib/auth/admin.ts) — this proxy is a fast first line of defense,
 * not the only one.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const { values: publicEnv, ok: publicEnvOk } = checkPublicEnv();
  const supabaseUrl = publicEnv.supabaseUrl;
  const supabaseAnonKey = publicEnv.supabaseAnonKey;

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  if (!publicEnvOk) {
    // Supabase isn't configured yet (fresh demo checkout). Let the request
    // through — the admin pages themselves show a clear "not configured"
    // message rather than the proxy failing opaquely.
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAllowed = isAllowlistedAdminEmail(user?.email);

  if (!isAllowed && !isLoginPage) {
    const loginUrl = new URL("/admin/login", request.url);
    if (user) {
      // Authenticated, but this email isn't on the ADMIN_EMAILS allowlist.
      loginUrl.searchParams.set("error", "not_allowlisted");
    }
    return NextResponse.redirect(loginUrl);
  }

  if (isAllowed && isLoginPage) {
    const dashboardUrl = new URL("/admin", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

// NOTE: despite the file/function rename from middleware -> proxy in
// Next.js 16, the matcher export is still named `config` (verified against
// the installed next@16.2.11 static analysis code).
export const config = {
  matcher: ["/admin/:path*"],
};
