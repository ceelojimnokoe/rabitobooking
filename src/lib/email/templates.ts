import { clinicIdentity, contactPlaceholders, demoDisclaimer } from "@/config/clinic";
import { formatDateKeyLong, formatTimeLabel } from "@/lib/scheduling";

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

const brandColors = {
  navy: "#123A68",
  darkNavy: "#0C2C50",
  paleBlue: "#EEF4FA",
  border: "#D4DFEA",
  text: "#172433",
  muted: "#607085",
  success: "#16805D",
  error: "#C53D43",
};

function layout(opts: {
  preheader: string;
  bodyHtml: string;
  accent?: string;
}): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${clinicIdentity.name}</title>
  </head>
  <body style="margin:0;padding:0;background-color:${brandColors.paleBlue};font-family:Arial,Helvetica,sans-serif;color:${brandColors.text};">
    <span style="display:none;max-height:0;overflow:hidden;">${opts.preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${brandColors.paleBlue};padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border:1px solid ${brandColors.border};border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background-color:${opts.accent ?? brandColors.navy};padding:20px 28px;">
                <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.2px;">${clinicIdentity.name}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                ${opts.bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px;border-top:1px solid ${brandColors.border};">
                <p style="margin:0 0 6px 0;font-size:12px;color:${brandColors.muted};">
                  ${contactPlaceholders.phone} &middot; ${contactPlaceholders.email}
                </p>
                <p style="margin:0;font-size:12px;color:${brandColors.muted};">
                  ${contactPlaceholders.address}
                </p>
                ${
                  demoDisclaimer
                    ? `<p style="margin:12px 0 0 0;font-size:11px;color:${brandColors.muted};">${demoDisclaimer}</p>`
                    : ""
                }
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;font-size:13px;color:${brandColors.muted};width:40%;vertical-align:top;">${label}</td>
    <td style="padding:6px 0;font-size:14px;color:${brandColors.text};font-weight:600;">${value}</td>
  </tr>`;
}

export interface ConfirmationEmailInput {
  patientName: string;
  service: string;
  branch: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  assignedTeam?: string | null;
  appointmentReference: string;
}

export function buildConfirmationEmail(input: ConfirmationEmailInput): EmailContent {
  const dateLabel = formatDateKeyLong(input.date);
  const timeLabel = formatTimeLabel(input.time);

  const bodyHtml = `
    <h1 style="margin:0 0 4px 0;font-size:20px;color:${brandColors.text};">Your appointment is confirmed</h1>
    <p style="margin:0 0 20px 0;font-size:14px;color:${brandColors.muted};">Hello ${input.patientName}, your appointment request has been reviewed and confirmed.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${brandColors.paleBlue};border:1px solid ${brandColors.border};border-radius:10px;padding:16px 18px;margin-bottom:20px;">
      ${infoRow("Service", input.service)}
      ${infoRow("Branch", input.branch)}
      ${infoRow("Date", dateLabel)}
      ${infoRow("Time", timeLabel)}
      ${input.assignedTeam ? infoRow("Team", input.assignedTeam) : ""}
      ${infoRow("Appointment reference", input.appointmentReference)}
    </table>
    <p style="margin:0 0 12px 0;font-size:13px;color:${brandColors.text};">
      Please bring your appointment reference <strong>${input.appointmentReference}</strong> with you (or have it ready for an online consultation).
    </p>
    <p style="margin:0;font-size:13px;color:${brandColors.muted};">
      If you have any questions or need to make changes, please contact us using the details below.
    </p>
  `;

  const text = [
    `Your appointment is confirmed.`,
    ``,
    `Patient: ${input.patientName}`,
    `Service: ${input.service}`,
    `Branch: ${input.branch}`,
    `Date: ${dateLabel}`,
    `Time: ${timeLabel}`,
    input.assignedTeam ? `Team: ${input.assignedTeam}` : null,
    `Appointment reference: ${input.appointmentReference}`,
    ``,
    `Please bring your appointment reference with you.`,
    ``,
    contactPlaceholders.phone,
    contactPlaceholders.email,
    contactPlaceholders.address,
    demoDisclaimer || null,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  return {
    subject: `Appointment confirmed — ${input.appointmentReference}`,
    html: layout({
      preheader: `Your ${input.service} appointment is confirmed for ${dateLabel} at ${timeLabel}.`,
      bodyHtml,
      accent: brandColors.success,
    }),
    text,
  };
}

export interface RejectionEmailInput {
  patientName: string;
  service: string;
  date: string;
  time: string;
  reason: string;
  bookingUrl: string;
}

export function buildRejectionEmail(input: RejectionEmailInput): EmailContent {
  const dateLabel = formatDateKeyLong(input.date);
  const timeLabel = formatTimeLabel(input.time);

  const bodyHtml = `
    <h1 style="margin:0 0 4px 0;font-size:20px;color:${brandColors.text};">We couldn't confirm your requested appointment</h1>
    <p style="margin:0 0 20px 0;font-size:14px;color:${brandColors.muted};">Hello ${input.patientName}, thank you for your interest in ${clinicIdentity.name}.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${brandColors.paleBlue};border:1px solid ${brandColors.border};border-radius:10px;padding:16px 18px;margin-bottom:20px;">
      ${infoRow("Requested service", input.service)}
      ${infoRow("Requested date", dateLabel)}
      ${infoRow("Requested time", timeLabel)}
    </table>
    <p style="margin:0 0 16px 0;font-size:13px;color:${brandColors.text};">
      <strong>Reason:</strong> ${input.reason}
    </p>
    <p style="margin:0 0 20px 0;font-size:13px;color:${brandColors.muted};">
      Please submit another request for a different date and time, or contact the clinic directly using the details below.
    </p>
    <a href="${input.bookingUrl}" style="display:inline-block;background-color:${brandColors.navy};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 20px;border-radius:8px;">Submit a new request</a>
  `;

  const text = [
    `We couldn't confirm your requested appointment.`,
    ``,
    `Patient: ${input.patientName}`,
    `Requested service: ${input.service}`,
    `Requested date: ${dateLabel}`,
    `Requested time: ${timeLabel}`,
    ``,
    `Reason: ${input.reason}`,
    ``,
    `Please submit another request or contact the clinic: ${input.bookingUrl}`,
    ``,
    contactPlaceholders.phone,
    contactPlaceholders.email,
    contactPlaceholders.address,
    demoDisclaimer || null,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  return {
    subject: `Update on your appointment request — ${clinicIdentity.name}`,
    html: layout({
      preheader: `We couldn't confirm your requested appointment for ${dateLabel}.`,
      bodyHtml,
      accent: brandColors.error,
    }),
    text,
  };
}
