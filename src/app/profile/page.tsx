import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Primitives";
import { getCurrentProfile } from "@/lib/queries/profiles";
import { isSupabaseConfigured } from "@/lib/utils";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  if (!isSupabaseConfigured()) redirect("/auth/sign-in");
  const profile = await getCurrentProfile();
  if (!profile) redirect("/auth/sign-in?next=/profile");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-[family-name:var(--font-display)] text-3xl">Your profile</h1>
      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Name</p>
            <p className="text-lg font-semibold">{profile.full_name || "Not set"}</p>
          </div>
          <div className="flex gap-2">
            <Badge tone="neutral">{profile.role}</Badge>
            <Badge tone="ok">{profile.plan}</Badge>
          </div>
        </div>
        <div className="mt-5">
          <p className="text-sm text-slate-500">Email</p>
          <p className="font-medium">{profile.email}</p>
        </div>
        <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold text-[var(--color-primary)]">
          <Link href="/settings">Alert settings</Link>
          {profile.role === "admin" ? <Link href="/admin">Admin</Link> : null}
        </div>
        <p className="mt-6 text-xs text-slate-500">
          Plan is free for everyone right now. Pro multi-area / SMS will come later.
        </p>
      </div>
    </div>
  );
}
