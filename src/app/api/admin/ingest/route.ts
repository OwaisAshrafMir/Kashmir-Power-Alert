import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";
import { getShutdownNotices } from "@/lib/shutdowns/cache";
import { notifyUsersForNotices } from "@/lib/push/notify";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  if (!isSupabaseConfigured()) {
    return { error: NextResponse.json({ error: "Supabase not configured" }, { status: 503 }) };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorised" }, { status: 401 }) };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { supabase };
}

export async function POST() {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const { notices, health } = await getShutdownNotices({ force: true });
  const notify = await notifyUsersForNotices(notices.filter((n) => n.status !== "past"));
  return NextResponse.json({ ok: true, health, notify });
}

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;
  const { health } = await getShutdownNotices();
  return NextResponse.json({ health });
}
