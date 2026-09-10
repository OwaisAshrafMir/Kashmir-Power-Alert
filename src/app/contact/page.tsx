import type { Metadata } from "next";
import { AppLogo } from "@/components/brand/AppLogo";
import { HELPLINE_PRIMARY, HELPLINE_TOLL_FREE } from "@/lib/constants";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center gap-4">
        <AppLogo size="md" />
        <h1 className="font-[family-name:var(--font-display)] text-3xl">Contact</h1>
      </div>
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm text-slate-500">App support</p>
          <a href="mailto:hello@kashmirpoweralerts.in" className="text-lg font-semibold text-[var(--color-primary)]">
            hello@kashmirpoweralerts.in
          </a>
        </div>
        <div>
          <p className="text-sm text-slate-500">KPDCL helplines</p>
          <p className="font-medium">
            <a href={`tel:${HELPLINE_PRIMARY}`}>{HELPLINE_PRIMARY}</a>
            {" · "}
            <a href={`tel:${HELPLINE_TOLL_FREE}`}>{HELPLINE_TOLL_FREE}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
