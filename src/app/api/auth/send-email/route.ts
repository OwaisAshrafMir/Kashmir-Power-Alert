import { NextResponse } from "next/server";
import { isSmtpConfigured, sendSmtpMail } from "@/lib/email/smtp";
import { emailForAuthAction } from "@/lib/email/templates";

export const dynamic = "force-dynamic";

type HookPayload = {
  user?: { email?: string };
  email_data?: {
    token?: string;
    token_hash?: string;
    redirect_to?: string;
    email_action_type?: string;
    site_url?: string;
    token_new?: string;
    token_hash_new?: string;
  };
};

function verifyHookSecret(request: Request) {
  const expected = process.env.SEND_EMAIL_HOOK_SECRET;
  if (!expected) return true;
  const header = request.headers.get("authorization") || request.headers.get("x-supabase-signature") || "";
  return header.includes(expected) || header === `Bearer ${expected}`;
}

function verifyUrl(emailData: NonNullable<HookPayload["email_data"]>) {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  const type = emailData.email_action_type || "signup";
  const hash = emailData.token_hash || emailData.token || "";
  const redirect = emailData.redirect_to || process.env.NEXT_PUBLIC_APP_URL || "";
  return `${supabaseUrl}/auth/v1/verify?token=${encodeURIComponent(hash)}&type=${encodeURIComponent(type)}&redirect_to=${encodeURIComponent(redirect)}`;
}

export async function POST(request: Request) {
  if (!verifyHookSecret(request)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  if (!isSmtpConfigured()) {
    return NextResponse.json({ error: "SMTP is not configured" }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as HookPayload;
  const to = body.user?.email;
  const emailData = body.email_data;
  if (!to || !emailData) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const type = emailData.email_action_type || "signup";
  const url = verifyUrl(emailData);
  const mail = emailForAuthAction(type, url, emailData.token, undefined);
  await sendSmtpMail({ to, subject: mail.subject, html: mail.html });
  return NextResponse.json({ ok: true });
}
