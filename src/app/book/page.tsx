import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BookingWizard } from "@/components/booking/booking-wizard";

export const metadata: Metadata = {
  title: "Book an Appointment — Rabito Clinic",
  description: "Request a clinic appointment in a few simple steps.",
};

export default function BookPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1 bg-pale">
        <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
          <div className="rounded-2xl border border-border-blue bg-white p-5 shadow-sm sm:p-8">
            <BookingWizard />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
