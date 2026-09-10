"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getDistricts, getLocalitiesForDistrict } from "@/lib/localities";
import { Button, Input, Label } from "@/components/ui/Primitives";
import { useToast } from "@/components/ui/Toast";
import type { UserSettings } from "@/lib/types";
import { EnablePushButton } from "@/components/push/EnablePushButton";

export function SettingsForm({ initial }: { initial: UserSettings | null }) {
  const router = useRouter();
  const { push } = useToast();
  const districts = getDistricts();
  const [district, setDistrict] = useState(initial?.district || "Srinagar");
  const localities = useMemo(() => getLocalitiesForDistrict(district), [district]);
  const [locality, setLocality] = useState(initial?.locality || localities[0] || "");
  const [watch, setWatch] = useState((initial?.watch_localities || []).join(", "));
  const [notifications, setNotifications] = useState(initial?.notifications_enabled ?? true);
  const [quietStart, setQuietStart] = useState(
    initial?.quiet_hours_start ? String(initial.quiet_hours_start).slice(0, 5) : ""
  );
  const [quietEnd, setQuietEnd] = useState(
    initial?.quiet_hours_end ? String(initial.quiet_hours_end).slice(0, 5) : ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        district,
        locality,
        watch_localities: watch
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 5),
        notifications_enabled: notifications,
        quiet_hours_start: quietStart || null,
        quiet_hours_end: quietEnd || null,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not save settings");
      return;
    }
    push("Settings saved — alerts will match your area.");
    router.refresh();
  }

  const selectClass =
    "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 text-sm text-[var(--color-ink)]";

  return (
    <form onSubmit={onSubmit} className="card-surface space-y-5 rounded-3xl p-6 shadow-sm">
      <div>
        <Label htmlFor="district">District</Label>
        <select
          id="district"
          value={district}
          onChange={(e) => {
            setDistrict(e.target.value);
            const next = getLocalitiesForDistrict(e.target.value);
            setLocality(next[0] || "");
          }}
          className={selectClass}
        >
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="locality">Home locality</Label>
        <select
          id="locality"
          value={locality}
          onChange={(e) => setLocality(e.target.value)}
          className={selectClass}
        >
          {localities.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="watch">Extra watch localities (comma-separated, free plan up to 5)</Label>
        <Input
          id="watch"
          value={watch}
          onChange={(e) => setWatch(e.target.value)}
          placeholder="Hyderpora, Bemina"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
        <input
          type="checkbox"
          checked={notifications}
          onChange={(e) => setNotifications(e.target.checked)}
        />
        Enable shutdown notifications for my area
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="quietStart">Quiet hours start (optional)</Label>
          <Input
            id="quietStart"
            type="time"
            value={quietStart}
            onChange={(e) => setQuietStart(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="quietEnd">Quiet hours end</Label>
          <Input id="quietEnd" type="time" value={quietEnd} onChange={(e) => setQuietEnd(e.target.value)} />
        </div>
      </div>
      <p className="text-xs text-[var(--color-muted)]">
        Quiet hours use India Standard Time. Leave blank to always notify.
      </p>

      <EnablePushButton />

      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
      <Button type="submit" loading={loading}>
        {loading ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
