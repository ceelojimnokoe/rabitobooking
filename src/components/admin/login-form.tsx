"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { fieldInputClasses } from "@/components/booking/field";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Enter your email.").email("Enter a valid email."),
  password: z.string().min(1, "Enter your password."),
});

type LoginInput = z.infer<typeof loginSchema>;

const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

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
      const { error } = await supabase.auth.signInWithPassword(data);
      if (error) {
        setFormError("Incorrect email or password. Please try again.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setFormError("We couldn't reach the authentication service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isSupabaseConfigured) {
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
