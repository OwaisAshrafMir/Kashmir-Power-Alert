"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export function ShareStatusButton({
  locality,
  statusLabel,
}: {
  locality?: string | null;
  statusLabel: string;
}) {
  const { push } = useToast();
  const [busy, setBusy] = useState(false);

  async function share() {
    setBusy(true);
    const text = locality
      ? `Kashmir Power Alerts — ${locality}: ${statusLabel}`
      : `Kashmir Power Alerts — ${statusLabel}`;
    const url = typeof window !== "undefined" ? window.location.origin : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: "Kashmir Power Alerts", text, url });
        push("Shared with your contacts.");
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        push("Status copied — paste it anywhere.");
      } else {
        push("Sharing isn’t supported on this device.", "info");
      }
    } catch {
      // user cancelled share sheet
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-xs font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-primary)]/40 disabled:opacity-60"
    >
      <Share2 className="h-3.5 w-3.5" />
      {busy ? "Sharing…" : "Share my status"}
    </button>
  );
}
