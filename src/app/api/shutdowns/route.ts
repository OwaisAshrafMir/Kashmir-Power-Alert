import { NextResponse } from "next/server";
import { getShutdownNotices } from "@/lib/shutdowns/cache";
import { matchesUserArea } from "@/lib/localities";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locality = searchParams.get("locality") || undefined;
  const district = searchParams.get("district") || undefined;
  const mine = searchParams.get("mine") === "1";
  const watch = (searchParams.get("watch") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const { notices, health } = await getShutdownNotices();

  let filtered = notices.filter((n) => n.status !== "past");

  if (district) {
    filtered = filtered.filter(
      (n) =>
        n.districts.some((d) => d.toLowerCase() === district.toLowerCase()) ||
        n.localities.some((l) => l.toLowerCase().includes(district.toLowerCase()))
    );
  }

  if (mine && (locality || watch.length)) {
    const areas = [locality, ...watch].filter(Boolean) as string[];
    filtered = filtered.filter((n) => matchesUserArea(n.localities, areas));
  } else if (locality) {
    filtered = filtered.filter((n) => matchesUserArea(n.localities, [locality]));
  }

  return NextResponse.json({
    notices: filtered,
    health,
    count: filtered.length,
  });
}
