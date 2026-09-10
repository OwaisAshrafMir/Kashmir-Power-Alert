import { AppLogo } from "@/components/brand/AppLogo";
import { APP_NAME } from "@/lib/constants";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <div className="flex justify-center">
          <AppLogo size="lg" priority />
        </div>
        <p className="mt-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]">
          {APP_NAME}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--color-ink)]">
          {title}
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">{subtitle}</p>
      </div>
      <div className="card-surface rounded-3xl p-6 shadow-sm">{children}</div>
    </div>
  );
}
