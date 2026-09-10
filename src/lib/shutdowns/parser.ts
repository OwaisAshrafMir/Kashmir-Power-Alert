import { createFingerprint } from "@/lib/utils";
import { canonicalLocalityName, KASHMIR_LOCALITIES } from "@/lib/localities";
import type { ShutdownNotice, ShutdownStatus } from "@/lib/types";
import { KPDCL_NOTIFICATIONS_URL } from "@/lib/constants";

function statusFor(startsAt: string | null, endsAt: string | null): ShutdownStatus {
  const now = Date.now();
  const start = startsAt ? new Date(startsAt).getTime() : null;
  const end = endsAt ? new Date(endsAt).getTime() : null;
  if (start != null && end != null) {
    if (now >= start && now <= end) return "active";
    if (now < start) return "upcoming";
    return "past";
  }
  if (start != null && now < start) return "upcoming";
  if (end != null && now > end) return "past";
  return "upcoming";
}

function isoTodayPlus(days: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/** Realistic sample notices used when live scrape is unavailable. */
export function getSampleNotices(): ShutdownNotice[] {
  const samples: Array<Omit<ShutdownNotice, "id" | "fingerprint" | "status">> = [
    {
      title: "Scheduled shutdown — 33 kV Habak–Zakura Line",
      summary:
        "Power supply will remain affected on the Habak–Zakura line for erection works under RDSS.",
      lineName: "33 kV Habak–Zakura Line",
      reason: "Erection works under RDSS",
      districts: ["Srinagar"],
      localities: ["Inderhama", "Burzhama", "Danihama", "Rahbagh", "Gasoo", "Zakura", "Habak"],
      startsAt: isoTodayPlus(0, 8, 0),
      endsAt: isoTodayPlus(0, 14, 0),
      dates: [new Date().toISOString().slice(0, 10)],
      source: "sample",
      sourceUrl: KPDCL_NOTIFICATIONS_URL,
      sourceLabel: "KPDCL-style sample (live feed unavailable)",
      publishedAt: new Date().toISOString(),
    },
    {
      title: "Scheduled shutdown — 33 kV Airforce Line",
      summary:
        "Power supply to Humhama, Airport corridor and adjoining areas will be affected for maintenance.",
      lineName: "33 kV Airforce Line",
      reason: "Line maintenance",
      districts: ["Srinagar", "Budgam"],
      localities: [
        "Humhama",
        "Jeelani Abad",
        "Co-operative Colony",
        "Nadroo",
        "Sheikhpora",
        "PHQ",
        "Airport",
        "Hyderpora",
      ],
      startsAt: isoTodayPlus(1, 10, 0),
      endsAt: isoTodayPlus(1, 14, 0),
      dates: [new Date(Date.now() + 86400000).toISOString().slice(0, 10)],
      source: "sample",
      sourceUrl: KPDCL_NOTIFICATIONS_URL,
      sourceLabel: "KPDCL-style sample (live feed unavailable)",
      publishedAt: new Date().toISOString(),
    },
    {
      title: "Scheduled shutdown — 33 kV Budgam Line",
      summary: "Power supply to Budgam town and adjoining colonies will remain affected.",
      lineName: "33 kV Budgam Line",
      reason: "Maintenance works",
      districts: ["Budgam"],
      localities: [
        "Budgam",
        "Sabdan",
        "Nasrullahpora",
        "Jawalapora",
        "Ompora",
        "SIDCO Housing Colony",
        "NIFT",
      ],
      startsAt: isoTodayPlus(2, 8, 0),
      endsAt: isoTodayPlus(2, 14, 0),
      dates: [new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10)],
      source: "sample",
      sourceUrl: KPDCL_NOTIFICATIONS_URL,
      sourceLabel: "KPDCL-style sample (live feed unavailable)",
      publishedAt: new Date().toISOString(),
    },
    {
      title: "Scheduled shutdown — 33 kV Awantipora–Sangam 2nd Line",
      summary: "Pulwama belt areas will face scheduled interruption for infrastructure upgrades.",
      lineName: "33 kV Awantipora–Sangam 2nd Line",
      reason: "Infrastructure upgrades",
      districts: ["Pulwama"],
      localities: [
        "Awantipora",
        "Siamoh",
        "K-Koot",
        "Kiagam",
        "Hariparigam",
        "Chakoora",
        "Gulzarpora",
        "Panzgam",
        "Sangam",
      ],
      startsAt: isoTodayPlus(3, 9, 0),
      endsAt: isoTodayPlus(3, 15, 0),
      dates: [new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10)],
      source: "sample",
      sourceUrl: KPDCL_NOTIFICATIONS_URL,
      sourceLabel: "KPDCL-style sample (live feed unavailable)",
      publishedAt: new Date().toISOString(),
    },
  ];

  return samples.map((s) => {
    const fingerprint = createFingerprint([
      s.title,
      s.lineName || "",
      s.startsAt || "",
      s.endsAt || "",
      s.localities.join(","),
    ]);
    return {
      ...s,
      id: fingerprint,
      fingerprint,
      localities: s.localities.map(canonicalLocalityName),
      status: statusFor(s.startsAt, s.endsAt),
    };
  });
}

function extractLocalitiesFromText(text: string): string[] {
  const found = new Set<string>();
  const lower = text.toLowerCase();
  for (const district of KASHMIR_LOCALITIES) {
    for (const locality of district.localities) {
      const n = locality.toLowerCase();
      if (lower.includes(n)) found.add(canonicalLocalityName(locality));
    }
  }
  // common phrase: "X, Y and adjoining areas"
  const adjoining = text.match(
    /(?:power supply to|affecting|areas?[:\s]+)([A-Za-z0-9,\-\s]+?)(?:and adjoining|will remain|from\s+\d)/i
  );
  if (adjoining?.[1]) {
    adjoining[1]
      .split(/,| and /i)
      .map((p) => p.trim())
      .filter((p) => p.length > 2)
      .forEach((p) => found.add(canonicalLocalityName(p)));
  }
  return Array.from(found);
}

function extractTimeWindow(text: string): { startHour: number; startMin: number; endHour: number; endMin: number } | null {
  const m = text.match(
    /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?\s*(?:to|-|–|—)\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i
  );
  if (!m) return null;
  let startHour = Number(m[1]);
  const startMin = Number(m[2] || 0);
  let endHour = Number(m[4]);
  const endMin = Number(m[5] || 0);
  const startMer = (m[3] || m[6] || "").toUpperCase();
  const endMer = (m[6] || m[3] || "").toUpperCase();
  if (startMer === "PM" && startHour < 12) startHour += 12;
  if (startMer === "AM" && startHour === 12) startHour = 0;
  if (endMer === "PM" && endHour < 12) endHour += 12;
  if (endMer === "AM" && endHour === 12) endHour = 0;
  return { startHour, startMin, endHour, endMin };
}

function parseNoticeFromHtmlSnippet(title: string, body: string, href: string): ShutdownNotice | null {
  const text = `${title}\n${body}`;
  if (!/shutdown|power supply|curtailment/i.test(text)) return null;

  const localities = extractLocalitiesFromText(text);
  const window = extractTimeWindow(text);
  const today = new Date();
  let startsAt: string | null = null;
  let endsAt: string | null = null;
  if (window) {
    const start = new Date(today);
    start.setHours(window.startHour, window.startMin, 0, 0);
    const end = new Date(today);
    end.setHours(window.endHour, window.endMin, 0, 0);
    startsAt = start.toISOString();
    endsAt = end.toISOString();
  }

  const lineMatch = text.match(/33\s*kV[^\n,.]{0,60}/i);
  const fingerprint = createFingerprint([title, href, localities.join(","), startsAt || "", endsAt || ""]);

  return {
    id: fingerprint,
    fingerprint,
    title: title || "KPDCL power shutdown notice",
    summary: body.slice(0, 280) || title,
    lineName: lineMatch?.[0] || null,
    reason: /RDSS/i.test(text) ? "RDSS / erection works" : "Scheduled maintenance",
    districts: Array.from(
      new Set(
        localities
          .map((l) => KASHMIR_LOCALITIES.find((d) => d.localities.includes(l))?.district)
          .filter(Boolean) as string[]
      )
    ),
    localities,
    startsAt,
    endsAt,
    dates: [today.toISOString().slice(0, 10)],
    source: "kpdcl",
    sourceUrl: href.startsWith("http") ? href : KPDCL_NOTIFICATIONS_URL,
    sourceLabel: "KPDCL official notice",
    publishedAt: today.toISOString(),
    status: statusFor(startsAt, endsAt),
  };
}

/** Attempt live fetch from KPDCL notifications page. No sample fallback for public UI. */
export async function fetchLiveNotices(): Promise<{
  notices: ShutdownNotice[];
  source: "kpdcl" | "unavailable";
  error: string | null;
}> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(KPDCL_NOTIFICATIONS_URL, {
      headers: {
        "User-Agent": "KashmirPowerAlerts/1.0 (utility helper; contact local)",
        Accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      return {
        notices: [],
        source: "unavailable",
        error: `Official KPDCL site returned HTTP ${res.status}`,
      };
    }

    const html = await res.text();
    const notices: ShutdownNotice[] = [];

    // Extract table-ish rows / anchors with shutdown wording
    const rowRegex =
      /<(?:tr|div)[^>]*>[\s\S]*?(power\s*shutdown|approved\s*power\s*shutdown|curtailment)[\s\S]*?<\/(?:tr|div)>/gi;
    const matches = html.match(rowRegex) || [];

    for (const chunk of matches.slice(0, 20)) {
      const titleMatch = chunk.match(/>([^<]*(?:shutdown|curtailment)[^<]*)</i);
      const hrefMatch = chunk.match(/href=["']([^"']+)["']/i);
      const text = chunk.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      const notice = parseNoticeFromHtmlSnippet(
        titleMatch?.[1]?.trim() || text.slice(0, 100),
        text,
        hrefMatch?.[1] || KPDCL_NOTIFICATIONS_URL
      );
      if (notice) notices.push(notice);
    }

    // Also scan plain links
    if (!notices.length) {
      const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)</gi;
      let m: RegExpExecArray | null;
      while ((m = linkRegex.exec(html)) && notices.length < 15) {
        const title = m[2].trim();
        if (!/shutdown|power|curtailment/i.test(title)) continue;
        const notice = parseNoticeFromHtmlSnippet(title, title, m[1]);
        if (notice) notices.push(notice);
      }
    }

    if (!notices.length) {
      return {
        notices: [],
        source: "unavailable",
        error: "Official KPDCL page loaded but no shutdown notices could be read",
      };
    }

    // Dedupe by fingerprint
    const map = new Map<string, ShutdownNotice>();
    for (const n of notices) map.set(n.fingerprint, n);

    return {
      notices: Array.from(map.values()).map((n) => ({
        ...n,
        status: statusFor(n.startsAt, n.endsAt),
      })),
      source: "kpdcl",
      error: null,
    };
  } catch (e) {
    const message =
      e instanceof Error
        ? e.name === "AbortError"
          ? "Official KPDCL site timed out (unreachable)"
          : e.message === "fetch failed"
            ? "Official KPDCL site is unreachable"
            : e.message
        : "Official KPDCL site is unreachable";
    return {
      notices: [],
      source: "unavailable",
      error: message,
    };
  }
}
