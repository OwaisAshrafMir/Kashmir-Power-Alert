import type { Metadata } from "next";
import { ForceIngestButton } from "@/components/admin/ForceIngestButton";
import { Badge } from "@/components/ui/Primitives";
import { getShutdownNotices } from "@/lib/shutdowns/cache";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const { notices, health } = await getShutdownNotices();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-[family-name:var(--font-display)] text-3xl">Admin</h1>
      <p className="mt-2 text-slate-600">Ingest health and force refresh. Outage bodies are not stored permanently.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Notices in cache</p>
          <p className="mt-1 text-3xl font-bold">{notices.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Source</p>
          <p className="mt-2">
            <Badge tone={health.source === "kpdcl" ? "ok" : "warn"}>{health.source}</Badge>
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Last fetch</p>
          <p className="mt-1 text-sm font-medium">
            {health.lastFetchAt ? new Date(health.lastFetchAt).toLocaleString("en-IN") : "—"}
          </p>
        </div>
      </div>

      {health.error ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {health.error}
        </p>
      ) : null}

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Actions</h2>
        <p className="mt-1 text-sm text-slate-600">
          Force a live re-fetch and attempt push matching for new fingerprints.
        </p>
        <div className="mt-4">
          <ForceIngestButton />
        </div>
      </div>
    </div>
  );
}
