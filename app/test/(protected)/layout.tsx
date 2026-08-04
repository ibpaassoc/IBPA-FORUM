import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { requireTestSession } from "@/features/test/server/auth";
import { TestNavigation } from "@/features/test/components/TestNavigation";
import { DashboardShell } from "@/shared/components/admin/DashboardUI";
import { logoutOfTestSystem } from "../actions";

export const dynamic = "force-dynamic";

export default async function ProtectedTestLayout({ children }: { children: ReactNode }) {
  await requireTestSession();
  return (
    <DashboardShell className="font-[var(--font-ui-family)]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-20 size-[22rem] rounded-full bg-[rgba(185,217,235,0.28)] blur-3xl" />
        <div className="absolute right-[-8rem] top-[-6rem] size-[26rem] rounded-full bg-[rgba(114,160,193,0.16)] blur-3xl" />
      </div>
      <div className="relative mx-auto w-full max-w-[1480px] px-3 pb-20 pt-4 sm:px-5 lg:px-7 lg:py-6">
        <div className="mb-3 flex items-center justify-between gap-3 px-2">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-blue)]">IBPA isolated test scope</p>
          <form action={logoutOfTestSystem}>
            <button type="submit" className="inline-flex min-h-9 items-center gap-2 rounded-full px-3 text-xs font-semibold text-[var(--color-ink-soft)] hover:bg-white/80 hover:text-[var(--color-ink)]">
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

