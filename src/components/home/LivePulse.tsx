"use client";

import { useEffect, useState } from "react";
import { Radio } from "lucide-react";

export function LivePulse({ source, lastFetchAt }: { source: string; lastFetchAt?: string | null }) {
  const live = source === "kpdcl";
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 2000);
    return () => window.clearInterval(id);
  }, [live]);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1.5 text-xs font-medium text-[var(--color-muted)]">
      <span className="relative flex h-2.5 w-2.5">
        {live ? (
          <>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </>
        ) : (
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
        )}
      </span>
      <Radio className="h-3.5 w-3.5" />
      {live ? `Live KPDCL feed` : `Standby · ${source}`}
      {lastFetchAt ? (
        <span className="hidden sm:inline" key={tick}>
          · {new Date(lastFetchAt).toLocaleTimeString("en-IN")}
        </span>
      ) : null}
    </div>
  );
}
