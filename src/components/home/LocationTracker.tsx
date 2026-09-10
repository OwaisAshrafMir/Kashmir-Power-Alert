"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Loader2 } from "lucide-react";

type Props = {
  enabled: boolean;
  currentLocality: string | null;
};

const SESSION_KEY = "kpa_location_synced";

export function LocationTracker({ enabled, currentLocality }: Props) {
  const router = useRouter();
  const ran = useRef(false);
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function detect(force = false) {
    if (!enabled || !("geolocation" in navigator)) {
      setStatus("Location is not available in this browser.");
      return;
    }
    setBusy(true);
    setStatus("Detecting your location…");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch("/api/location/resolve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            setStatus(data.error || "Could not resolve location.");
            setBusy(false);
            return;
          }

          const { district, locality } = data.resolved;
          const alreadySynced =
            typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "1";

          if (!force && alreadySynced && currentLocality) {
            setStatus(
              currentLocality === locality
                ? `Located near ${data.resolved.label}`
                : `Showing ${currentLocality} · GPS also sees ${data.resolved.label}`
            );
            setBusy(false);
            return;
          }

          const save = await fetch("/api/settings", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ district, locality }),
          });
          if (!save.ok) {
            const err = await save.json().catch(() => ({}));
            setStatus(err.error || "Located, but could not save settings.");
            setBusy(false);
            return;
          }

          sessionStorage.setItem(SESSION_KEY, "1");
          setStatus(`Area set to ${data.resolved.label}`);
          setBusy(false);
          router.refresh();
        } catch {
          setStatus("Location lookup failed.");
          setBusy(false);
        }
      },
      (err) => {
        setBusy(false);
        if (err.code === err.PERMISSION_DENIED) {
          setStatus("Location permission denied. Set your area in Settings.");
        } else {
          setStatus("Could not read GPS. Set your area in Settings.");
        }
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60_000 }
    );
  }

  useEffect(() => {
    if (!enabled || ran.current) return;
    ran.current = true;
    void detect(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-950 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
      <MapPin className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />
      <div className="min-w-0 flex-1">
        <p className="font-medium">Location-based alerts</p>
        <p className="text-xs text-emerald-900/70 dark:text-emerald-100/70">
          {busy ? (
            <span className="inline-flex items-center gap-1">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> {status || "Working…"}
            </span>
          ) : (
            status || "We use your GPS to match shutdown notices near you."
          )}
        </p>
      </div>
      <button
        type="button"
        onClick={() => detect(true)}
        disabled={busy}
        className="rounded-lg bg-[var(--color-card)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] ring-1 ring-emerald-200 disabled:opacity-50 dark:ring-emerald-500/30"
      >
        {busy ? "Detecting…" : "Refresh location"}
      </button>
    </div>
  );
}
