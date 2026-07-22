import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { clinicIdentity } from "@/config/clinic";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Administrator Login — Rabito Clinic",
};

const ERROR_MESSAGES: Record<string, string> = {
  not_allowlisted:
    "That account signed in successfully, but it isn't on this demo's administrator allowlist (ADMIN_EMAILS). Ask whoever set up the demo to add your email.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] : undefined;

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-pale px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link href="/" className="text-lg font-bold text-navy">
            {clinicIdentity.shortName}
          </Link>
          <div className="mt-3 flex items-center justify-center gap-2 text-ink">
            <ShieldCheck className="size-5 text-navy" aria-hidden="true" />
            <h1 className="text-xl font-bold">Administrator login</h1>
          </div>
          <p className="mt-1 text-sm text-muted">
            Restricted to authorized clinic administrators.
          </p>
        </div>

        <div className="rounded-2xl border border-border-blue bg-white p-6 shadow-sm">
          {errorMessage ? (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/5 p-3.5"
            >
              <AlertTriangle
                className="mt-0.5 size-4 shrink-0 text-warning"
                aria-hidden="true"
              />
              <p className="text-sm text-ink">{errorMessage}</p>
            </div>
          ) : null}
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          <Link href="/" className="text-navy hover:underline">
            Return to homepage
          </Link>
        </p>
      </div>
    </div>
  );
}
