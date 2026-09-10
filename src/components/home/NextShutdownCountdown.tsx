"use client";

import { useEffect, useMemo, useState } from "react";
import { Timer } from "lucide-react";
import type { ShutdownNotice } from "@/lib/types";

function formatRemaining(ms: number) {
  if (ms <= 0) return "Starting now";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function NextShutdownCountdown({ notices }: { notices: ShutdownNotice[] }) {
  const next = useMemo(() => {
    const upcoming = notices
      .filter((n) => n.status === "upcoming" && n.startsAt)
      .sort((a, b) => (a.startsAt || "").localeCompare(b.startsAt || ""));
    return upcoming[0] || null;
  }, [notices]);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!next?.startsAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [next?.startsAt]);

  if (!next?.startsAt) return null;

  const remaining = new Date(next.startsAt).getTime() - now;

  return (
    <div className="animate-rise overflow-hidden rounded-3xl border border-amber-200 bg-[linear-gradient(135deg,#fff7ed,#fffbeb)] p-5 shadow-sm dark:border-amber-500/25 dark:bg-[linear-gradient(135deg,#2a2112,#1a241c)]">
      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
        <Timer className="h-4 w-4" />
        <p className="text-xs font-bold uppercase tracking-wider">Next in your area</p>
      </div>
      <p className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--color-ink)]">
        {formatRemaining(remaining)}
      </p>
      <p className="mt-1 line-clamp-2 text-sm text-[var(--color-muted)]">{next.title}</p>
      <p className="mt-2 text-xs text-[var(--color-muted)]">
        Starts {new Date(next.startsAt).toLocaleString("en-IN")}
      </p>
    </div>
  );
}
