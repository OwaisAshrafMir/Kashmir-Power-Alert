import type { Metadata } from "next";
import { ShutdownCard } from "@/components/shutdowns/ShutdownCard";
import {
  OfficialSiteMaintenance,
  isOfficialFeedDown,
} from "@/components/status/OfficialSiteMaintenance";
import { getShutdownNotices } from "@/lib/shutdowns/cache";

export const metadata: Metadata = { title: "Shutdowns" };

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ShutdownsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const district = typeof sp.district === "string" ? sp.district : "";
  const q = typeof sp.q === "string" ? sp.q.toLowerCase() : "";

  const { notices, health } = await getShutdownNotices();

  if (isOfficialFeedDown(health)) {
    return <OfficialSiteMaintenance health={health} />;
  }

  let list = notices.filter((n) => n.status !== "past");
  if (district) {
    list = list.filter((n) => n.districts.some((d) => d.toLowerCase() === district.toLowerCase()));
  }
  if (q) {
    list = list.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.localities.some((l) => l.toLowerCase().includes(q)) ||
        (n.lineName || "").toLowerCase().includes(q)
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-[family-name:var(--font-display)] text-3xl">All notifications</h1>
      <p className="mt-2 text-slate-600">
        Full Kashmir shutdown list · {list.length} notices · source {health.source}
      </p>

      <form className="mt-6 flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search locality or line"
          className="min-w-[220px] flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
        />
        <select
          name="district"
          defaultValue={district}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
        >
          <option value="">All districts</option>
          {["Srinagar", "Budgam", "Pulwama", "Anantnag", "Baramulla", "Kupwara", "Ganderbal", "Kulgam", "Shopian"].map(
            (d) => (
              <option key={d} value={d}>
                {d}
              </option>
            )
          )}
        </select>
        <button
          type="submit"
          className="rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white"
        >
          Filter
        </button>
      </form>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {list.map((n) => (
          <ShutdownCard key={n.id} notice={n} />
        ))}
      </div>
    </div>
  );
}
