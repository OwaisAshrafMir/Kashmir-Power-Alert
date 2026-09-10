import type { IngestHealth, ShutdownNotice } from "@/lib/types";
import { fetchLiveNotices } from "@/lib/shutdowns/parser";

type CacheShape = {
  notices: ShutdownNotice[];
  health: IngestHealth;
  fetchedAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __kpaShutdownCache: CacheShape | undefined;
}

const TTL_MS = 10 * 60 * 1000; // 10 minutes when live
const DOWN_TTL_MS = 2 * 60 * 1000; // retry sooner when official site is down

function getCache(): CacheShape | undefined {
  return globalThis.__kpaShutdownCache;
}

function setCache(value: CacheShape) {
  globalThis.__kpaShutdownCache = value;
}

export async function getShutdownNotices(opts?: {
  force?: boolean;
}): Promise<{ notices: ShutdownNotice[]; health: IngestHealth }> {
  const cached = getCache();
  const ttl = cached?.health.source === "kpdcl" ? TTL_MS : DOWN_TTL_MS;
  const fresh = cached && Date.now() - cached.fetchedAt < ttl;

  if (!opts?.force && fresh) {
    return { notices: cached.notices, health: cached.health };
  }

  const result = await fetchLiveNotices();
  const health: IngestHealth = {
    lastFetchAt: new Date().toISOString(),
    lastSuccessAt:
      result.source === "kpdcl"
        ? new Date().toISOString()
        : cached?.health.lastSuccessAt || null,
    noticeCount: result.notices.length,
    source: result.source,
    error: result.error,
  };

  const sorted = [...result.notices].sort((a, b) => {
    const rank = { active: 0, upcoming: 1, past: 2 } as const;
    const r = rank[a.status] - rank[b.status];
    if (r !== 0) return r;
    return (a.startsAt || "").localeCompare(b.startsAt || "");
  });

  setCache({ notices: sorted, health, fetchedAt: Date.now() });
  return { notices: sorted, health };
}

export function getCachedHealth(): IngestHealth | null {
  return getCache()?.health || null;
}

export function getNoticeById(id: string): ShutdownNotice | null {
  return getCache()?.notices.find((n) => n.id === id || n.fingerprint === id) || null;
}
