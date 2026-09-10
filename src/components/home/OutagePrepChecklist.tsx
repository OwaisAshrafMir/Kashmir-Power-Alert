"use client";

import { useEffect, useState } from "react";
import { CheckSquare2, Square } from "lucide-react";

const ITEMS = [
  { id: "bank", label: "Phone power bank is charged" },
  { id: "water", label: "Keep drinking water / kettle ready" },
  { id: "torch", label: "Torch or candle within reach" },
  { id: "router", label: "Router UPS / backup if you work from home" },
  { id: "fridge", label: "Avoid opening fridge during long outages" },
];

const KEY = "kpa-prep-checklist";

export function OutagePrepChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setChecked(JSON.parse(raw));
    } catch {
      // ignore
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify(checked));
  }, [checked, ready]);

  const done = ITEMS.filter((i) => checked[i.id]).length;
  const pct = Math.round((done / ITEMS.length) * 100);

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <section className="card-surface animate-rise rounded-3xl p-6 shadow-sm">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl">Outage prep</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            A quick checklist for Kashmir winters — saved on this device.
          </p>
        </div>
        <p className="text-sm font-semibold text-[var(--color-primary)]">{pct}%</p>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--color-mist)]">
        <div
          className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="mt-5 space-y-2">
        {ITEMS.map((item) => {
          const on = Boolean(checked[item.id]);
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className="flex w-full items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-mist)]/40 px-3 py-3 text-left text-sm transition hover:border-[var(--color-primary)]/40"
              >
                {on ? (
                  <CheckSquare2 className="h-5 w-5 shrink-0 text-[var(--color-primary)]" />
                ) : (
                  <Square className="h-5 w-5 shrink-0 text-[var(--color-muted)]" />
                )}
                <span className={on ? "text-[var(--color-muted)] line-through" : "text-[var(--color-ink)]"}>
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
