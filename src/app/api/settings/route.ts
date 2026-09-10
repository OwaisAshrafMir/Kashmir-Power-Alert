import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ settings: null });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ settings: data });
}

export async function PATCH(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  if (typeof body.district === "string") updates.district = body.district;
  if (typeof body.locality === "string") updates.locality = body.locality;
  if (Array.isArray(body.watch_localities)) updates.watch_localities = body.watch_localities;
  if (typeof body.notifications_enabled === "boolean") {
    updates.notifications_enabled = body.notifications_enabled;
  }
  if (body.quiet_hours_start === null || typeof body.quiet_hours_start === "string") {
    updates.quiet_hours_start = body.quiet_hours_start || null;
  }
  if (body.quiet_hours_end === null || typeof body.quiet_hours_end === "string") {
    updates.quiet_hours_end = body.quiet_hours_end || null;
  }

  const { data, error } = await supabase
    .from("user_settings")
    .upsert({ user_id: user.id, ...updates })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ settings: data });
}
