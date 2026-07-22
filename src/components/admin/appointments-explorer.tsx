"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Download } from "lucide-react";
import type { AppointmentRow, AppointmentStatus } from "@/types/appointment";
import { services, branches, patientTypes } from "@/config/clinic";
import { formatDateKeyLong, formatTimeLabel, toDateKey } from "@/lib/scheduling";
import { exportAppointmentsToXlsx } from "@/lib/xlsx-export";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function patientTypeLabel(id: string): string {
  return patientTypes.find((t) => t.id === id)?.label ?? id;
}

function NewBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-navy px-2 py-0.5 text-[11px] font-semibold text-white">
      New
    </span>
  );
}

const STATUS_OPTIONS: { value: AppointmentStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

function formatSubmittedAt(iso: string): string {
  // Fixed timeZone so this Client Component renders identically on the
  // server and during hydration, regardless of either machine's local
  // timezone (see the scheduling.ts header comment on Accra = UTC+0).
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(iso));
}

const selectClasses =
  "min-h-11 rounded-lg border border-border-blue bg-white px-3 py-2 text-sm text-ink focus:border-navy focus:outline-none focus-visible:outline-2 focus-visible:outline-navy";

export function AppointmentsExplorer({
  appointments,
}: {
  appointments: AppointmentRow[];
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AppointmentStatus | "all">("all");
  const [service, setService] = useState<string>("all");
  const [branch, setBranch] = useState<string>("all");
  const [patientType, setPatientType] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return appointments
      .filter((a) => (status === "all" ? true : a.status === status))
      .filter((a) => (service === "all" ? true : a.service === service))
      .filter((a) =>
        branch === "all"
          ? true
          : a.requested_branch === branch || a.confirmed_branch === branch,
      )
      .filter((a) => (patientType === "all" ? true : a.patient_type === patientType))
      .filter((a) => (dateFrom ? a.requested_date >= dateFrom : true))
      .filter((a) => (dateTo ? a.requested_date <= dateTo : true))
      .filter((a) => {
        if (!query) return true;
        return (
          a.patient_name.toLowerCase().includes(query) ||
          a.email.toLowerCase().includes(query) ||
          a.phone.toLowerCase().includes(query) ||
          a.request_reference.toLowerCase().includes(query) ||
          (a.appointment_reference?.toLowerCase().includes(query) ?? false)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }, [appointments, search, status, service, branch, patientType, dateFrom, dateTo]);

  function handleExport() {
    const filename = `rabito-appointments-${toDateKey(new Date())}.xlsx`;
    exportAppointmentsToXlsx(filtered, filename);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border-blue bg-white p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 sm:min-w-[220px]">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <label htmlFor="search" className="sr-only">
            Search by name, email, phone or reference
          </label>
          <input
            id="search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone or reference"
            className="min-h-11 w-full rounded-lg border border-border-blue bg-white py-2 pl-9 pr-3 text-sm text-ink focus:border-navy focus:outline-none focus-visible:outline-2 focus-visible:outline-navy"
          />
        </div>

        <label className="sr-only" htmlFor="status-filter">
          Filter by status
        </label>
        <select
          id="status-filter"
          value={status}
          onChange={(e) => setStatus(e.target.value as AppointmentStatus | "all")}
          className={selectClasses}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="service-filter">
          Filter by service
        </label>
        <select
          id="service-filter"
          value={service}
          onChange={(e) => setService(e.target.value)}
          className={selectClasses}
        >
          <option value="all">All services</option>
          {services.map((s) => (
            <option key={s.id} value={s.label}>
              {s.label}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="branch-filter">
          Filter by branch
        </label>
        <select
          id="branch-filter"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className={selectClasses}
        >
          <option value="all">All branches</option>
          {branches.map((b) => (
            <option key={b.id} value={b.label}>
              {b.label}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="patient-type-filter">
          Filter by patient type
        </label>
        <select
          id="patient-type-filter"
          value={patientType}
          onChange={(e) => setPatientType(e.target.value)}
          className={selectClasses}
        >
          <option value="all">New &amp; existing patients</option>
          {patientTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <label htmlFor="date-from" className="text-xs font-medium text-muted">
            From
          </label>
          <input
            id="date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className={selectClasses}
          />
          <label htmlFor="date-to" className="text-xs font-medium text-muted">
            To
          </label>
          <input
            id="date-to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className={selectClasses}
          />
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={handleExport}
          disabled={filtered.length === 0}
          className="sm:ml-auto"
        >
          <Download className="size-4" aria-hidden="true" />
          Export to Excel
        </Button>
      </div>

      {appointments.length === 0 ? (
        <div className="rounded-xl border border-border-blue bg-white p-10 text-center">
          <p className="text-sm font-medium text-ink">No requests yet.</p>
          <p className="mt-1 text-sm text-muted">
            Appointment requests submitted from the public booking page will
            appear here.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border-blue bg-white p-10 text-center">
          <p className="text-sm font-medium text-ink">
            No requests match your filters.
          </p>
          <p className="mt-1 text-sm text-muted">
            Try clearing the search or filters above.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border border-border-blue bg-white lg:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border-blue bg-pale text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Preferred date &amp; time</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b border-border-blue last:border-0">
                    <td className="px-4 py-3 font-medium text-ink">
                      <span className="flex items-center gap-2">
                        {a.patient_name}
                        {a.status === "pending" && !a.viewed_at ? <NewBadge /> : null}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink">{a.service}</td>
                    <td className="px-4 py-3 text-ink">
                      {a.confirmed_branch ?? a.requested_branch}
                    </td>
                    <td className="px-4 py-3 text-ink">
                      {formatDateKeyLong(a.requested_date)} &middot;{" "}
                      {formatTimeLabel(a.requested_time)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {a.appointment_reference ?? a.request_reference}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {formatSubmittedAt(a.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/appointments/${a.id}`}
                        className="font-semibold text-navy hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 lg:hidden">
            {filtered.map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-border-blue bg-white p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="flex items-center gap-2 font-semibold text-ink">
                      {a.patient_name}
                      {a.status === "pending" && !a.viewed_at ? <NewBadge /> : null}
                    </p>
                    <p className="text-xs text-muted">{a.service}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="text-muted">Branch</dt>
                    <dd className="font-medium text-ink">
                      {a.confirmed_branch ?? a.requested_branch}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Patient type</dt>
                    <dd className="font-medium text-ink">
                      {patientTypeLabel(a.patient_type)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Preferred</dt>
                    <dd className="font-medium text-ink">
                      {formatDateKeyLong(a.requested_date)}{" "}
                      {formatTimeLabel(a.requested_time)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Reference</dt>
                    <dd className="font-mono font-medium text-ink">
                      {a.appointment_reference ?? a.request_reference}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Submitted</dt>
                    <dd className="font-medium text-ink">
                      {formatSubmittedAt(a.created_at)}
                    </dd>
                  </div>
                </dl>
                <Link
                  href={`/admin/appointments/${a.id}`}
                  className="mt-3 inline-block text-sm font-semibold text-navy hover:underline"
                >
                  View details
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
