import Link from "next/link";
import { AppLogo } from "@/components/brand/AppLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { getCurrentProfile } from "@/lib/queries/profiles";
import { SignOutButton } from "@/components/auth/SignOutButton";

export async function Header() {
  const profile = await getCurrentProfile();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-snow)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <AppLogo size="sm" priority />
          <span className="min-w-0">
            <span className="block truncate font-[family-name:var(--font-display)] text-base leading-tight text-[var(--color-ink)] md:text-lg">
              Kashmir Power Alerts
            </span>
            <span className="text-[11px] text-[var(--color-muted)]">Kashmir utility alerts</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-[var(--color-muted)] md:flex">
          <Link
            href={profile ? "/shutdowns" : "/auth/sign-in?next=/shutdowns"}
            className="hover:text-[var(--color-primary)]"
          >
            Shutdowns
          </Link>
          <Link href="/settings" className="hover:text-[var(--color-primary)]">
            Settings
          </Link>
          {profile?.role === "admin" ? (
            <Link href="/admin" className="hover:text-[var(--color-primary)]">
              Admin
            </Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {profile ? (
            <>
              <Link
                href="/profile"
                className="rounded-full bg-[var(--color-card)] px-3 py-2 text-sm font-medium ring-1 ring-[var(--color-border)]"
              >
                {profile.full_name || "Profile"}
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/auth/sign-in" className="text-sm font-medium text-[var(--color-muted)]">
                Sign in
              </Link>
              <Link
                href="/auth/sign-up"
                className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white dark:text-[#06241b]"
              >
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
