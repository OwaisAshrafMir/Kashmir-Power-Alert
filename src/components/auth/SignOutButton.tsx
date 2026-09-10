"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/utils";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signOut() {
    if (!isSupabaseConfigured() || loading) return;
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={loading}
      className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] disabled:opacity-60 sm:inline-flex"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
