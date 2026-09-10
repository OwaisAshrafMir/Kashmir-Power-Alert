"use client";

import { useEffect, useState } from "react";

const tips = [
  "Keep a power bank charged before morning maintenance windows.",
  "Enable browser push so you hear about your area first.",
  "Use “Browse all notifications” if neighbours are affected nearby.",
  "Helpline 1912 works for KPDCL complaints across Kashmir.",
  "Quiet hours in Settings pause alerts overnight.",
];

export function EngagementTip() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(new Date().getDate() % tips.length);
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % tips.length);
    }, 8000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="animate-rise rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 text-sm text-[var(--color-muted)] shadow-sm">
      <span className="mr-2 rounded-md bg-[var(--color-primary)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--color-primary)]">
        Daily tip
      </span>
      <span key={index} className="inline animate-rise">
        {tips[index]}
      </span>
    </div>
  );
}
