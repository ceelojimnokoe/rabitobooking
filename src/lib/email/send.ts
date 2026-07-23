import "server-only";
import { Resend } from "resend";
import type { EmailContent } from "./templates";
import type { EmailPreviewPayload, EmailStatus } from "@/types/appointment";
import { checkServerEnv } from "@/lib/env/server";
import { devLog } from "@/lib/dev-log";

export interface SendEmailResult {
  status: EmailStatus;
  providerId: string | null;
  preview: EmailPreviewPayload | null;
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
  const { resendApiKey, resendFromEmail } = checkServerEnv().values;

  if (!resendApiKey || !resendFromEmail) {
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
    const resend = new Resend(resendApiKey);
    const { data, error } = await resend.emails.send({
      from: resendFromEmail,
      to,
      subject: content.subject,
      html: content.html,
      text: content.text,
    });

    if (error) {
      devLog("email:send", { name: error.name, message: error.message });
      return { status: "failed", providerId: null, preview: null };
    }

    return { status: "sent", providerId: data?.id ?? null, preview: null };
  } catch (err) {
    devLog("email:send", {
      note: "resend.emails.send threw",
      message: err instanceof Error ? err.message : String(err),
    });
    return { status: "failed", providerId: null, preview: null };
  }
}
