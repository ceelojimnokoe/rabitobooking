"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border-blue bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-pale disabled:opacity-60"
    >
      <LogOut className="size-4" aria-hidden="true" />
      {isSigningOut ? "Signing out..." : "Sign out"}
    </button>
  );
}
