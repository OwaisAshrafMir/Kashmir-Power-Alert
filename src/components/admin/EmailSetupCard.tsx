"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Primitives";
import { useToast } from "@/components/ui/Toast";
import { supabaseGoTemplates } from "@/lib/email/templates";

const SMTP_PROJECT = "https://supabase.com/dashboard/project/ypewbntxxcqfpexawwso/auth/smtp";
const TEMPLATES_PROJECT = "https://supabase.com/dashboard/project/ypewbntxxcqfpexawwso/auth/templates";

export function EmailSetupCard() {
  const { push } = useToast();
  const [copied, setCopied] = useState("");
  const templates = supabaseGoTemplates();

  async function copy(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    push(`Copied ${label}`);
  }

  return (
    <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50/70 p-6 shadow-sm dark:border-amber-500/30 dark:bg-amber-950/30">
      <h2 className="font-semibold text-[var(--color-ink)]">Auth emails still using Supabase</h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
        Signup and forgot-password mail is sent by <strong>Supabase Auth</strong>, not by this Next.js
        app. Until Custom SMTP is saved in the dashboard, users will keep getting{" "}
        <code className="text-xs">noreply@mail.app.supabase.io</code> with the default template.
      </p>

      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-[var(--color-ink)]">
        <li>
          Open{" "}
          <a className="font-semibold text-[var(--color-primary)]" href={SMTP_PROJECT} target="_blank" rel="noreferrer">
            Authentication → SMTP
          </a>
          , enable Custom SMTP, save:
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--color-muted)]">
            <li>Host: <code>smtp.office365.com</code></li>
            <li>Port: <code>587</code></li>
            <li>User / Sender email: <code>Info@wajed.co</code></li>
            <li>Sender name: <code>Kashmir Power Alerts</code></li>
            <li>Password: the Wajed mailbox password</li>
          </ul>
        </li>
        <li>
          Open{" "}
          <a className="font-semibold text-[var(--color-primary)]" href={TEMPLATES_PROJECT} target="_blank" rel="noreferrer">
            Authentication → Email Templates
          </a>
          . For <strong>Confirm signup</strong> and <strong>Reset password</strong>, paste the HTML below
          (keep <code>{"{{ .ConfirmationURL }}"}</code>).
        </li>
        <li>Sign up again with a new test address. From should be Info@wajed.co.</li>
      </ol>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => copy("Confirm signup HTML", templates.confirm)}>
          {copied === "Confirm signup HTML" ? "Copied" : "Copy Confirm signup HTML"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => copy("Reset password HTML", templates.recovery)}>
          {copied === "Reset password HTML" ? "Copied" : "Copy Reset password HTML"}
        </Button>
      </div>
    </div>
  );
}
