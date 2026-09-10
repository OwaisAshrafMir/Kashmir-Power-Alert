"use client";

import { useEffect, useState } from "react";
import { PartyPopper } from "lucide-react";

export function AllClearBanner({ show }: { show: boolean }) {
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    if (!show) return;
    setBurst(true);
    const id = window.setTimeout(() => setBurst(false), 1800);
    return () => window.clearTimeout(id);
  }, [show]);

  if (!show) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-[linear-gradient(135deg,#ecfdf5,#f0fdf4)] p-6 shadow-sm dark:border-emerald-500/25 dark:bg-[linear-gradient(135deg,#10241c,#0f1c18)]">
      {burst
        ? Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="pointer-events-none absolute h-2 w-2 animate-[confetti_1.4s_ease-out_forwards] rounded-full"
              style={{
                left: `${8 + i * 7}%`,
                top: "10%",
                background: i % 3 === 0 ? "#34d399" : i % 3 === 1 ? "#fbbf24" : "#38bdf8",
                animationDelay: `${i * 40}ms`,
              }}
            />
          ))
        : null}
      <div className="relative flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
          <PartyPopper className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-ink)]">
            All clear for your area
          </h3>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            No matching active or upcoming shutdown right now. We’ll nudge you if a new notice
            appears.
          </p>
        </div>
      </div>
    </div>
  );
}
