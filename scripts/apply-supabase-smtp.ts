import { supabaseGoTemplates } from "../src/lib/email/templates";

const PROJECT_REF = "ypewbntxxcqfpexawwso";

async function main() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) {
    console.error(
      "Set SUPABASE_ACCESS_TOKEN (https://supabase.com/dashboard/account/tokens) then re-run:\n  npx tsx --tsconfig tsconfig.json scripts/apply-supabase-smtp.ts"
    );
    process.exit(1);
  }

  const t = supabaseGoTemplates();
  const payload = {
    external_email_enabled: true,
    smtp_admin_email: process.env.SMTP_FROM || "Info@wajed.co",
    smtp_host: process.env.SMTP_HOST || "smtp.office365.com",
    smtp_port: String(process.env.SMTP_PORT || "587"),
    smtp_user: process.env.SMTP_USER || "Info@wajed.co",
    smtp_pass: process.env.SMTP_PASS,
    smtp_sender_name: process.env.SMTP_FROM_NAME || "Kashmir Power Alerts",
    mailer_subjects_confirmation: "Confirm your Kashmir Power Alerts account",
    mailer_templates_confirmation_content: t.confirm,
    mailer_subjects_recovery: "Reset your Kashmir Power Alerts password",
    mailer_templates_recovery_content: t.recovery,
    mailer_subjects_magic_link: "Your Kashmir Power Alerts sign-in link",
    mailer_templates_magic_link_content: t.magic,
    mailer_subjects_invite: "You are invited to Kashmir Power Alerts",
    mailer_templates_invite_content: t.invite,
    mailer_subjects_email_change: "Confirm your new Kashmir Power Alerts email",
    mailer_templates_email_change_content: t.change,
    mailer_subjects_reauthentication: "{{ .Token }} is your Kashmir Power Alerts code",
    mailer_templates_reauthentication_content: t.reauth,
  };

  if (!payload.smtp_pass) {
    console.error("SMTP_PASS is missing in the environment.");
    process.exit(1);
  }

  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(res.status, text);
    process.exit(1);
  }
  console.log("Supabase Auth SMTP + email templates updated.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
