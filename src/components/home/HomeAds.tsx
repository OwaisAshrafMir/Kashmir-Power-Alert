import Link from "next/link";
import { Megaphone, ShieldCheck, Zap } from "lucide-react";

const ADS = [
  {
    id: "ad-inverter",
    eyebrow: "Sponsored",
    title: "Stay powered through outages",
    body: "Home inverter & battery kits for Kashmir winters — free site survey in Srinagar & Budgam.",
    cta: "View offers",
    href: "/contact",
    accent: "from-[#0b5f4b] to-[#0a3f34]",
    icon: Zap,
  },
  {
    id: "ad-insurance",
    eyebrow: "Sponsored",
    title: "Protect your appliances",
    body: "Voltage-surge cover for TVs, routers and refrigerators during scheduled shutdowns.",
    cta: "Learn more",
    href: "/about",
    accent: "from-[#8a4b12] to-[#5c320c]",
    icon: ShieldCheck,
  },
  {
    id: "ad-local",
    eyebrow: "Partner spotlight",
    title: "Advertise to Kashmir households",
    body: "Reach residents right when they check power alerts. Local businesses welcome.",
    cta: "Advertise with us",
    href: "/contact",
    accent: "from-[#1e3a5f] to-[#0f243d]",
    icon: Megaphone,
  },
];

export function HomeAds() {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl">For you</h2>
          <p className="text-sm text-[var(--color-muted)]">Helpful offers while you check power status.</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {ADS.map((ad) => {
          const Icon = ad.icon;
          return (
            <Link
              key={ad.id}
              href={ad.href}
              className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${ad.accent} p-5 text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg`}
            >
              <span className="inline-flex rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                {ad.eyebrow}
              </span>
              <div className="mt-4 flex items-start justify-between gap-3">
                <h3 className="font-[family-name:var(--font-display)] text-xl leading-snug">{ad.title}</h3>
                <Icon className="h-6 w-6 shrink-0 opacity-80" />
              </div>
              <p className="mt-2 text-sm text-white/85">{ad.body}</p>
              <span className="mt-4 inline-flex text-sm font-semibold underline-offset-4 group-hover:underline">
                {ad.cta} →
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function HomeAdStrip() {
  return (
    <div className="overflow-hidden rounded-2xl border border-amber-200/80 bg-[linear-gradient(90deg,#fff7ed,#fffbeb,#ecfdf5)] px-4 py-3 dark:border-amber-500/20 dark:bg-[linear-gradient(90deg,#2a2112,#1a241c)]">
      <p className="text-center text-sm text-[var(--color-ink)]">
        <span className="mr-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 dark:bg-amber-500/20 dark:text-amber-200">
          Ad
        </span>
        Kashmir winters tip — keep phone power banks charged before planned morning shutdowns.{" "}
        <Link href="/contact" className="font-semibold text-[var(--color-primary)]">
          Partner with us
        </Link>
      </p>
    </div>
  );
}
