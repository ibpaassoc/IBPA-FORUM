import { CalendarDays, QrCode, Sparkles } from "lucide-react";
import { getApplicantDashboardData } from "@/features/account/server/applicant-dashboard";
import TicketQrPanel from "@/features/tickets/components/TicketQrPanel";
import AccountPageHeader from "@/features/account/components/AccountPageHeader";
import BuyTicketsAction from "@/features/account/components/tickets/BuyTicketsAction";
import { formatDateLabel } from "@/features/account/components/nomination-presentation";
import { getServerLanguage, getServerTranslations } from "@/lib/i18n/server";
import {
  DashboardStagger,
  EmptyState,
  GlassCard,
  StatusBadge,
} from "@/shared/components/admin/DashboardUI";

export default async function ApplicantTicketsPage() {
  const [data, language, t] = await Promise.all([
    getApplicantDashboardData(),
    getServerLanguage(),
    getServerTranslations(),
  ]);
  const tk = t.account.tickets;

  return (
    <div className="flex flex-col gap-5">
      <AccountPageHeader
        eyebrow={t.account.nav.brand}
        title={tk.title}
        actions={<BuyTicketsAction />}
      />

      {data.tickets.length === 0 ? (
        <EmptyState
          icon={<QrCode size={20} />}
          title={tk.emptyTitle}
          description={tk.emptyText}
          action={<BuyTicketsAction />}
        />
      ) : (
        <DashboardStagger className="grid gap-4 xl:grid-cols-2">
          {data.tickets.map((ticket) => (
            <GlassCard key={ticket.id} className="p-4 sm:p-5" hover>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-[var(--font-title-family)] text-[1.35rem] font-light leading-snug text-[var(--color-ink)] sm:text-[1.55rem]">
                    {ticket.fullName}
                  </h2>
                  <p className="mt-1 break-all text-sm text-[var(--color-ink-soft)]">{ticket.email}</p>
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
    </div>
  );
}
