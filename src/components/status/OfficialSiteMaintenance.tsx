import Link from "next/link";
import { ExternalLink, Phone } from "lucide-react";
import { AppLogo } from "@/components/brand/AppLogo";
import {
  APP_NAME,
  HELPLINE_PRIMARY,
  HELPLINE_TOLL_FREE,
  KPDCL_NOTIFICATIONS_URL,
} from "@/lib/constants";
import type { IngestHealth } from "@/lib/types";

export function isOfficialFeedDown(health: IngestHealth): boolean {
  return health.source !== "kpdcl";
}

type Props = {
  health: IngestHealth;
  compact?: boolean;
};

export function OfficialSiteMaintenance({ health, compact = false }: Props) {
  return (
    <div
      className={
        compact
          ? "card-surface rounded-3xl p-6 shadow-sm"
          : "mx-auto max-w-2xl px-4 py-14"
      }
    >
      <div className="animate-rise rounded-3xl border border-amber-200 bg-[linear-gradient(180deg,#fffbeb,#ffffff)] p-8 text-center shadow-sm dark:border-amber-500/30 dark:bg-[linear-gradient(180deg,#2a2112,#121c18)]">
        <div className="flex justify-center">
          <AppLogo size="xl" priority />
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-amber-800 dark:text-amber-300">
          Temporary service pause
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--color-ink)]">
          Official KPDCL site is unreachable
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--color-muted)]">
          This is <strong className="text-[var(--color-ink)]">not an issue with {APP_NAME}</strong>. Our
          app depends on the official KPDCL / JKPDD notifications page for live shutdown data. That
          official website is currently down or not responding, so we are pausing alerts until it
          comes back.
        </p>
        <p className="mt-3 text-sm text-[var(--color-muted)]">
          Please try again later. As soon as the official site is reachable, live notices will
          appear here automatically.
        </p>

        {health.lastFetchAt ? (
          <p className="mt-4 text-xs text-[var(--color-muted)]">
            Last checked: {new Date(health.lastFetchAt).toLocaleString("en-IN")}
            {health.error ? ` · ${health.error}` : ""}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={KPDCL_NOTIFICATIONS_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white dark:text-[#06241b]"
          >
            Open official KPDCL page <ExternalLink className="h-4 w-4" />
          </a>
          <a
            href={`tel:${HELPLINE_PRIMARY}`}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-2.5 text-sm font-semibold text-[var(--color-ink)]"
          >
            <Phone className="h-4 w-4" /> Helpline {HELPLINE_PRIMARY}
          </a>
        </div>

        <p className="mt-6 text-xs text-[var(--color-muted)]">
          Toll-free:{" "}
          <a href={`tel:${HELPLINE_TOLL_FREE}`} className="font-medium text-[var(--color-primary)]">
            {HELPLINE_TOLL_FREE}
          </a>
          {" · "}
          <Link href="/about" className="font-medium text-[var(--color-primary)]">
            About this app
          </Link>
        </p>
      </div>
    </div>
  );
}
