import { CreditCard, FileText, Plus, QrCode, UserRound } from "lucide-react";
import { getApplicantDashboardData } from "@/features/account/server/applicant-dashboard";
import {
  DashboardBadge,
  DashboardCard,
  DashboardEmptyState,
  DashboardMetricTile,
  DashboardPageHeader,
  DashboardPanel,
  DashboardShell,
  PremiumButton,
  SecondaryButton,
} from "@/shared/components/admin/DashboardUI";

function formatDate(value: Date | null | undefined) {
  return value
    ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(value)
    : "Not set";
}

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function paymentBadge(status: string) {
  if (status === "PAID") return <DashboardBadge tone="green">Paid</DashboardBadge>;
  if (status === "PENDING") return <DashboardBadge tone="amber">Payment pending</DashboardBadge>;
  return <DashboardBadge tone="red">{status.toLowerCase()}</DashboardBadge>;
}

function nominationAction(nomination: {
  id: string;
  paymentStatus: string;
  status: string;
  lockedAt: Date | null;
}) {
  if (nomination.lockedAt || nomination.status === "LOCKED") return "Locked";
  if (nomination.paymentStatus !== "PAID") return "Pay";
  if (nomination.status === "SUBMITTED" || nomination.status === "UNDER_REVIEW") return "Review submission";
  return "Continue nomination";
}

export default async function ApplicantDashboardPage() {
  const data = await getApplicantDashboardData();

  return (
    <DashboardShell className="font-[var(--font-ui-family)]">
      <main className="mx-auto flex w-full max-w-[1320px] flex-col gap-5 px-3 pb-24 pt-4 sm:px-5 md:px-6 lg:px-7 lg:py-6">
        <DashboardPageHeader label="Account" title="Applicant dashboard" />

        <div className="grid gap-3 md:grid-cols-5">
          <DashboardMetricTile label="Nominations" value={data.totals.nominations} />
          <DashboardMetricTile label="Paid" value={data.totals.paid} accent="green" />
          <DashboardMetricTile label="Incomplete" value={data.totals.incomplete} accent="amber" />
          <DashboardMetricTile label="Submitted" value={data.totals.submitted} accent="blue" />
          <DashboardMetricTile label="Locked" value={data.totals.locked} accent="purple" />
        </div>

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
                <PremiumButton href="/account/applicant/add-nomination"><Plus size={16} /> Add nomination</PremiumButton>
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
                            {paymentBadge(nomination.paymentStatus)}
                            <DashboardBadge tone={nomination.lockedAt ? "purple" : "neutral"}>
                              {nomination.lockedAt ? "Locked" : nomination.status.toLowerCase().replaceAll("_", " ")}
                            </DashboardBadge>
                          </div>
                          <h2 className="mt-3 font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">
                            {nomination.award.name}
                          </h2>
                          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
                            {nomination.category.name} · Updated {formatDate(nomination.updatedAt)}
                          </p>
                          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                            {money(nomination.amount, nomination.currency)}
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
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={ticket.qrDataUrl}
                              alt={`QR code for ${ticket.fullName}`}
                              className="mt-4 w-full max-w-[220px] rounded-[18px] border border-[rgba(114,160,193,0.2)] bg-white p-3"
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
      </main>
    </DashboardShell>
  );
}
