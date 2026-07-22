"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Mail } from "lucide-react";
import type { AppointmentRow } from "@/types/appointment";
import { branches, teams } from "@/config/clinic";
import {
  allTimeSlotsForDay,
  formatTimeLabel,
  toDateKey,
  formatDateKeyLong,
} from "@/lib/scheduling";
import { Button } from "@/components/ui/button";
import { fieldInputClasses } from "@/components/booking/field";
import { ConfirmModal } from "./confirm-modal";
import { EmailPreviewViewer } from "./email-preview-viewer";
import {
  confirmAppointmentAction,
  rejectAppointmentAction,
  updateInternalNoteAction,
} from "@/lib/actions/appointment-actions";

const selectClasses = fieldInputClasses;

export function AdminActionsPanel({ appointment }: { appointment: AppointmentRow }) {
  const [branch, setBranch] = useState(
    appointment.confirmed_branch ?? appointment.requested_branch,
  );
  const [date, setDate] = useState(
    appointment.confirmed_date ?? appointment.requested_date,
  );
  const [time, setTime] = useState(
    appointment.confirmed_time ?? appointment.requested_time,
  );
  const [assignedTeam, setAssignedTeam] = useState(appointment.assigned_team ?? "");
  const [rejectReason, setRejectReason] = useState("");
  const [internalNote, setInternalNote] = useState(appointment.internal_note ?? "");

  const [modal, setModal] = useState<"confirm" | "reject" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    status: "confirmed" | "rejected";
    appointmentReference?: string;
    emailStatus: string;
  } | null>(null);
  const [noteSaved, setNoteSaved] = useState(false);

  const isPending = appointment.status === "pending" && !result;
  const minDate = toDateKey(new Date());

  async function handleConfirm() {
    setIsSubmitting(true);
    setActionError(null);
    const response = await confirmAppointmentAction({
      appointmentId: appointment.id,
      branch,
      date,
      time,
      assignedTeam: assignedTeam || undefined,
    });
    setIsSubmitting(false);
    setModal(null);

    if (!response.success) {
      setActionError(response.error);
      return;
    }
    setResult({
      status: "confirmed",
      appointmentReference: response.data.appointmentReference,
      emailStatus: response.data.emailStatus,
    });
  }

  async function handleReject() {
    setIsSubmitting(true);
    setActionError(null);
    const response = await rejectAppointmentAction({
      appointmentId: appointment.id,
      reason: rejectReason,
    });
    setIsSubmitting(false);
    setModal(null);

    if (!response.success) {
      setActionError(response.error);
      return;
    }
    setResult({ status: "rejected", emailStatus: response.data.emailStatus });
  }

  async function handleSaveNote() {
    setIsSavingNote(true);
    setNoteSaved(false);
    const response = await updateInternalNoteAction(appointment.id, internalNote);
    setIsSavingNote(false);
    if (response.success) setNoteSaved(true);
  }

  const emailPreview = appointment.email_preview;

  return (
    <div className="flex flex-col gap-6">
      {result ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/5 p-4"
        >
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
          <div>
            <p className="font-semibold text-ink">
              {result.status === "confirmed"
                ? "Appointment confirmed"
                : "Request rejected"}
            </p>
            {result.appointmentReference ? (
              <p className="mt-1 text-sm text-ink">
                Appointment reference:{" "}
                <span className="font-mono font-semibold">
                  {result.appointmentReference}
                </span>
              </p>
            ) : null}
            <p className="mt-1 text-sm text-muted">
              Email delivery:{" "}
              {result.emailStatus === "sent"
                ? "sent"
                : result.emailStatus === "preview_only"
                  ? "preview only (Resend not configured)"
                  : "failed"}
            </p>
          </div>
        </div>
      ) : null}

      {actionError ? (
        <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-error/30 bg-error/5 p-3.5">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-error" aria-hidden="true" />
          <p className="text-sm text-error">{actionError}</p>
        </div>
      ) : null}

      {isPending ? (
        <div className="rounded-xl border border-border-blue bg-white p-5">
          <h2 className="text-base font-bold text-ink">Confirm this appointment</h2>
          <p className="mt-1 text-sm text-muted">
            Adjust the branch, date or time if needed, then confirm.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="final-branch" className="text-sm font-semibold text-ink">
                Branch
              </label>
              <select
                id="final-branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className={selectClasses}
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.label}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="final-team" className="text-sm font-semibold text-ink">
                Team / department (optional)
              </label>
              <select
                id="final-team"
                value={assignedTeam}
                onChange={(e) => setAssignedTeam(e.target.value)}
                className={selectClasses}
              >
                <option value="">Not assigned</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.label}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="final-date" className="text-sm font-semibold text-ink">
                Date
              </label>
              <input
                id="final-date"
                type="date"
                min={minDate}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={selectClasses}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="final-time" className="text-sm font-semibold text-ink">
                Time
              </label>
              <select
                id="final-time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={selectClasses}
              >
                {allTimeSlotsForDay().map((slot) => (
                  <option key={slot} value={slot}>
                    {formatTimeLabel(slot)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button type="button" size="lg" onClick={() => setModal("confirm")} className="flex-1 sm:flex-none">
              Confirm appointment
            </Button>
            <Button
              type="button"
              variant="danger"
              size="lg"
              onClick={() => {
                if (!rejectReason.trim()) {
                  setActionError("Enter a reason to share with the patient before rejecting.");
                  return;
                }
                setActionError(null);
                setModal("reject");
              }}
              className="flex-1 sm:flex-none"
            >
              Reject request
            </Button>
          </div>

          <div className="mt-5 border-t border-border-blue pt-4">
            <label htmlFor="reject-reason" className="text-sm font-semibold text-ink">
              Reason if rejecting (shared with patient)
            </label>
            <textarea
              id="reject-reason"
              rows={2}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. That time is no longer available. Please submit a new request for a different date."
              className={`${fieldInputClasses} mt-1.5 resize-none`}
            />
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-border-blue bg-white p-5">
        <h2 className="text-base font-bold text-ink">Internal administrative note</h2>
        <p className="mt-1 text-sm text-muted">
          Visible to clinic staff only — never shown to the patient.
        </p>
        <textarea
          id="internal-note"
          rows={3}
          value={internalNote}
          onChange={(e) => {
            setInternalNote(e.target.value);
            setNoteSaved(false);
          }}
          className={`${fieldInputClasses} mt-3 resize-none`}
          placeholder="Add a short internal note..."
        />
        <div className="mt-3 flex items-center gap-3">
          <Button type="button" variant="secondary" onClick={handleSaveNote} disabled={isSavingNote}>
            {isSavingNote ? "Saving..." : "Save note"}
          </Button>
          {noteSaved ? <span className="text-sm text-success">Saved.</span> : null}
        </div>
      </div>

      {emailPreview ? (
        <div className="rounded-xl border border-border-blue bg-white p-5">
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-navy" aria-hidden="true" />
            <h2 className="text-base font-bold text-ink">Email preview</h2>
          </div>
          <p className="mt-1 text-sm text-muted">
            Resend isn&apos;t configured for this demo, so no real email was
            sent. This is exactly what would have been sent.
          </p>
          <EmailPreviewViewer preview={emailPreview} />
        </div>
      ) : null}

      <ConfirmModal
        open={modal === "confirm"}
        title="Confirm this appointment?"
        description={
          <p>
            This will confirm <strong>{appointment.service}</strong> at{" "}
            <strong>{branch}</strong> on <strong>{formatDateKeyLong(date)}</strong>{" "}
            at <strong>{formatTimeLabel(time)}</strong> and email {appointment.patient_name}.
          </p>
        }
        confirmLabel="Yes, confirm"
        isSubmitting={isSubmitting}
        onConfirm={handleConfirm}
        onCancel={() => setModal(null)}
      />

      <ConfirmModal
        open={modal === "reject"}
        title="Reject this request?"
        description={
          <p>
            {appointment.patient_name} will receive an email explaining the
            request couldn&apos;t be confirmed, with the reason you entered.
          </p>
        }
        confirmLabel="Yes, reject"
        confirmVariant="danger"
        isSubmitting={isSubmitting}
        onConfirm={handleReject}
        onCancel={() => setModal(null)}
      />
    </div>
  );
}
