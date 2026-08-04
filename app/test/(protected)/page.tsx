import { TestDashboardMetrics } from "@/features/test/components/TestDashboardMetrics";
import { getTestDashboardCounts } from "@/features/test/server/dashboard";
import {
  DashboardHeader,
  DashboardSection,
  GlassCard,
  SecondaryButton,
} from "@/features/test/components/TestDashboardUI";

export default async function TestDashboardPage() {
  const counts = await getTestDashboardCounts();

  return (
    <div className="space-y-8">
      <DashboardHeader
        label="Overview"
        title="Test console"
      />
      <TestDashboardMetrics counts={counts} />
      <DashboardSection title="Workspaces" eyebrow="Choose a flow">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {[
            ["Applicants", "Create and enter applicant accounts.", "/test/applicant"],
            ["Jury", "Create jurors and review assignments.", "/test/jury"],
            ["Tickets", "Test payment and QR states.", "/test/tickets"],
            ["Emails", "Preview transactional templates.", "/test/emails"],
            ["Creations", "Inspect or remove test data.", "/test/creations"],
          ].map(([title, description, href]) => (
            <GlassCard key={title} className="flex min-h-40 flex-col justify-between p-5" hover>
              <div>
                <h2 className="font-sans text-lg font-semibold tracking-[-0.025em] text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p>
              </div>
              <SecondaryButton href={href} className="mt-5 self-start">Open</SecondaryButton>
            </GlassCard>
          ))}
        </div>
      </DashboardSection>
    </div>
  );
}
