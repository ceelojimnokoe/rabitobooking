"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { isPublicEnvConfigured } from "@/lib/env/public";
import { devLog } from "@/lib/dev-log";
import { Button } from "@/components/ui/button";
import { fieldInputClasses } from "@/components/booking/field";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Enter your email.").email("Enter a valid email."),
  // Intentionally not trimmed — a password could theoretically start/end
  // with a space, and altering it would silently turn a correct password
  // into an incorrect one.
  password: z.string().min(1, "Enter your password."),
});

type LoginInput = z.infer<typeof loginSchema>;

/** Maps known Supabase Auth error codes to patient-safe messages. Falls
 * back to a generic "incorrect email or password" for anything else —
 * deliberately not distinguishing "wrong password" from "no such user",
 * since Supabase itself avoids that distinction to prevent account
 * enumeration. */
function messageForAuthError(code: string | undefined): string {
  switch (code) {
    case "email_not_confirmed":
      return "This account's email hasn't been confirmed yet in Supabase. Confirm it in Authentication → Users, or disable email confirmation for this demo.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Too many attempts. Please wait a minute and try again.";
    case "user_banned":
      return "This administrator account has been disabled.";
    case "invalid_credentials":
    case "user_not_found":
    default:
      return "Incorrect email or password. Please try again.";
  }
}

export function LoginForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginInput) {
    setFormError(null);
    setIsSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      // Email is trimmed by the schema above; Supabase itself normalizes
      // case for the lookup, so no extra lower-casing is needed here.
      const { error } = await supabase.auth.signInWithPassword(data);
      if (error) {
        devLog("admin-login", {
          code: error.code,
          status: error.status,
          name: error.name,
        });
        setFormError(messageForAuthError(error.code));
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      devLog("admin-login", {
        note: "signInWithPassword threw (network/config error)",
        message: err instanceof Error ? err.message : String(err),
      });
      setFormError("We couldn't reach the authentication service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isPublicEnvConfigured()) {
    return (
      <div
        role="alert"
        className="flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/5 p-4"
      >
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
        <p className="text-sm text-ink">
          Administrator login isn&apos;t available yet — Supabase hasn&apos;t
          been configured for this demo. See README-DEMO-SETUP.md.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-semibold text-ink">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className={fieldInputClasses}
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby="email-error"
          {...register("email")}
        />
        <p
          id="email-error"
          role="alert"
          className={`text-xs font-medium text-error ${errors.email ? "" : "invisible"}`}
        >
          {errors.email?.message || "placeholder"}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-semibold text-ink">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className={fieldInputClasses}
          aria-invalid={errors.password ? "true" : "false"}
          aria-describedby="password-error"
          {...register("password")}
        />
        <p
          id="password-error"
          role="alert"
          className={`text-xs font-medium text-error ${errors.password ? "" : "invisible"}`}
        >
          {errors.password?.message || "placeholder"}
        </p>
      </div>

      {formError ? (
        <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-error/30 bg-error/5 p-3.5">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-error" aria-hidden="true" />
          <p className="text-sm text-error">{formError}</p>
        </div>
      ) : null}

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
