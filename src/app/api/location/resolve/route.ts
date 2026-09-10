import { NextResponse } from "next/server";
import { resolveFromCoords } from "@/lib/localities/resolve";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const lat = Number(body.lat);
  const lng = Number(body.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }
  // Rough Kashmir bounds
  if (lat < 32.5 || lat > 35.5 || lng < 73.5 || lng > 76.5) {
    return NextResponse.json(
      { error: "Location looks outside Kashmir. Set locality manually in Settings." },
      { status: 400 }
    );
  }

  let reverseParts: Record<string, string> | undefined;
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "json");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("zoom", "16");
    url.searchParams.set("addressdetails", "1");

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "KashmirPowerAlerts/1.0 (local utility app)",
        Accept: "application/json",
      },
      next: { revalidate: 0 },
    });
    if (res.ok) {
      const data = await res.json();
      reverseParts = {
        ...(data.address || {}),
        display_name: data.display_name,
      };
    }
  } catch {
    // nearest-match fallback still works
  }

  const resolved = resolveFromCoords(lat, lng, reverseParts);
  if (!resolved) {
    return NextResponse.json(
      { error: "Could not map your location to a known Kashmir locality." },
      { status: 404 }
    );
  }

  return NextResponse.json({ resolved, lat, lng });
}
