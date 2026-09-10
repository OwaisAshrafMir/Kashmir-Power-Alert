import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Primitives";
import {
  OfficialSiteMaintenance,
  isOfficialFeedDown,
} from "@/components/status/OfficialSiteMaintenance";
import { getNoticeById, getShutdownNotices } from "@/lib/shutdowns/cache";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { health } = await getShutdownNotices();
  if (isOfficialFeedDown(health)) return { title: "Official site unreachable" };
  const notice = getNoticeById(decodeURIComponent(id));
  return { title: notice?.title || "Shutdown detail" };
}

export default async function ShutdownDetailPage({ params }: Props) {
  const { id } = await params;
  const { health } = await getShutdownNotices();
  if (isOfficialFeedDown(health)) {
    return <OfficialSiteMaintenance health={health} />;
  }

  const notice = getNoticeById(decodeURIComponent(id));
  if (!notice) notFound();

  const tone = notice.status === "active" ? "danger" : notice.status === "upcoming" ? "warn" : "neutral";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/shutdowns" className="text-sm font-semibold text-[var(--color-primary)]">
        ← All shutdowns
      </Link>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone={tone}>{notice.status}</Badge>
        <Badge tone="neutral">{notice.sourceLabel}</Badge>
      </div>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl">{notice.title}</h1>
      <p className="mt-3 text-slate-600">{notice.summary}</p>

      <div className="mt-8 space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Timing</p>
          <p className="mt-1 text-sm">
            {notice.startsAt && notice.endsAt
              ? `${new Date(notice.startsAt).toLocaleString("en-IN")} – ${new Date(notice.endsAt).toLocaleTimeString("en-IN")}`
              : "See official notice"}
          </p>
        </div>
        {notice.lineName ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Line</p>
            <p className="mt-1 text-sm">{notice.lineName}</p>
          </div>
        ) : null}
        {notice.reason ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Reason</p>
            <p className="mt-1 text-sm">{notice.reason}</p>
          </div>
        ) : null}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Affected localities</p>
          <p className="mt-1 text-sm">{notice.localities.join(", ") || "See official notice"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Districts</p>
          <p className="mt-1 text-sm">{notice.districts.join(", ") || "Kashmir"}</p>
        </div>
        <a
          href={notice.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex text-sm font-semibold text-[var(--color-primary)]"
        >
          Open source notice
        </a>
      </div>
    </div>
  );
}
