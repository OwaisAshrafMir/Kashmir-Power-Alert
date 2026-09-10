"use client";

import { useEffect, useId, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/Primitives";
import { APP_NAME } from "@/lib/constants";

const HIDE_KEY = "kpa-source-disclaimer-hide";
const SESSION_KEY = "kpa-source-disclaimer-seen";

export function SourceDisclaimerModal() {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(HIDE_KEY) === "1") return;
      if (sessionStorage.getItem(SESSION_KEY) === "1") return;
      sessionStorage.setItem(SESSION_KEY, "1");
      setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  function close() {
    try {
      if (dontShowAgain) localStorage.setItem(HIDE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={close}
    >
      <div
        className="animate-rise max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-full p-1.5 text-[var(--color-muted)] hover:bg-[var(--color-mist)]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <h2
          id={titleId}
          className="mt-4 font-[family-name:var(--font-display)] text-2xl text-[var(--color-ink)]"
        >
          How we get shutdown notices
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
          {APP_NAME} is an unofficial helper. We pull the latest scheduled shutdowns from{" "}
          <strong className="font-semibold text-[var(--color-ink)]">multiple sources</strong> — KPDCL
          pages, J&amp;K DIPR press releases, and official KPDCL wording reprinted in the press —
          whichever is reachable. We still{" "}
          <strong className="font-semibold text-[var(--color-ink)]">cannot guarantee 100%</strong>{" "}
          that every notice appears here, or that it appears instantly.
        </p>

        <ul className="mt-4 space-y-2 text-sm text-[var(--color-muted)]">
          <li className="rounded-xl bg-[var(--color-mist)]/80 px-3 py-2">
            KPDCL does not offer a public live API. Official sites are often down, empty, or slow.
          </li>
          <li className="rounded-xl bg-[var(--color-mist)]/80 px-3 py-2">
            Some circulars are uploaded only as PDFs or photos (for example on social media), which
            we cannot always read.
          </li>
          <li className="rounded-xl bg-[var(--color-mist)]/80 px-3 py-2">
            A notice can take minutes to hours to show up after KPDCL issues it, until a source we
            can read republishes the text.
          </li>
          <li className="rounded-xl bg-[var(--color-mist)]/80 px-3 py-2">
            Always cross-check urgent plans with KPDCL helpline{" "}
            <a href="tel:1912" className="font-semibold text-[var(--color-primary)]">
              1912
            </a>
            .
          </li>
        </ul>

        <label className="mt-5 flex cursor-pointer items-start gap-2 text-sm text-[var(--color-ink)]">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-[var(--color-border)]"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
          />
          Don’t show this again on this device
        </label>

        <Button type="button" className="mt-4 w-full" onClick={close}>
          I understand
        </Button>
      </div>
    </div>
  );
}
