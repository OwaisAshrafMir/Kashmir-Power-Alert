import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to save your locality and push alerts.">
      <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
}
