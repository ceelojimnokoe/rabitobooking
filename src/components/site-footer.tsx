import Link from "next/link";
import { clinicIdentity, contactPlaceholders, demoDisclaimer } from "@/config/clinic";

export function SiteFooter() {
  return (
    <footer className="border-t border-border-blue bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="text-base font-bold text-navy">{clinicIdentity.name}</p>
            <p className="mt-2 text-sm text-muted">
              Online appointment requests, reviewed and confirmed by our clinic team.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Contact</p>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              <li>{contactPlaceholders.phone}</li>
              <li>{contactPlaceholders.email}</li>
              <li>{contactPlaceholders.address}</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Links</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <Link href="/book" className="text-navy hover:underline">
                  Book an appointment
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-navy hover:underline">
                  Administrator login
                </Link>
              </li>
            </ul>
          </div>
        </div>
        {demoDisclaimer ? (
          <p className="mt-8 border-t border-border-blue pt-6 text-xs text-muted">
            {demoDisclaimer}
          </p>
        ) : null}
      </div>
    </footer>
  );
}
