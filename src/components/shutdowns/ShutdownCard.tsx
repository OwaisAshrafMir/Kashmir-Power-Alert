import Link from "next/link";
import { Clock3, MapPin, Zap } from "lucide-react";
import { Badge } from "@/components/ui/Primitives";
import type { ShutdownNotice } from "@/lib/types";

function formatWindow(notice: ShutdownNotice) {
  if (!notice.startsAt || !notice.endsAt) return "Timing in official notice";
  const start = new Date(notice.startsAt);
  const end = new Date(notice.endsAt);
  return `${start.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })} – ${end.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
}

export function ShutdownCard({
  notice,
  highlight = false,
}: {
  notice: ShutdownNotice;
  highlight?: boolean;
}) {
  const tone = notice.status === "active" ? "danger" : notice.status === "upcoming" ? "warn" : "neutral";

  return (
    <article
      className={`animate-rise rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        highlight
          ? "border-amber-300 bg-[var(--color-card)] ring-1 ring-amber-200 dark:border-amber-500/40 dark:ring-amber-500/20"
          : "border-[var(--color-border)] bg-[var(--color-card)]"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={tone}>
          {notice.status === "active" ? "Active now" : notice.status === "upcoming" ? "Upcoming" : "Past"}
        </Badge>
        <Badge tone="neutral">{notice.sourceLabel}</Badge>
      </div>
      <Link href={`/shutdowns/${encodeURIComponent(notice.id)}`}>
        <h3 className="mt-3 font-[family-name:var(--font-display)] text-lg text-[var(--color-ink)] hover:text-[var(--color-primary)]">
          {notice.title}
        </h3>
      </Link>
      <p className="mt-2 line-clamp-2 text-sm text-[var(--color-muted)]">{notice.summary}</p>
      <div className="mt-4 space-y-2 text-sm text-[var(--color-muted)]">
        <p className="flex items-start gap-2">
          <Clock3 className="mt-0.5 h-4 w-4 opacity-70" />
          <span>{formatWindow(notice)}</span>
        </p>
        <p className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 opacity-70" />
          <span className="line-clamp-2">{notice.localities.slice(0, 8).join(", ")}</span>
        </p>
        {notice.lineName ? (
          <p className="flex items-start gap-2">
            <Zap className="mt-0.5 h-4 w-4 opacity-70" />
            <span>{notice.lineName}</span>
          </p>
        ) : null}
      </div>
      <div className="mt-4">
        <Link
          href={`/shutdowns/${encodeURIComponent(notice.id)}`}
          className="text-sm font-semibold text-[var(--color-primary)]"
        >
          View details
        </Link>
      </div>
    </article>
  );
}
