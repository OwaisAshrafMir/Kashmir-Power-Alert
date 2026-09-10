import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata: Metadata = { title: "Sign up" };

export default function SignUpPage() {
  return (
    <AuthShell title="Create account" subtitle="Free for all Kashmir residents. Set your area and get alerts.">
      <SignUpForm />
    </AuthShell>
  );
}
