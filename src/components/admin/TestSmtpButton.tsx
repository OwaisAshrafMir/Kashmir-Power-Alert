"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Primitives";
import { useToast } from "@/components/ui/Toast";

export function TestSmtpButton() {
  const { push } = useToast();
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/admin/test-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setMsg(data.error || "Send failed");
      push(data.error || "SMTP test failed", "warn");
      return;
    }
    const text = `Test email sent to ${data.to}`;
    setMsg(text);
    push("Test email sent.");
  }

  return (
    <div>
      <Button type="button" variant="outline" onClick={run} loading={loading}>
        {loading ? "Sending…" : "Send SMTP test to my inbox"}
      </Button>
      {msg ? <p className="mt-3 text-sm text-[var(--color-muted)]">{msg}</p> : null}
    </div>
  );
}
