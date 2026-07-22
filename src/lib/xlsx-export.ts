/**
 * Client-side .xlsx export for the admin dashboard.
 *
 * Deliberately uses only the SheetJS write-path APIs (`utils.json_to_sheet`,
 * `utils.book_new`, `writeFile`) and never `XLSX.read`/`readFile` — the
 * package's known advisories are in its file-parsing code, which this
 * feature never exercises since it only ever generates a file from data
 * already loaded in the browser, never parses an uploaded/untrusted one.
 */
import * as XLSX from "xlsx";
import type { AppointmentRow } from "@/types/appointment";
import { patientTypes } from "@/config/clinic";
import { formatDateKeyLong, formatTimeLabel } from "@/lib/scheduling";

function patientTypeLabel(id: string): string {
  return patientTypes.find((t) => t.id === id)?.label ?? id;
}

export function exportAppointmentsToXlsx(
  appointments: AppointmentRow[],
  filename: string,
) {
  const rows = appointments.map((a) => ({
    "Patient name": a.patient_name,
    Phone: a.phone,
    Email: a.email,
    "Patient type": patientTypeLabel(a.patient_type),
    Service: a.service,
    "Requested branch": a.requested_branch,
    "Confirmed branch": a.confirmed_branch ?? "",
    "Requested date": formatDateKeyLong(a.requested_date),
    "Requested time": formatTimeLabel(a.requested_time),
    "Confirmed date": a.confirmed_date ? formatDateKeyLong(a.confirmed_date) : "",
    "Confirmed time": a.confirmed_time ? formatTimeLabel(a.confirmed_time) : "",
    "Assigned team": a.assigned_team ?? "",
    Status: a.status,
    "Request reference": a.request_reference,
    "Appointment reference": a.appointment_reference ?? "",
    "Submitted at": a.created_at,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = Object.keys(rows[0] ?? {}).map(() => ({ wch: 20 }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Appointments");
  XLSX.writeFile(workbook, filename);
}
