import type { ReactNode } from "react";
import AdminSidebar from "@/features/admin/components/layout/AdminSidebar";
import { DashboardShell } from "@/shared/components/admin/DashboardUI";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    return (
      <DashboardShell className="font-[var(--font-ui-family)]">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 size-[26rem] -translate-x-1/2 rounded-full bg-[rgba(185,217,235,0.24)] blur-3xl" />
        </div>
        <main className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-10">
          {children}
        </main>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell className="font-[var(--font-ui-family)]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-20 size-[22rem] rounded-full bg-[rgba(185,217,235,0.28)] blur-3xl" />
        <div className="absolute right-[-8rem] top-[-6rem] size-[26rem] rounded-full bg-[rgba(114,160,193,0.16)] blur-3xl" />
      </div>
      <div className="relative mx-auto flex w-full max-w-[1520px] items-start gap-5 px-3 pb-28 pt-4 sm:px-5 md:px-6 lg:px-7 lg:py-6">
        <AdminSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </DashboardShell>
  );
}
