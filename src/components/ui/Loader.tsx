import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-5 w-5 animate-spin text-[var(--color-primary)]", className)} />;
}

export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 py-16">
      <div className="relative">
        <div className="h-14 w-14 animate-pulse rounded-full bg-[var(--color-primary)]/15" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner className="h-7 w-7" />
        </div>
      </div>
      <div className="text-center">
        <p className="font-[family-name:var(--font-display)] text-lg text-[var(--color-ink)]">{APP_NAME}</p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">{label}</p>
      </div>
      <div className="mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-[var(--color-mist)]">
        <div className="h-full w-1/2 animate-[shimmer_1.2s_ease-in-out_infinite] rounded-full bg-[var(--color-primary)]" />
      </div>
    </div>
  );
}

export function InlineLoader({ label = "Working…" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)]">
      <Spinner className="h-4 w-4" />
      {label}
    </span>
  );
}
