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
    <div className="min-h-screen bg-white font-[var(--font-ui-family)] text-[#0A0A0A]">
      <div className="mx-auto flex w-full max-w-[1440px] items-start gap-5 px-4 py-5 md:px-6 lg:py-7">
        <JurySidebar juryName={juryName} expertiseAreas={expertiseAreas} />
        <main className="min-w-0 flex-1 pb-24 lg:pb-0">{children}</main>
      </div>
    </div>
  );
}
