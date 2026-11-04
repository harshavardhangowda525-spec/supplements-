import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { LoginForm } from "@/components/admin/login-form";
import { SetupNotice } from "@/components/admin/setup-notice";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Sign in" };

export default function AdminLoginPage() {
  const configured = isSupabaseConfigured();
  return (
    <main className="grain relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_0%,rgb(198_255_0/0.12),transparent)]" />
      <div className={configured ? "relative w-full max-w-sm" : "relative w-full max-w-3xl"}>
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo href="/" />
          <h1 className="display text-4xl">Store admin</h1>
        </div>
        {configured ? (
          <div className="metal-border rounded-3xl p-6 sm:p-8">
            <LoginForm />
          </div>
        ) : (
          <SetupNotice />
        )}
        <p className="mt-6 text-center text-xs text-mist">
          <Link href="/" className="hover:text-lime">
            ← Back to the website
          </Link>
        </p>
      </div>
    </main>
  );
}
