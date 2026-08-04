import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { requireTestSession } from "@/features/test/server/auth";
import { TestNavigation } from "@/features/test/components/TestNavigation";
import { DashboardShell } from "@/features/test/components/TestDashboardUI";
import { logoutOfTestSystem } from "../actions";

export const dynamic = "force-dynamic";

export default async function ProtectedTestLayout({ children }: { children: ReactNode }) {
  await requireTestSession();
  return (
    <DashboardShell>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-16 size-[34rem] rounded-full bg-white/[0.035] blur-3xl" />
        <div className="absolute right-[-10rem] top-[-9rem] size-[30rem] rounded-full bg-zinc-500/[0.055] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.4)_1px,transparent_1px)] [background-size:64px_64px]" />
      </div>
      <div className="relative mx-auto w-full max-w-[1480px] px-3 pb-20 pt-4 sm:px-5 lg:px-7 lg:py-6">
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <p className="text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-zinc-500">Test console</p>
          <form action={logoutOfTestSystem}>
            <button type="submit" className="inline-flex min-h-9 items-center gap-2 rounded-full px-3 text-xs font-semibold text-zinc-500 hover:bg-white/[0.06] hover:text-white">
              <LogOut aria-hidden size={14} /> Logout
            </button>
          </form>
        </div>
        <TestNavigation />
        {children}
      </div>
    </DashboardShell>
  );
}
