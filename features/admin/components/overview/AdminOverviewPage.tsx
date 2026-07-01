import Link from "next/link";
import {
  ArrowRight,
  Camera,
  FileText,
  Star,
  Ticket,
  Users,
} from "lucide-react";
import { adminT, formatAdminDate } from "@/lib/i18n/admin";
import QuickSheetsSyncButton from "@/features/admin/components/google-sheets/QuickSheetsSyncButton";
import {
  DashboardAccentBlock,
  DashboardCard,
  DashboardHeader,
  DashboardMetricTile,
  DashboardPanel,
  DashboardSecondaryBtn,
  DashboardStagger,
  ResponsiveList,
  StatusBadge,
} from "@/shared/components/admin/DashboardUI";

type ParticipantOverview = {
  id: string;
  fullName: string;
  email: string;
  status: "DRAFT" | "PAYMENT_PENDING" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED";
  createdAt: Date;
  category: { name: string };
  award: { name: string };
};

type JuryOverview = {
  id: string;
  fullName: string;
  email: string;
  status: "SUBMITTED" | "ADDITIONAL_INFO_REQUIRED" | "APPROVED" | "REJECTED" | "PAID";
  professionalTitle: string;
  submittedAt: Date | null;
  paidAt: Date | null;
};

type TicketOverview = {
  status: string;
  lastCheckIn: Date | null;
};

function participantTone(status: ParticipantOverview["status"]) {
  if (status === "APPROVED") return "green";
  if (status === "REJECTED") return "red";
  if (status === "PAYMENT_PENDING") return "amber";
  return "blue";
}

function juryTone(status: JuryOverview["status"]) {
  if (status === "PAID") return "green";
  if (status === "REJECTED") return "red";
  if (status === "SUBMITTED" || status === "ADDITIONAL_INFO_REQUIRED") return "amber";
  return "blue";
}

function formatStatus(status: string) {
  return adminT.statuses[status] ?? status;
}

export default function AdminOverviewPage({
  participantTotals,
  latestParticipants,
  juryStats,
  latestJury,
  scoringStats,
  tickets,
  earlyBirdEnabled,
  googleSheetsConfigured = false,
}: {
  participantTotals: {
    total: number;
    paymentPending: number;
    submitted: number;
    underReview: number;
    approved: number;
  };
  latestParticipants: ParticipantOverview[];
  juryStats: {
    totalCount: number;
    pendingCount: number;
    approvedCount: number;
    activeJudgeCount: number;
  };
  latestJury: JuryOverview[];
  scoringStats: {
    totalScoreableApplications: number;
    totalScoredApplications: number;
    totalNotScoredApplications: number;
    averageCompletionPercentage: number;
  };
  tickets: TicketOverview[];
  earlyBirdEnabled: boolean;
  googleSheetsConfigured?: boolean;
}) {
  const paidTickets = tickets.filter((ticket) => ticket.status !== "PENDING" && ticket.status !== "CANCELED");
  const checkedInTickets = tickets.filter((ticket) => ticket.status.startsWith("CHECKED"));
  const pendingWork =
    participantTotals.paymentPending +
    participantTotals.submitted +
    participantTotals.underReview +
    juryStats.pendingCount +
    scoringStats.totalNotScoredApplications;

  const operations = [
    {
      href: "/admin/applications",
      title: adminT.overview.applications,
      value: participantTotals.total,
      detail: `${adminT.overview.underReviewCount} ${participantTotals.underReview}`,
      icon: FileText,
    },
    {
      href: "/admin/jury-applications",
      title: adminT.overview.juryTitle,
      value: juryStats.totalCount,
      detail: `${adminT.overview.activeJudgesCount} ${juryStats.activeJudgeCount}`,
      icon: Users,
    },
    {
      href: "/admin/scoring",
      title: adminT.overview.scoringTitle,
      value: `${scoringStats.averageCompletionPercentage.toFixed(0)}%`,
      detail: `${adminT.overview.scoredCount} ${scoringStats.totalScoredApplications}`,
      icon: Star,
    },
    {
      href: "/admin/tickets",
      title: adminT.overview.ticketsTitle,
      value: tickets.length,
      detail: `${adminT.overview.checkedInCount} ${checkedInTickets.length}`,
      icon: Ticket,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        label={adminT.overview.label}
        title={adminT.overview.title}
        actions={
          <>
            {googleSheetsConfigured ? <QuickSheetsSyncButton /> : null}
            <DashboardSecondaryBtn href="/admin/tickets">
              <Camera aria-hidden size={16} />
              {adminT.overview.checkInDesk}
            </DashboardSecondaryBtn>
            <DashboardSecondaryBtn href="/admin/scoring">
              <Star aria-hidden size={16} />
              {adminT.overview.scoreAudit}
            </DashboardSecondaryBtn>
          </>
        }
      />

      <DashboardStagger className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-[1.1fr_repeat(4,minmax(0,0.78fr))]">
        <DashboardAccentBlock>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-soft)]">
            {adminT.overview.needsAttention}
          </p>
          <p className="mt-4 font-[var(--font-title-family)] text-[clamp(2.4rem,5vw,4.1rem)] font-light leading-none tracking-[-0.04em]">
            {pendingWork}
          </p>
        </DashboardAccentBlock>
        <DashboardMetricTile label={adminT.overview.applications} value={participantTotals.total} accent="blue" />
        <DashboardMetricTile label={adminT.overview.activeJudges} value={juryStats.activeJudgeCount} accent="green" />
        <DashboardMetricTile label={adminT.overview.paidTickets} value={paidTickets.length} accent="blue" />
        <DashboardMetricTile
          label={adminT.overview.earlyBird}
          value={earlyBirdEnabled ? adminT.overview.on : adminT.overview.off}
          accent={earlyBirdEnabled ? "green" : "neutral"}
        />
      </DashboardStagger>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-4">
          <DashboardCard>
            <h2 className="font-[var(--font-title-family)] text-2xl font-light tracking-[-0.02em]">
              {adminT.overview.workspaces}
            </h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {operations.map(({ href, title, value, detail, icon: Icon }) => (
                <Link key={href} href={href} className="group block">
                  <DashboardPanel className="flex items-center justify-between gap-4 transition group-hover:-translate-y-0.5 group-hover:border-[rgba(114,160,193,0.28)] group-hover:bg-[var(--color-blue-wash)]/70">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[var(--color-blue)]">
                        <Icon aria-hidden size={16} />
                        <p className="text-[0.64rem] font-semibold uppercase tracking-[0.16em]">
                          {title}
                        </p>
                      </div>
                      <p className="mt-3 font-[var(--font-title-family)] text-3xl font-light leading-none tracking-[-0.03em]">
                        {value}
                      </p>
                      <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{detail}</p>
                    </div>
                    <ArrowRight
                      aria-hidden
                      size={18}
                      className="shrink-0 text-[var(--color-blue)] transition group-hover:translate-x-1"
                    />
                  </DashboardPanel>
                </Link>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard>
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-[var(--font-title-family)] text-2xl font-light tracking-[-0.02em]">
                {adminT.overview.latestApplications}
              </h2>
              <DashboardSecondaryBtn href="/admin/applications">{adminT.common.open}</DashboardSecondaryBtn>
            </div>
            <ResponsiveList className="mt-5">
              {latestParticipants.map((application) => (
                <Link
                  key={application.id}
                  href={`/admin/applications/${application.id}`}
                  className="group rounded-[24px] border border-[rgba(37,42,45,0.08)] bg-white/62 p-4 transition hover:-translate-y-0.5 hover:border-[rgba(114,160,193,0.32)] hover:bg-[var(--color-blue-wash)]/52"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge tone={participantTone(application.status)}>
                          {formatStatus(application.status)}
                        </StatusBadge>
                        <StatusBadge tone={application.paymentStatus === "PAID" ? "green" : "neutral"}>
                          {formatStatus(application.paymentStatus)}
                        </StatusBadge>
                      </div>
                      <p className="mt-3 font-[var(--font-title-family)] text-xl font-light leading-tight text-[var(--color-ink)]">
                        {application.fullName}
                      </p>
                      <p className="mt-1 truncate text-sm text-[var(--color-ink-soft)]">
                        {application.award.name} / {application.category.name}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-sm text-[var(--color-ink-soft)] sm:flex-col sm:items-end">
                      <span>{formatAdminDate(application.createdAt)}</span>
                      <ArrowRight aria-hidden size={17} className="text-[var(--color-blue)] transition group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </ResponsiveList>
          </DashboardCard>
        </div>

        <aside className="flex flex-col gap-4 xl:sticky xl:top-6 xl:self-start">
          <DashboardAccentBlock>
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-soft)]">
              {adminT.overview.scoreCompletion}
            </p>
            <p className="mt-4 font-[var(--font-title-family)] text-5xl font-light leading-none tracking-[-0.04em]">
              {scoringStats.averageCompletionPercentage.toFixed(0)}%
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--color-ink-soft)]">
              {adminT.overview.awaitingScores} {scoringStats.totalNotScoredApplications}
            </p>
          </DashboardAccentBlock>

          <DashboardCard>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-[var(--font-title-family)] text-2xl font-light tracking-[-0.02em]">
                {adminT.overview.juryCandidates}
              </h2>
              <DashboardSecondaryBtn href="/admin/jury-applications">{adminT.common.open}</DashboardSecondaryBtn>
            </div>
            <div className="mt-4 grid gap-3">
              {latestJury.map((application) => (
                <Link
                  key={application.id}
                  href={`/admin/jury-applications/${application.id}`}
                  className="rounded-[22px] border border-[rgba(37,42,45,0.08)] bg-white/62 p-4 transition hover:border-[rgba(114,160,193,0.3)] hover:bg-[var(--color-blue-wash)]/54"
                >
                  <StatusBadge tone={juryTone(application.status)}>
                    {formatStatus(application.status)}
                  </StatusBadge>
                  <p className="mt-3 font-[var(--font-title-family)] text-lg font-light leading-tight">
                    {application.fullName}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
                    {application.professionalTitle}
                  </p>
                  <p className="mt-3 text-xs text-[var(--color-ink-soft)]">
                    {formatAdminDate(application.paidAt ?? application.submittedAt)}
                  </p>
                </Link>
              ))}
            </div>
          </DashboardCard>
        </aside>
      </div>
    </div>
  );
}
