"use client";

import { useEffect, useState } from "react";
import { Lightbulb, ChevronLeft, ChevronRight } from "lucide-react";

const FACTS = [
  "KPDCL often publishes planned shutdowns a day ahead for line erection and RDSS works.",
  "Hyderpora, Humhama and Airport corridor notices often share the Airforce / airport feeders.",
  "If GPS is off, you can still pick your locality manually in Settings.",
  "Quiet hours pause push alerts overnight — useful during exams or early morning namaz.",
  "Browser push works best when the app is installed to your home screen on phones.",
  "Always verify critical travel or medical plans with helpline 1912.",
];

export function KashmirFactsCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % FACTS.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="card-surface animate-rise relative overflow-hidden rounded-3xl p-6 shadow-sm">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[var(--color-primary)]/10 blur-2xl" />
      <div className="flex items-center gap-2 text-[var(--color-primary)]">
        <Lightbulb className="h-4 w-4" />
        <p className="text-xs font-bold uppercase tracking-wider">Kashmir know-how</p>
      </div>
      <p key={index} className="animate-rise mt-3 min-h-[3.5rem] text-sm leading-relaxed text-[var(--color-ink)]">
        {FACTS[index]}
      </p>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-1.5">
          {FACTS.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Fact ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-5 bg-[var(--color-primary)]" : "w-1.5 bg-[var(--color-border)]"
              }`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous fact"
            onClick={() => setIndex((i) => (i - 1 + FACTS.length) % FACTS.length)}
            className="rounded-lg border border-[var(--color-border)] p-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next fact"
            onClick={() => setIndex((i) => (i + 1) % FACTS.length)}
            className="rounded-lg border border-[var(--color-border)] p-1.5"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
