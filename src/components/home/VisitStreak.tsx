"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

const KEY = "kpa-visit-streak";

type Streak = { count: number; lastDay: string };

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function VisitStreak() {
  const [streak, setStreak] = useState(1);

  useEffect(() => {
    const today = todayKey();
    let next: Streak = { count: 1, lastDay: today };
    try {
      const raw = localStorage.getItem(KEY);
      const prev: Streak | null = raw ? JSON.parse(raw) : null;
      if (prev?.lastDay === today) {
        next = prev;
      } else if (prev?.lastDay === yesterdayKey()) {
        next = { count: (prev.count || 0) + 1, lastDay: today };
      } else {
        next = { count: 1, lastDay: today };
      }
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
    setStreak(next.count);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1.5 text-xs font-medium text-[var(--color-muted)]">
      <Flame className="h-3.5 w-3.5 text-orange-500" />
      {streak}-day check-in streak
    </div>
  );
}
