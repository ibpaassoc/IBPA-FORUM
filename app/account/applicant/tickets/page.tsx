import { CalendarDays, Mail, QrCode, ScanLine, Sparkles, Sun } from "lucide-react";
import { getApplicantDashboardData } from "@/features/account/server/applicant-dashboard";
import TicketQrPanel from "@/features/tickets/components/TicketQrPanel";
import { formatDateLabel } from "@/features/account/components/nomination-presentation";
import { getServerLanguage, getServerTranslations } from "@/lib/i18n/server";
import {
  DashboardPageHeader,
  DashboardStagger,
  EmptyState,
  GlassCard,
  SecondaryButton,
  StatusBadge,
} from "@/shared/components/admin/DashboardUI";

export default async function ApplicantTicketsPage() {
  const [data, language, t] = await Promise.all([
    getApplicantDashboardData(),
    getServerLanguage(),
    getServerTranslations(),
  ]);
  const tk = t.account.tickets;
  const entrySteps = [
    { icon: ScanLine, title: tk.stepQrTitle, description: tk.stepQrText },
    { icon: Sun, title: tk.stepBrightTitle, description: tk.stepBrightText },
    { icon: Mail, title: tk.stepMailTitle, description: tk.stepMailText },
  ];

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        label={t.account.nav.brand}
        title={tk.title}
      />

      {data.tickets.length === 0 ? (
        <EmptyState
          icon={<QrCode size={20} />}
          title={tk.emptyTitle}
          description={tk.emptyText}
          action={<SecondaryButton href="/tickets">{tk.browseTickets}</SecondaryButton>}
        />
      ) : (
        <DashboardStagger className="grid gap-5 xl:grid-cols-2">
          {data.tickets.map((ticket) => (
            <GlassCard key={ticket.id} className="p-5" hover>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-[var(--font-title-family)] text-[1.55rem] font-light leading-snug text-[var(--color-ink)]">
                    {ticket.fullName}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{ticket.email}</p>
                </div>
                <StatusBadge tone={ticket.status === "PAID" ? "green" : "neutral"}>
                  {t.account.statuses[ticket.status] ?? ticket.status.toLowerCase().replaceAll("_", " ")}
                </StatusBadge>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[20px] border border-[rgba(37,42,45,0.08)] bg-white/66 p-3.5">
                  <p className="inline-flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
                    <Sparkles aria-hidden size={13} className="text-[var(--color-blue)]" />
                    {tk.access}
                  </p>
                  <p className="mt-1.5 text-sm capitalize text-[var(--color-ink)]">
                    {ticket.type.replaceAll("_", " ").toLowerCase()}
                    {ticket.galaDinner ? ` · ${tk.galaIncluded}` : ` · ${tk.forumAccess}`}
                  </p>
                </div>
                <div className="rounded-[20px] border border-[rgba(37,42,45,0.08)] bg-white/66 p-3.5">
                  <p className="inline-flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
                    <CalendarDays aria-hidden size={13} className="text-[var(--color-blue)]" />
                    {tk.purchased}
                  </p>
                  <p className="mt-1.5 text-sm text-[var(--color-ink)]">
                    {formatDateLabel(ticket.createdAt, language)}
                  </p>
                </div>
              </div>

              {ticket.qrDataUrl ? (
                <TicketQrPanel
                  ticketId={ticket.id}
                  fullName={ticket.fullName}
                  qrDataUrl={ticket.qrDataUrl}
                />
              ) : (
                <p className="mt-4 text-sm text-[var(--color-ink-soft)]">
                  {tk.qrPending}
                </p>
              )}
            </GlassCard>
          ))}
        </DashboardStagger>
      )}

      <section
        aria-labelledby="entry-instructions-heading"
        className="rounded-[30px] border border-[rgba(37,42,45,0.08)] bg-white/56 p-5 shadow-[0_12px_30px_rgba(37,42,45,0.04)] backdrop-blur-xl"
      >
        <h2
          id="entry-instructions-heading"
          className="font-[var(--font-title-family)] text-[clamp(1.5rem,2.6vw,2rem)] font-light tracking-[-0.02em] text-[var(--color-ink)]"
        >
          {tk.entryInstructions}
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {entrySteps.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-[22px] border border-[rgba(114,160,193,0.18)] bg-white/72 p-4 shadow-[0_12px_30px_rgba(37,42,45,0.045)] backdrop-blur-xl"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[var(--color-blue)]">
                <Icon aria-hidden size={17} strokeWidth={1.8} />
              </span>
              <p className="mt-3 text-sm font-semibold text-[var(--color-ink)]">{title}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--color-ink-soft)]">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
