import webpush from "web-push";
import { isSupabaseConfigured } from "@/lib/utils";
import type { ShutdownNotice } from "@/lib/types";
import { matchesUserArea } from "@/lib/localities";

export function getVapidPublicKey() {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
}

/** Quiet hours use Asia/Kolkata wall clock (HH:MM[:SS]). */
function isInQuietHours(start: string | null | undefined, end: string | null | undefined) {
  if (!start || !end) return false;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === "hour")?.value || 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value || 0);
  const now = hour * 60 + minute;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return false;
  const s = sh * 60 + sm;
  const e = eh * 60 + em;
  if (s === e) return false;
  if (s < e) return now >= s && now < e;
  return now >= s || now < e;
}

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:hello@kashmirpoweralerts.in";
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

export async function notifyUsersForNotices(notices: ShutdownNotice[]) {
  if (!isSupabaseConfigured() || !configureWebPush()) {
    return { sent: 0, skipped: notices.length, reason: "push_not_configured" };
  }

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();

  let sent = 0;

  for (const notice of notices) {
    const { data: existing } = await supabase
      .from("alert_fingerprints")
      .select("fingerprint")
      .eq("fingerprint", notice.fingerprint)
      .maybeSingle();

    if (existing) continue;

    await supabase.from("alert_fingerprints").upsert({
      fingerprint: notice.fingerprint,
      title: notice.title,
      first_seen_at: new Date().toISOString(),
      last_notified_at: new Date().toISOString(),
    });

    const { data: settings } = await supabase
      .from("user_settings")
      .select(
        "user_id, locality, watch_localities, notifications_enabled, quiet_hours_start, quiet_hours_end"
      )
      .eq("notifications_enabled", true);

    const targets = (settings || []).filter((s) => {
      if (isInQuietHours(s.quiet_hours_start, s.quiet_hours_end)) return false;
      const areas = [s.locality, ...(s.watch_localities || [])].filter(Boolean) as string[];
      return matchesUserArea(notice.localities, areas);
    });

    if (!targets.length) continue;

    const userIds = targets.map((t) => t.user_id);
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("*")
      .in("user_id", userIds);

    const payload = JSON.stringify({
      title: "Power shutdown near you",
      body: `${notice.title}${notice.startsAt ? ` · ${new Date(notice.startsAt).toLocaleString("en-IN")}` : ""}`,
      url: `/shutdowns/${encodeURIComponent(notice.id)}`,
    });

    for (const sub of subs || []) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        );
        sent += 1;
      } catch {
        // drop invalid endpoints
        await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
      }
    }
  }

  return { sent, skipped: 0 };
}
