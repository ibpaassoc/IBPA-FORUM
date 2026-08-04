import { ClipboardList, Mail, Scale, Shapes, Sparkles, Ticket, UsersRound } from "lucide-react";
import { getTestDashboardCounts } from "@/features/test/server/dashboard";
import {
  DashboardHeader,
  DashboardSection,
  GlassCard,
  MetricCard,
  SecondaryButton,
} from "@/shared/components/admin/DashboardUI";

export default async function TestDashboardPage() {
  const counts = await getTestDashboardCounts();
  const metrics = [
    ["Applicant accounts", counts.applicants, UsersRound],
    ["Jury accounts", counts.jury, Scale],
    ["Nominations", counts.nominations, ClipboardList],
    ["Emails", counts.emails, Mail],
    ["Tickets", counts.tickets, Ticket],
    ["Reviews", counts.reviews, Shapes],
    ["All test creations", counts.all, Sparkles],
  ] as const;

  return (
    <div className="space-y-8">
      <DashboardHeader
        label="Safe rehearsal space"
        title="Internal testing"
        description="Exercise production applicant, jury, email, payment, upload, and validation behavior with records that remain isolated from live operations."
      />
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(([label, value, Icon]) => (
          <MetricCard key={label} label={label} value={value} icon={Icon} />
        ))}
      </section>
      <DashboardSection title="Quick scenarios" eyebrow="End-to-end setup">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[
            ["Applicant scenarios", "No nominations, drafts, incomplete and submitted nominations.", "/test/applicant"],
            ["Jury scenarios", "Empty queues, assignments, partial and completed reviews.", "/test/jury"],
            ["Ticket scenarios", "Unpaid and paid tickets with isolated QR credentials.", "/test/tickets"],
            ["Full flow", "Applicant purchase through nomination and jury review.", "/test/applicant?scenario=full-flow"],
            ["Email catalog", "Preview or send every real transactional template.", "/test/emails"],
            ["Cleanup", "Inspect relationships and remove a scenario safely.", "/test/creations"],
          ].map(([title, description, href]) => (
            <GlassCard key={title} className="flex min-h-48 flex-col justify-between p-5" hover>
              <div>
                <h2 className="font-[var(--font-title-family)] text-2xl font-light">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--color-ink-soft)]">{description}</p>
              </div>
              <SecondaryButton href={href} className="mt-5 self-start">Open</SecondaryButton>
            </GlassCard>
          ))}
        </div>
      </DashboardSection>
    </div>
  );
}

