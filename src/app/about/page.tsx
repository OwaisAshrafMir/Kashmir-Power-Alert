import type { Metadata } from "next";
import { AppLogo } from "@/components/brand/AppLogo";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center gap-4">
        <AppLogo size="lg" priority />
        <h1 className="font-[family-name:var(--font-display)] text-3xl">About {APP_NAME}</h1>
      </div>
      <div className="space-y-4 leading-relaxed text-slate-700">
        <p>
          {APP_NAME} helps Kashmir residents see scheduled power shutdowns that may affect their
          locality, and optionally receive browser push notifications.
        </p>
        <p>
          Shutdown content is fetched live from official KPDCL / DIPR sources when they work.
          If those pages are down or stale, we also parse recent press reprints that carry the
          official “Chief Engineer, Distribution, KPDCL” wording (not original news reporting).
          We do not keep a permanent outage database — only your account, settings and push
          subscriptions are stored in Supabase.
        </p>
        <p>
          This is an unofficial helper. For emergencies or disputes, contact KPDCL helplines
          directly.
        </p>
      </div>
    </div>
  );
}
