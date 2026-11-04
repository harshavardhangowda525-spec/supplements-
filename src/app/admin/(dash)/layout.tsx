import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { SetupNotice } from "@/components/admin/setup-notice";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdmin } from "@/lib/admin/auth";
import { signOut } from "@/lib/admin/actions";
import { isSupabaseConfigured } from "@/lib/supabase/env";

async function AdminGate({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <>
        <h1 className="display mb-6 text-5xl">Admin dashboard</h1>
        <SetupNotice />
      </>
    );
  }
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return (
    <>
      <div className="mb-6 flex items-center justify-end gap-3 text-xs text-mist">
        Signed in as <span className="text-white">{admin.user.email}</span>
        <form action={signOut}>
          <button type="submit" className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 hover:border-lime hover:text-lime">
            <LogOut className="size-3.5" /> Sign out
          </button>
        </form>
      </div>
      {children}
    </>
  );
}

function AdminLoading() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-12 w-64 bg-white/5" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl bg-white/5" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-2xl bg-white/5" />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Suspense fallback={<div className="h-16 border-b border-white/10 bg-charcoal/70 lg:fixed lg:inset-y-0 lg:left-0 lg:h-auto lg:w-64 lg:border-r" />}>
        <AdminSidebar />
      </Suspense>
      <main className="px-4 py-6 sm:px-6 lg:ml-64 lg:px-10 lg:py-10">
        <Suspense fallback={<AdminLoading />}>
          <AdminGate>{children}</AdminGate>
        </Suspense>
      </main>
    </div>
  );
}
