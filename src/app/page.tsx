import Link from "next/link";
import { ShutdownCard } from "@/components/shutdowns/ShutdownCard";
import { EnablePushButton } from "@/components/push/EnablePushButton";
import { LocationTracker } from "@/components/home/LocationTracker";
import { HomeAds, HomeAdStrip } from "@/components/home/HomeAds";
import { EngagementTip } from "@/components/home/EngagementTip";
import { WelcomeGreeting } from "@/components/home/WelcomeGreeting";
import { NextShutdownCountdown } from "@/components/home/NextShutdownCountdown";
import { OutagePrepChecklist } from "@/components/home/OutagePrepChecklist";
import { ShareStatusButton } from "@/components/home/ShareStatusButton";
import { LivePulse } from "@/components/home/LivePulse";
import { KashmirFactsCarousel } from "@/components/home/KashmirFactsCarousel";
import { AllClearBanner } from "@/components/home/AllClearBanner";
import { VisitStreak } from "@/components/home/VisitStreak";
import {
  OfficialSiteMaintenance,
  isOfficialFeedDown,
} from "@/components/status/OfficialSiteMaintenance";
import { Badge } from "@/components/ui/Primitives";
import { APP_NAME, APP_TAGLINE, HELPLINE_PRIMARY, KPDCL_NOTIFICATIONS_URL } from "@/lib/constants";
import { getShutdownNotices } from "@/lib/shutdowns/cache";
import { getCurrentProfile, getUserSettings } from "@/lib/queries/profiles";
import { matchesUserArea } from "@/lib/localities";

export default async function HomePage() {
  const [{ notices, health }, profile] = await Promise.all([
    getShutdownNotices(),
    getCurrentProfile(),
  ]);

  if (isOfficialFeedDown(health)) {
    return (
      <div>
        <section className="border-b border-emerald-900/10 bg-[linear-gradient(135deg,#0b5f4b,#0a3f34)] text-white">
          <div className="mx-auto max-w-5xl px-4 py-10">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-100/80">
              Kashmir · KPDCL-aware alerts
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl md:text-4xl">{APP_NAME}</h1>
            <p className="mt-2 max-w-xl text-emerald-50/90">{APP_TAGLINE}</p>
          </div>
        </section>
        <OfficialSiteMaintenance health={health} />
        <div className="mx-auto max-w-5xl space-y-6 px-4 pb-12">
          <OutagePrepChecklist />
          <KashmirFactsCarousel />
        </div>
      </div>
    );
  }

  const settings = profile ? await getUserSettings(profile.id) : null;
  const loggedIn = Boolean(profile);
  const myAreas = settings
    ? ([settings.locality, ...(settings.watch_localities || [])].filter(Boolean) as string[])
    : [];

  const mine = myAreas.length
    ? notices.filter((n) => n.status !== "past" && matchesUserArea(n.localities, myAreas))
    : [];
  const activeMine = mine.filter((n) => n.status === "active");
  const upcomingMine = mine.filter((n) => n.status === "upcoming");

  const statusTone = !loggedIn
    ? "neutral"
    : activeMine.length
      ? "danger"
      : upcomingMine.length
        ? "warn"
        : "ok";
  const statusLabel = !loggedIn
    ? "Sign in to see alerts for your area"
    : activeMine.length
      ? "Shutdown active in your area"
      : upcomingMine.length
        ? "Upcoming shutdown near you"
        : myAreas.length
          ? "No matching shutdown for your area right now"
          : "Allow location or set your locality";

  return (
    <div>
      <section className="border-b border-emerald-900/10 bg-[linear-gradient(135deg,#0b5f4b,#0a3f34)] text-white">
        <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-100/80">
            Kashmir · KPDCL-aware alerts
          </p>
          <h1 className="animate-rise mt-3 max-w-2xl font-[family-name:var(--font-display)] text-4xl md:text-5xl">
            {APP_NAME}
          </h1>
          <p className="mt-4 max-w-xl text-emerald-50/90">{APP_TAGLINE}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {loggedIn ? (
              <Link
                href="/settings"
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-primary)]"
              >
                Adjust my locality
              </Link>
            ) : (
              <Link
                href="/auth/sign-in"
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-primary)]"
              >
                Sign in for my-area alerts
              </Link>
            )}
            <Link
              href={loggedIn ? "/shutdowns" : "/auth/sign-in?next=/shutdowns"}
              className="rounded-xl border border-white/30 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Browse all notifications
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-10 px-4 py-10">
        <div className="flex flex-wrap items-center gap-2">
          <LivePulse source={health.source} lastFetchAt={health.lastFetchAt} />
          <VisitStreak />
        </div>

        <HomeAdStrip />
        <EngagementTip />

        {loggedIn ? (
          <WelcomeGreeting name={profile?.full_name} locality={settings?.locality} />
        ) : null}

        <section className="card-surface animate-rise rounded-3xl p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl">My area status</h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {loggedIn
                  ? settings?.locality
                    ? `${settings.locality}${settings.district ? `, ${settings.district}` : ""}`
                    : "Detecting / waiting for location…"
                  : "Personal alerts unlock after you sign in"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={statusTone}>{statusLabel}</Badge>
              {loggedIn ? (
                <ShareStatusButton locality={settings?.locality} statusLabel={statusLabel} />
              ) : null}
            </div>
          </div>
          <p className="mt-4 text-xs text-[var(--color-muted)]">
            Live source: {health.source}
            {health.lastFetchAt ? ` · fetched ${new Date(health.lastFetchAt).toLocaleString("en-IN")}` : ""}
          </p>

          {loggedIn ? (
            <>
              <LocationTracker enabled currentLocality={settings?.locality || null} />
              <div className="mt-5">
                <EnablePushButton />
              </div>
            </>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-mist)]/50 p-4 text-sm text-[var(--color-muted)]">
              Sign in so we can detect your location, show only shutdowns that affect your area, and
              enable browser push.{" "}
              <Link href="/auth/sign-in" className="font-semibold text-[var(--color-primary)]">
                Sign in
              </Link>{" "}
              or{" "}
              <Link href="/auth/sign-up" className="font-semibold text-[var(--color-primary)]">
                create an account
              </Link>
              .
            </div>
          )}
        </section>

        {loggedIn ? (
          <section className="space-y-4">
            <AllClearBanner show={Boolean(myAreas.length && !mine.length)} />
            {upcomingMine.length ? <NextShutdownCountdown notices={mine} /> : null}
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-2xl">Affects your area</h2>
                <p className="text-sm text-[var(--color-muted)]">
                  Only notices matching your detected or saved locality.
                </p>
              </div>
              <Link href="/shutdowns" className="text-sm font-semibold text-[var(--color-primary)]">
                Browse all notifications
              </Link>
            </div>
            {mine.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {mine.map((n) => (
                  <ShutdownCard key={n.id} notice={n} highlight />
                ))}
              </div>
            ) : (
              <div className="card-surface rounded-2xl p-6 text-sm text-[var(--color-muted)]">
                {myAreas.length
                  ? "No active or upcoming shutdown matched your area right now."
                  : "Allow location access (or set locality in Settings) to filter alerts."}
                <div className="mt-3">
                  <Link href="/shutdowns" className="font-semibold text-[var(--color-primary)]">
                    Browse all notifications →
                  </Link>
                </div>
              </div>
            )}
          </section>
        ) : (
          <section className="card-surface rounded-3xl p-6 shadow-sm">
            <h2 className="font-[family-name:var(--font-display)] text-2xl">How it works</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-[var(--color-muted)]">
              <li>Sign in once</li>
              <li>We detect your Kashmir locality from GPS</li>
              <li>Home shows only shutdowns that can affect your area</li>
              <li>
                Use{" "}
                <Link
                  href="/auth/sign-in?next=/shutdowns"
                  className="font-semibold text-[var(--color-primary)]"
                >
                  Browse all notifications
                </Link>{" "}
                after sign-in for the full list
              </li>
            </ol>
          </section>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <OutagePrepChecklist />
          <KashmirFactsCarousel />
        </div>

        <HomeAds />

        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-mist)]/50 p-5 text-sm text-[var(--color-muted)]">
          <p>
            Helpline{" "}
            <a className="font-semibold text-[var(--color-primary)]" href={`tel:${HELPLINE_PRIMARY}`}>
              {HELPLINE_PRIMARY}
            </a>
            {" · "}
            <a
              className="font-semibold text-[var(--color-primary)]"
              href={KPDCL_NOTIFICATIONS_URL}
              target="_blank"
              rel="noreferrer"
            >
              Official KPDCL notices
            </a>
          </p>
          <p className="mt-2 text-xs">
            This is an unofficial helper app. Always cross-check critical plans with KPDCL.
          </p>
        </section>
      </div>
    </div>
  );
}
