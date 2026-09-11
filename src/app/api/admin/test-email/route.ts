import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";
import { isSmtpConfigured, sendSmtpMail } from "@/lib/email/smtp";
import { wrapEmail } from "@/lib/email/templates";
import { APP_NAME } from "@/lib/constants";

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
  return { user };
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;
  if (!isSmtpConfigured()) {
    return NextResponse.json({ error: "SMTP is not configured on the server" }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as { to?: string };
  const to = body.to || auth.user?.email;
  if (!to) return NextResponse.json({ error: "No destination email" }, { status: 400 });

  const html = wrapEmail({
    heading: "SMTP test successful",
    bodyHtml: `<p style="margin:0;">This message was sent from ${APP_NAME} using your Info@wajed.co mailbox. Auth emails (signup / reset) will use the same design once Custom SMTP is enabled on Supabase.</p>`,
  });

  try {
    await sendSmtpMail({
      to,
      subject: `${APP_NAME} · SMTP test`,
      html,
    });
    return NextResponse.json({ ok: true, to });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Send failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
