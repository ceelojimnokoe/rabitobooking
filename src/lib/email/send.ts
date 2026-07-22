import "server-only";
import { Resend } from "resend";
import type { EmailContent } from "./templates";
import type { EmailPreviewPayload, EmailStatus } from "@/types/appointment";

export interface SendEmailResult {
  status: EmailStatus;
  providerId: string | null;
  preview: EmailPreviewPayload | null;
}

function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

/**
 * Sends an email via Resend when configured. When RESEND_API_KEY or
 * RESEND_FROM_EMAIL is missing (the common state for a fresh demo
 * checkout), this never throws — it returns a `preview_only` result with
 * the fully-rendered email content so an administrator can review exactly
 * what would have been sent via the "View Email Preview" action.
 */
export async function sendTransactionalEmail(
  to: string,
  content: EmailContent,
): Promise<SendEmailResult> {
  if (!isResendConfigured()) {
    return {
      status: "preview_only",
      providerId: null,
      preview: {
        to,
        subject: content.subject,
        html: content.html,
        text: content.text,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to,
      subject: content.subject,
      html: content.html,
      text: content.text,
    });

    if (error) {
      return { status: "failed", providerId: null, preview: null };
    }

    return { status: "sent", providerId: data?.id ?? null, preview: null };
  } catch {
    return { status: "failed", providerId: null, preview: null };
  }
}
