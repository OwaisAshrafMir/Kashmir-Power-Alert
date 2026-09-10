import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { getCurrentUser, getUserSettings } from "@/lib/queries/profiles";
import { isSupabaseConfigured } from "@/lib/utils";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="font-[family-name:var(--font-display)] text-3xl">Settings</h1>
        <p className="mt-3 text-slate-600">
          Connect Supabase in `.env.local` to save locality and notification preferences.
        </p>
      </div>
    );
  }

  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in?next=/settings");
  const settings = await getUserSettings(user.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-[family-name:var(--font-display)] text-3xl">Alert settings</h1>
      <p className="mt-2 text-slate-600">
        Choose your home locality so we can match live KPDCL-style shutdown notices to your area.
      </p>
      <div className="mt-8">
        <SettingsForm initial={settings} />
      </div>
    </div>
  );
}
