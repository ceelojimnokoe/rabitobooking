import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/admin";
import { clinicIdentity } from "@/config/clinic";
import { SignOutButton } from "@/components/admin/sign-out-button";

// Always render per-request. Without this, a build that happens to run
// without Supabase env vars configured (so the auth check short-circuits
// before touching the dynamic cookies() API) could get statically cached,
// serving admin pages without re-checking auth on every request.
export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-pale">
      <header className="border-b border-border-blue bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/admin" className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-navy">
              {clinicIdentity.shortName}
            </span>
            <span className="text-sm font-medium text-muted">Admin</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:inline">
              {session.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
      </main>
    </div>
  );
}
