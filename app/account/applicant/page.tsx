import { CreditCard, FileText, Plus, QrCode, UserRound } from "lucide-react";
import { getApplicantDashboardData } from "@/features/account/server/applicant-dashboard";
import TicketQrPanel from "@/features/tickets/components/TicketQrPanel";
import {
  DashboardBadge,
  DashboardCard,
  DashboardEmptyState,
  DashboardPageHeader,
  DashboardPanel,
  PremiumButton,
  SecondaryButton,
} from "@/shared/components/admin/DashboardUI";

function formatDate(value: Date | null | undefined) {
  return value
    ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(value)
    : "Not set";
}

function nominationAction(nomination: {
  id: string;
  status: string;
  lockedAt: Date | null;
}) {
  if (nomination.lockedAt || nomination.status === "LOCKED") return "Locked";
  if (nomination.status === "SUBMITTED" || nomination.status === "UNDER_REVIEW") return "Review submission";
  return "Continue nomination";
}

function daysUntil(value: Date) {
  return Math.max(0, Math.ceil((value.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

export default async function ApplicantDashboardPage() {
  const data = await getApplicantDashboardData();

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader label="Account" title="Applicant dashboard" />

        <DashboardPanel>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-blue)]">
                Welcome, {data.applicantProfile.fullName}
              </p>
              <h2 className="mt-2 font-[var(--font-title-family)] text-3xl font-light text-[var(--color-ink)]">
                Complete each purchased nomination before {formatDate(data.deadline)}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--color-ink-soft)]">
                {data.closedAt
                  ? `Applications closed on ${formatDate(data.closedAt)}. Submitted nominations are read-only for judging.`
                  : `${daysUntil(data.deadline)} day(s) remaining. Purchased and draft nominations are not visible to judges until submitted.`}
              </p>
            </div>
            <PremiumButton href="/account/applicant/add-nomination"><Plus size={16} /> Add nominations</PremiumButton>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <DashboardCard className="p-4">
              <DashboardBadge tone="neutral">Purchased</DashboardBadge>
              <p className="mt-3 text-sm leading-6 text-[var(--color-ink-soft)]">Paid and waiting for required details.</p>
            </DashboardCard>
            <DashboardCard className="p-4">
              <DashboardBadge tone="amber">Draft</DashboardBadge>
              <p className="mt-3 text-sm leading-6 text-[var(--color-ink-soft)]">Saved progress, not visible to judges.</p>
            </DashboardCard>
            <DashboardCard className="p-4">
              <DashboardBadge tone="green">Submitted</DashboardBadge>
              <p className="mt-3 text-sm leading-6 text-[var(--color-ink-soft)]">Visible to judges and editable until applications close.</p>
            </DashboardCard>
          </div>
        </DashboardPanel>

        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <section className="flex flex-col gap-5">
            <DashboardPanel>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="font-[var(--font-title-family)] text-3xl font-light text-[var(--color-ink)]">
                    My nominations
                  </h2>
                  <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
                    {data.applicantProfile.fullName} · {data.account.status.toLowerCase()} account
                  </p>
                </div>
              </div>
              {data.nominations.length === 0 ? (
                <DashboardEmptyState
                  icon={<FileText size={20} />}
                  title="No nominations yet"
                  description="Paid nominations will appear here after checkout is confirmed."
                />
              ) : (
                <div className="grid gap-3">
                  {data.nominations.map((nomination) => (
                    <DashboardCard key={nomination.id} className="p-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <DashboardBadge tone={nomination.lockedAt ? "purple" : "neutral"}>
                              {nomination.lockedAt ? "Locked" : nomination.status.toLowerCase().replaceAll("_", " ")}
                            </DashboardBadge>
                            <DashboardBadge tone={nomination.missingRequiredCount === 0 ? "green" : "amber"}>
                              {nomination.completionPercentage}% complete
                            </DashboardBadge>
                          </div>
                          <h2 className="mt-3 font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">
                            {nomination.award.name}
                          </h2>
                          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
                            {nomination.category.name} · Updated {formatDate(nomination.updatedAt)}
                          </p>
                          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                            {nomination.missingRequiredCount === 0
                              ? "No required fields missing."
                              : `${nomination.missingRequiredCount} required item(s) missing.`}
                          </p>
                        </div>
                        <SecondaryButton href={`/account/applicant/nominations/${nomination.id}`}>
                          {nominationAction(nomination)}
                        </SecondaryButton>
                      </div>
                    </DashboardCard>
                  ))}
                </div>
              )}
            </DashboardPanel>
          </section>

          <aside className="flex flex-col gap-5">
            <DashboardPanel>
              <h2 className="font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">
                Profile
              </h2>
              <p className="mb-4 mt-1 text-sm text-[var(--color-ink-soft)]">Reusable applicant details</p>
              <div className="flex items-start gap-3 text-sm text-[var(--color-ink-soft)]">
                <UserRound className="mt-1 shrink-0 text-[var(--color-blue)]" size={18} />
                <div>
                  <p className="font-semibold text-[var(--color-ink)]">{data.applicantProfile.fullName}</p>
                  <p>{data.account.email}</p>
                  <p>{[data.applicantProfile.city, data.applicantProfile.country].filter(Boolean).join(", ") || "Location not set"}</p>
                </div>
              </div>
            </DashboardPanel>

            <DashboardPanel>
              <h2 className="font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">
                Ticket & QR code
              </h2>
              <p className="mb-4 mt-1 text-sm text-[var(--color-ink-soft)]">Forum and gala access</p>
              {data.tickets.length === 0 ? (
                <DashboardEmptyState
                  icon={<QrCode size={20} />}
                  title="No ticket found"
                  description="Tickets purchased with this email will appear here after payment."
                />
              ) : (
                <div className="grid gap-3">
                  {data.tickets.map((ticket) => (
                    <DashboardCard key={ticket.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <CreditCard className="mt-1 shrink-0 text-[var(--color-blue)]" size={18} />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[var(--color-ink)]">{ticket.fullName}</p>
                          <p className="text-sm text-[var(--color-ink-soft)]">
                            {ticket.type.replace("_", " ").toLowerCase()} · {ticket.galaDinner ? "Gala included" : "Forum access"}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <DashboardBadge tone={ticket.status === "PAID" ? "green" : "neutral"}>
                              {ticket.status.toLowerCase().replaceAll("_", " ")}
                            </DashboardBadge>
                            <DashboardBadge tone="blue">Purchased {formatDate(ticket.createdAt)}</DashboardBadge>
                          </div>
                          {ticket.qrDataUrl ? (
                            <TicketQrPanel
                              ticketId={ticket.id}
                              fullName={ticket.fullName}
                              qrDataUrl={ticket.qrDataUrl}
                            />
                          ) : (
                            <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
                              QR code is not active yet.
                            </p>
                          )}
                        </div>
                      </div>
                    </DashboardCard>
                  ))}
                </div>
              )}
            </DashboardPanel>
          </aside>
        </div>
    </div>
  );
}
