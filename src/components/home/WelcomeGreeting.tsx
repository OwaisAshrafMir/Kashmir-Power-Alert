"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export function WelcomeGreeting({
  name,
  locality,
}: {
  name?: string | null;
  locality?: string | null;
}) {
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 5) setGreeting("Still up");
    else if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else if (hour < 21) setGreeting("Good evening");
    else setGreeting("Good night");
  }, []);

  const first = name?.split(" ")[0] || "there";

  return (
    <div className="animate-rise flex items-start gap-3 rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-primary)]/12 text-[var(--color-primary)]">
        <Sparkles className="h-5 w-5" />
      </div>
      <div>
        <p className="font-[family-name:var(--font-display)] text-xl text-[var(--color-ink)]">
          {greeting}, {first}
        </p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {locality
            ? `Watching power notices for ${locality}. Stay one step ahead.`
            : "Set your locality once — we’ll personalise every alert."}
        </p>
      </div>
    </div>
  );
}
