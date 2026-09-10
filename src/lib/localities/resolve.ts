import { canonicalLocalityName, getAllLocalities, normalizeLocalityText } from "@/lib/localities";
import { nearestLocality } from "@/lib/localities/coords";

export type ResolvedLocation = {
  district: string;
  locality: string;
  distanceKm: number | null;
  method: "text_match" | "nearest" | "manual";
  label: string;
};

function matchTextToLocality(candidates: string[]): { district: string; locality: string } | null {
  const all = getAllLocalities();
  for (const raw of candidates) {
    if (!raw) continue;
    const canon = canonicalLocalityName(raw);
    const norm = normalizeLocalityText(canon);
    const hit = all.find((a) => normalizeLocalityText(a.locality) === norm);
    if (hit) return hit;
    const partial = all.find(
      (a) =>
        normalizeLocalityText(a.locality).includes(norm) ||
        norm.includes(normalizeLocalityText(a.locality))
    );
    if (partial && norm.length >= 4) return partial;
  }
  return null;
}

export function resolveFromCoords(
  lat: number,
  lng: number,
  reverseParts?: {
    suburb?: string;
    neighbourhood?: string;
    village?: string;
    town?: string;
    city?: string;
    county?: string;
    state_district?: string;
    display_name?: string;
  }
): ResolvedLocation | null {
  const textCandidates = [
    reverseParts?.neighbourhood,
    reverseParts?.suburb,
    reverseParts?.village,
    reverseParts?.town,
    reverseParts?.city,
    reverseParts?.state_district,
    reverseParts?.county,
    ...(reverseParts?.display_name?.split(",") || []).map((s) => s.trim()),
  ].filter(Boolean) as string[];

  const textHit = matchTextToLocality(textCandidates);
  if (textHit) {
    return {
      ...textHit,
      distanceKm: null,
      method: "text_match",
      label: `${textHit.locality}, ${textHit.district}`,
    };
  }

  const near = nearestLocality(lat, lng);
  if (!near) return null;
  return {
    district: near.district,
    locality: near.locality,
    distanceKm: near.distanceKm,
    method: "nearest",
    label: `${near.locality}, ${near.district} (~${near.distanceKm} km)`,
  };
}
