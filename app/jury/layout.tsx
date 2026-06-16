import type { ReactNode } from "react";
import { getAuthenticatedJudgeScoringContext } from "@/features/admin/server/jury";
import JurySidebar from "@/features/jury/components/layout/JurySidebar";

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
    <div className="min-h-screen bg-[#F4F7FB] font-[var(--font-inter)]">
      <div className="mx-auto flex w-full max-w-[1400px] items-start gap-6 px-4 py-6 md:px-6 lg:py-8">
        <JurySidebar juryName={juryName} expertiseAreas={expertiseAreas} />
        <main className="min-w-0 flex-1 pb-24 lg:pb-0">{children}</main>
      </div>
    </div>
  );
}
