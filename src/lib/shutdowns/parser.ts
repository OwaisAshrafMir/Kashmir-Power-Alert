import { createFingerprint } from "@/lib/utils";
import { canonicalLocalityName, KASHMIR_LOCALITIES } from "@/lib/localities";
import type { NoticeSource, ShutdownNotice, ShutdownStatus } from "@/lib/types";
import {
  DIPR_BASE_URL,
  DIPR_HOME_URL,
  KPDCL_NOTIFICATIONS_URL,
  KPDCL_PORTAL_NOTIFICATIONS_URL,
  KPDCL_PORTAL_URL,
  PRESS_RSS_FEEDS,
} from "@/lib/constants";
import { isLiveOfficialSource } from "@/lib/shutdowns/sources";

const FETCH_HEADERS = {
  "User-Agent": "KashmirPowerAlerts/1.0 (utility helper; contact local)",
  Accept: "text/html,application/xhtml+xml",
};

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

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchHtml(url: string, timeoutMs = 12000): Promise<{ ok: true; html: string } | { ok: false; error: string }> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      headers: FETCH_HEADERS,
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return { ok: false, error: `HTTP ${res.status} from ${url}` };
    return { ok: true, html: await res.text() };
  } catch (e) {
    const message =
      e instanceof Error
        ? e.name === "AbortError"
          ? `Timed out: ${url}`
          : e.message === "fetch failed"
            ? `Unreachable: ${url}`
            : e.message
        : `Unreachable: ${url}`;
    return { ok: false, error: message };
  }
}

/** Realistic sample notices (not used for public UI). */
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
      sourceUrl: KPDCL_PORTAL_NOTIFICATIONS_URL,
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
      if (n.length >= 4 && lower.includes(n)) found.add(canonicalLocalityName(locality));
    }
  }
  const adjoining = text.match(
    /(?:power supply to|affecting|areas?[:\s]+)([A-Za-z0-9,\-\s]+?)(?:and adjoining|will remain|from\s+\d)/i
  );
  if (adjoining?.[1]) {
    adjoining[1]
      .split(/,| and /i)
      .map((p) => p.trim())
      .filter((p) => p.length > 2 && p.length < 40)
      .filter((p) => !/will|affected|adjoining|power|supply|shutdown|hospital|town|railway/i.test(p))
      .forEach((p) => found.add(canonicalLocalityName(p)));
  }
  return Array.from(found).filter((p) => !/will|affected|adjoining/i.test(p));
}

function extractTimeWindow(text: string): {
  startHour: number;
  startMin: number;
  endHour: number;
  endMin: number;
} | null {
  const m = text.match(
    /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?\s*(?:to|-|–|—)\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i
  );
  if (!m) return null;
  let startHour = Number(m[1]);
  const startMin = Number(m[2] || 0);
  let endHour = Number(m[4]);
  const endMin = Number(m[5] || 0);
  const startMer = (m[3] || "").toUpperCase();
  const endMer = (m[6] || m[3] || "").toUpperCase();
  if (startMer === "PM" && startHour < 12) startHour += 12;
  if (startMer === "AM" && startHour === 12) startHour = 0;
  if (endMer === "PM" && endHour < 12) endHour += 12;
  if (endMer === "AM" && endHour === 12) endHour = 0;
  return { startHour, startMin, endHour, endMin };
}

const MONTHS: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

/** Parse dates like "on 10 September 2026", "on 09 & 12 September 2026", "10, 13 & 16 Sep 2026". */
function extractCalendarDates(text: string): Date[] {
  const out: Date[] = [];
  const re =
    /(?:on\s+)?(\d{1,2}(?:\s*[,&]\s*\d{1,2})*(?:\s*&\s*\d{1,2})?)\s+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\.?\s+(\d{4})/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const dayPart = m[1];
    const month = MONTHS[m[2].toLowerCase()];
    const year = Number(m[3]);
    if (month == null || !year) continue;
    const days = dayPart.split(/[,&]/).map((d) => Number(d.trim())).filter((d) => d >= 1 && d <= 31);
    for (const day of days) {
      const dt = new Date(year, month, day, 0, 0, 0, 0);
      if (!Number.isNaN(dt.getTime())) out.push(dt);
    }
  }
  return out;
}

function buildWindowIso(
  baseDate: Date,
  window: { startHour: number; startMin: number; endHour: number; endMin: number } | null
): { startsAt: string | null; endsAt: string | null } {
  if (!window) return { startsAt: null, endsAt: null };
  const start = new Date(baseDate);
  start.setHours(window.startHour, window.startMin, 0, 0);
  const end = new Date(baseDate);
  end.setHours(window.endHour, window.endMin, 0, 0);
  return { startsAt: start.toISOString(), endsAt: end.toISOString() };
}

type SourceMeta = {
  source: NoticeSource;
  sourceLabel: string;
  defaultUrl: string;
};

function isUsableNotice(n: ShutdownNotice): boolean {
  if (n.localities.length === 0 && !n.lineName) return false;
  if (n.startsAt) return n.localities.length > 0 || !!n.lineName;
  // Without a parseable time window, require a richer locality list
  return n.localities.length >= 3;
}

function parseNoticeFromText(
  title: string,
  body: string,
  href: string,
  meta: SourceMeta
): ShutdownNotice | null {
  const text = `${title}\n${body}`;
  if (!/shutdown|power supply|curtailment|33\s*kV|11\s*kV/i.test(text)) return null;
  // Title-only / empty portal rows are not enough
  if (
    /^(curtailment schedule|notifications?|orders?|circulars?)$/i.test(title.trim()) &&
    body.trim().length < 80
  ) {
    return null;
  }
  if (/tariff|petition|MYT|business plan|APR of FY/i.test(title) && !/shutdown/i.test(title)) {
    return null;
  }

  const localities = extractLocalitiesFromText(text);
  const window = extractTimeWindow(text);
  const calendarDates = extractCalendarDates(text);
  const primaryDay = calendarDates[0] || new Date();
  const { startsAt, endsAt } = buildWindowIso(primaryDay, window);

  const lineMatch = text.match(/(?:33|11)\s*kV[^\n,.]{0,80}/i);
  const fingerprint = createFingerprint([
    (lineMatch?.[0] || title).toLowerCase(),
    localities.slice().sort().join(","),
    calendarDates.map((d) => d.toISOString().slice(0, 10)).join(","),
    window ? `${window.startHour}:${window.startMin}-${window.endHour}:${window.endMin}` : "",
  ]);

  const notice: ShutdownNotice = {
    id: fingerprint,
    fingerprint,
    title: title || "KPDCL power shutdown notice",
    summary: body.slice(0, 280) || title,
    lineName: lineMatch?.[0]?.trim() || null,
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
    dates:
      calendarDates.length > 0
        ? calendarDates.map((d) => d.toISOString().slice(0, 10))
        : [primaryDay.toISOString().slice(0, 10)],
    source: meta.source,
    sourceUrl: href.startsWith("http") ? href : meta.defaultUrl,
    sourceLabel: meta.sourceLabel,
    publishedAt: new Date().toISOString(),
    status: statusFor(startsAt, endsAt),
  };

  return isUsableNotice(notice) ? notice : null;
}

function parseHtmlListing(
  html: string,
  meta: SourceMeta
): ShutdownNotice[] {
  const notices: ShutdownNotice[] = [];

  const rowRegex =
    /<(?:tr|div)[^>]*>[\s\S]*?(power\s*shutdown|approved\s*power\s*shutdown|scheduled(?:ed)?\s*maintain|curtailment)[\s\S]*?<\/(?:tr|div)>/gi;
  const matches = html.match(rowRegex) || [];

  for (const chunk of matches.slice(0, 25)) {
    const titleMatch = chunk.match(/>([^<]*(?:shutdown|curtailment|maintain)[^<]*)</i);
    const hrefMatch = chunk.match(/href=["']([^"']+)["']/i);
    const text = stripHtml(chunk);
    const notice = parseNoticeFromText(
      titleMatch?.[1]?.trim() || text.slice(0, 120),
      text,
      hrefMatch?.[1] || meta.defaultUrl,
      meta
    );
    if (notice) notices.push(notice);
  }

  if (!notices.length) {
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let m: RegExpExecArray | null;
    while ((m = linkRegex.exec(html)) && notices.length < 20) {
      const href = m[1];
      const title = stripHtml(m[2]).trim();
      if (!/shutdown|power|curtailment|maintain/i.test(title)) continue;
      // Skip pure tariff petitions
      if (/tariff|petition|MYT|APR/i.test(title) && !/shutdown/i.test(title)) continue;
      const abs = href.startsWith("http")
        ? href
        : href.startsWith("/")
          ? new URL(href, meta.defaultUrl).toString()
          : meta.defaultUrl;
      const notice = parseNoticeFromText(title, title, abs, meta);
      if (notice) notices.push(notice);
    }
  }

  return dedupeNotices(notices).filter(isUsableNotice);
}

function dedupeNotices(notices: ShutdownNotice[]): ShutdownNotice[] {
  const map = new Map<string, ShutdownNotice>();
  for (const n of notices) {
    map.set(n.fingerprint, { ...n, status: statusFor(n.startsAt, n.endsAt) });
  }
  return Array.from(map.values());
}

async function fetchFromCeDistribution(): Promise<{
  notices: ShutdownNotice[];
  error: string | null;
}> {
  const res = await fetchHtml(KPDCL_NOTIFICATIONS_URL, 4000);
  if (!res.ok) return { notices: [], error: res.error };
  const notices = parseHtmlListing(res.html, {
    source: "kpdcl",
    sourceLabel: "KPDCL CE Distribution notice",
    defaultUrl: KPDCL_NOTIFICATIONS_URL,
  });
  if (!notices.length) {
    return { notices: [], error: "CE Distribution page loaded but no shutdown notices found" };
  }
  return { notices, error: null };
}

async function fetchFromPortal(): Promise<{
  notices: ShutdownNotice[];
  error: string | null;
}> {
  const res = await fetchHtml(KPDCL_PORTAL_NOTIFICATIONS_URL, 12000);
  if (!res.ok) return { notices: [], error: res.error };
  const notices = parseHtmlListing(res.html, {
    source: "kpdcl_portal",
    sourceLabel: "KPDCL official portal notice",
    defaultUrl: KPDCL_PORTAL_NOTIFICATIONS_URL,
  });
  if (!notices.length) {
    return {
      notices: [],
      error: "KPDCL portal notifications page has no shutdown circulars yet",
    };
  }
  return { notices, error: null };
}

async function fetchFromDipr(): Promise<{
  notices: ShutdownNotice[];
  error: string | null;
}> {
  const home = await fetchHtml(DIPR_HOME_URL, 15000);
  if (!home.ok) return { notices: [], error: home.error };

  const releaseLinks: { title: string; url: string }[] = [];
  const linkRegex = /<a[^>]+href=["']([^"']*Prnv\?n=\d+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = linkRegex.exec(home.html)) && releaseLinks.length < 12) {
    const href = m[1];
    const title = stripHtml(m[2]).trim();
    if (!/power\s*shutdown|KPDCL|JPDCL/i.test(title)) continue;
    const url = href.startsWith("http") ? href : `${DIPR_BASE_URL}/${href.replace(/^\//, "")}`;
    if (releaseLinks.some((r) => r.url === url)) continue;
    releaseLinks.push({ title, url });
  }

  if (!releaseLinks.length) {
    return { notices: [], error: "DIPR home has no recent KPDCL / power shutdown releases" };
  }

  const notices: ShutdownNotice[] = [];
  for (const link of releaseLinks.slice(0, 8)) {
    const page = await fetchHtml(link.url, 12000);
    if (!page.ok) continue;
    const text = stripHtml(page.html);
    // Prefer the body after the title marker
    const bodyMatch = text.match(
      /Power Shutdown by KPDCL([\s\S]{80,2500}?)(?:Department of Information|Home Who|Subscribe|$)/i
    );
    const body = (bodyMatch?.[1] || text).slice(0, 2200);
    if (!/shutdown|33\s*kV|11\s*kV|power supply/i.test(body)) continue;

    // Split multi-paragraph CE notices into chunks when multiple "shutdown of" appear
    const chunks = body.split(/(?=(?:Similarly|Likewise|Also),?\s+shutdown)/i);
    for (const chunk of chunks) {
      const lineMatch = chunk.match(/Shutdown of\s+([^.]+?)(?:\s+will be|\s+due)/i);
      const title =
        lineMatch?.[1]
          ? `Scheduled shutdown — ${lineMatch[1].trim()}`
          : link.title.replace(/^[\d\sA-Za-z]{0,20}/, "").trim() || "Power Shutdown by KPDCL";
      const notice = parseNoticeFromText(title, chunk.trim(), link.url, {
        source: "dipr",
        sourceLabel: "Official DIPR press release (KPDCL)",
        defaultUrl: DIPR_HOME_URL,
      });
      if (notice) notices.push(notice);
    }
  }

  const deduped = dedupeNotices(notices).filter(isUsableNotice);
  if (!deduped.length) {
    return { notices: [], error: "DIPR releases found but could not parse shutdown details" };
  }
  return { notices: deduped, error: null };
}

function noticesFromOfficialBody(body: string, url: string, meta: SourceMeta): ShutdownNotice[] {
  if (!/KPDCL/i.test(body) || !/shutdown|33\s*kV|11\s*kV/i.test(body)) return [];
  const start = body.search(/Chief Engineer|According to (?:the )?KPDCL|KPDCL has informed|Power supply to several/i);
  const focused = (start >= 0 ? body.slice(start) : body).slice(0, 4000);
  const chunks = focused.split(/(?=(?:Similarly|Likewise|Also|Meanwhile),?\s+(?:the\s+)?(?:shutdown|Chief Engineer))/i);
  const notices: ShutdownNotice[] = [];
  for (const chunk of chunks) {
    const lineMatch = chunk.match(/Shutdown of\s+([^.]+?)(?:\s+will be|\s+due)/i)
      || chunk.match(/(\d{2}\s*kV[^.]+?line)/i);
    const title = lineMatch?.[1]
      ? `Scheduled shutdown — ${lineMatch[1].trim()}`
      : "Scheduled shutdown — KPDCL";
    const notice = parseNoticeFromText(title, chunk.trim(), url, meta);
    if (notice) notices.push(notice);
  }
  return notices;
}

function parseRssItems(xml: string): { title: string; link: string; description: string }[] {
  const items: { title: string; link: string; description: string }[] = [];
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
  for (const block of blocks) {
    const title =
      block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i)?.[1]
      || block.match(/<title>([\s\S]*?)<\/title>/i)?.[1]
      || "";
    const link = (block.match(/<link>([\s\S]*?)<\/link>/i)?.[1] || "").trim();
    const description =
      block.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/i)?.[1]
      || block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i)?.[1]
      || block.match(/<description>([\s\S]*?)<\/description>/i)?.[1]
      || "";
    if (!link) continue;
    items.push({ title: stripHtml(title), link, description: stripHtml(description) });
  }
  return items;
}

async function fetchFromPressWires(): Promise<{
  notices: ShutdownNotice[];
  error: string | null;
}> {
  const meta: SourceMeta = {
    source: "press",
    sourceLabel: "Official KPDCL text via press reprint",
    defaultUrl: KPDCL_PORTAL_URL,
  };
  const notices: ShutdownNotice[] = [];
  const errors: string[] = [];
  const seenLinks = new Set<string>();

  for (const feed of PRESS_RSS_FEEDS) {
    const rss = await fetchHtml(feed, 12000);
    if (!rss.ok) {
      errors.push(rss.error);
      continue;
    }
    for (const item of parseRssItems(rss.html).slice(0, 6)) {
      if (seenLinks.has(item.link)) continue;
      if (!/shutdown|KPDCL/i.test(`${item.title} ${item.description}`)) continue;
      seenLinks.add(item.link);

      let body = item.description;
      if (!/will be affected/i.test(body) || body.length < 400) {
        const page = await fetchHtml(item.link, 10000);
        if (page.ok) body = stripHtml(page.html);
      }
      notices.push(...noticesFromOfficialBody(body, item.link, meta));
    }
  }

  const deduped = dedupeNotices(notices).filter(isUsableNotice);
  if (!deduped.length) {
    return {
      notices: [],
      error: errors[0] || "Press reprints found but no parseable official KPDCL shutdown text",
    };
  }
  return { notices: deduped, error: null };
}

function pickHealthSource(notices: ShutdownNotice[]): NoticeSource {
  const live = notices.filter((n) => n.status !== "past");
  const pool = live.length ? live : notices;
  const rank: Record<string, number> = { kpdcl: 0, kpdcl_portal: 1, press: 2, dipr: 3 };
  return [...pool].sort((a, b) => (rank[a.source] ?? 9) - (rank[b.source] ?? 9))[0]?.source || "press";
}

export type FetchLiveResult = {
  notices: ShutdownNotice[];
  source: NoticeSource;
  error: string | null;
  tried: string[];
};

/**
 * Merge all reachable official sources.
 * Press reprints of CE/KPDCL text fill the gap when DIPR homepage is stale
 * and the KPDCL portal has no circulars.
 * No sample fallback for public UI.
 */
export async function fetchLiveNotices(): Promise<FetchLiveResult> {
  const tried: string[] = [];
  const errors: string[] = [];
  const collected: ShutdownNotice[] = [];

  const press = await fetchFromPressWires();
  tried.push("press");
  collected.push(...press.notices);
  if (press.error && !press.notices.length) errors.push(press.error);

  const dipr = await fetchFromDipr();
  tried.push("dipr");
  collected.push(...dipr.notices);
  if (dipr.error && !dipr.notices.length) errors.push(dipr.error);

  const portal = await fetchFromPortal();
  tried.push("kpdcl_portal");
  collected.push(...portal.notices);
  if (portal.error && !portal.notices.length) errors.push(portal.error);

  const alreadyLive = collected.some((n) => n.status !== "past");
  if (!alreadyLive) {
    const ce = await fetchFromCeDistribution();
    tried.push("ce_distribution");
    collected.push(...ce.notices);
    if (ce.error && !ce.notices.length) errors.push(ce.error);
  } else {
    tried.push("ce_distribution_skipped");
  }

  const notices = dedupeNotices(collected).filter(isUsableNotice);
  if (!notices.length) {
    return {
      notices: [],
      source: "unavailable",
      error: errors.filter(Boolean).join(" · ") || "All official notice sources unreachable",
      tried,
    };
  }

  return {
    notices,
    source: pickHealthSource(notices),
    error: null,
    tried,
  };
}

export { isLiveOfficialSource, KPDCL_PORTAL_URL };
