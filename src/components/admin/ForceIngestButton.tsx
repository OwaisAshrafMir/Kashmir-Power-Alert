"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Primitives";
import { useToast } from "@/components/ui/Toast";

export function ForceIngestButton() {
  const router = useRouter();
  const { push } = useToast();
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/admin/ingest", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setMsg(data.error || "Failed");
      return;
    }
    const text = `Refreshed · ${data.health?.noticeCount ?? 0} notices · source ${data.health?.source} · push sent ${data.notify?.sent ?? 0}`;
    setMsg(text);
    push("Ingest refresh complete.");
    router.refresh();
  }

  return (
    <div>
      <Button type="button" onClick={run} loading={loading}>
        {loading ? "Refreshing…" : "Force refresh ingest"}
      </Button>
      {msg ? <p className="mt-3 text-sm text-[var(--color-muted)]">{msg}</p> : null}
    </div>
  );
}
