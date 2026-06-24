import type { ReactNode } from "react";
import { getAuthenticatedJudgeScoringContext } from "@/features/admin/server/jury";
import JurySidebar from "@/features/jury/components/layout/JurySidebar";
import { DashboardShell } from "@/shared/components/admin/DashboardUI";

export default async function JuryLayout({ children }: { children: ReactNode }) {
  let juryName: string | undefined;
  let expertiseAreas: string[] = [];

  try {
    const judge = await getAuthenticatedJudgeScoringContext();
    juryName = judge.fullName;
    expertiseAreas = judge.expertiseAreas ?? [];
  } catch {
    // Not authenticated — pages handle their own redirects
  }

  return (
    <DashboardShell className="font-[var(--font-ui-family)]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-28 bottom-12 size-[24rem] rounded-full bg-[rgba(185,217,235,0.28)] blur-3xl" />
        <div className="absolute right-[-7rem] top-[-5rem] size-[24rem] rounded-full bg-[rgba(114,160,193,0.15)] blur-3xl" />
      </div>
      <div className="relative mx-auto flex w-full max-w-[1520px] items-start gap-5 px-3 pb-28 pt-4 sm:px-5 md:px-6 lg:px-7 lg:py-6">
        <JurySidebar juryName={juryName} expertiseAreas={expertiseAreas} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </DashboardShell>
  );
}
