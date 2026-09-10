"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Primitives";
import { useToast } from "@/components/ui/Toast";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function EnablePushButton() {
  const { push } = useToast();
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

  async function enable() {
    setLoading(true);
    setStatus("");
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("Push is not supported in this browser.");
        return;
      }
      if (!vapid) {
        setStatus("Push keys are not configured yet (VAPID).");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("Notification permission denied.");
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid),
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatus(data.error || "Could not save push subscription. Sign in first.");
        return;
      }

      setStatus("Browser push enabled for this device.");
      push("Push alerts enabled for this device.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed to enable push");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-mist)]/60 p-4">
      <p className="text-sm font-medium text-[var(--color-ink)]">Browser push alerts</p>
      <p className="mt-1 text-xs text-[var(--color-muted)]">
        Get a notification when a new shutdown matches your locality.
      </p>
      <Button type="button" className="mt-3" variant="outline" onClick={enable} loading={loading}>
        {loading ? "Enabling…" : "Enable browser notifications"}
      </Button>
      {status ? <p className="mt-2 text-sm text-[var(--color-muted)]">{status}</p> : null}
    </div>
  );
}
