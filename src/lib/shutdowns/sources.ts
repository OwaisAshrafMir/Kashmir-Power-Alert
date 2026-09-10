import type { NoticeSource } from "@/lib/types";

/** Sources that count as a successful official live feed (show app content, not maintenance). */
export const LIVE_OFFICIAL_SOURCES: NoticeSource[] = ["kpdcl", "kpdcl_portal", "dipr", "press"];

export function isLiveOfficialSource(source: string | null | undefined): boolean {
  return LIVE_OFFICIAL_SOURCES.includes((source || "") as NoticeSource);
}

export function sourceDisplayLabel(source: string): string {
  switch (source) {
    case "kpdcl":
      return "Live KPDCL (CE Distribution)";
    case "kpdcl_portal":
      return "Live KPDCL portal";
    case "dipr":
      return "Live via DIPR (official)";
    case "press":
      return "Live official KPDCL text (press)";
    case "unavailable":
      return "Standby · official feeds unreachable";
    default:
      return `Standby · ${source}`;
  }
}
