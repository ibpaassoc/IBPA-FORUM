import type { Metadata } from "next";
import { adminT } from "@/lib/i18n/admin";
import AdminScoringOverviewPage from "@/features/admin/components/scoring/AdminScoringOverviewPage";
import AdminNominationRankingsPage from "@/features/admin/components/scoring/AdminNominationRankingsPage";
import AdminJuryProgressPage from "@/features/admin/components/scoring/AdminJuryProgressPage";
import CloseScoringControl from "@/features/admin/components/scoring/CloseScoringControl";
import ScoringNavigation, { getAdminScoringTab } from "@/features/admin/components/scoring/ScoringNavigation";
import ScoringStateBanner from "@/features/admin/components/scoring/ScoringStateBanner";
import { getAdminScoringOverview } from "@/features/admin/server/admin";
import { getAdminJuryProgress, getAdminNominationRankings } from "@/features/admin/server/scoring-management";
import { getScoringState } from "@/features/jury/server/scoring-state";
import { DashboardPageHeader } from "@/shared/components/admin/DashboardUI";
import { requireAdmin } from "@/shared/lib/admin-auth";

export const metadata: Metadata = { title: `${adminT.scoring.label} — IBPA Admin` };

function normalizeSearchParams(raw: Record<string, string | string[] | undefined>) {
  return Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])) as Record<string, string | undefined>;
}

export default async function AdminScoringPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const params = normalizeSearchParams(await searchParams);
  const tab = getAdminScoringTab(params.tab);
  const statePromise = getScoringState();
  const dataPromise = tab === "rankings"
    ? getAdminNominationRankings({ q: params.rankQ, award: params.rankAward, category: params.rankCategory, nomination: params.rankNomination, status: params.rankStatus, page: params.rankPage, perPage: params.rankPerPage })
    : tab === "jury-progress"
      ? getAdminJuryProgress({ q: params.juryQ, status: params.juryStatus, award: params.juryAward, category: params.juryCategory, nomination: params.juryNomination, min: params.juryMin, max: params.juryMax, unfinished: params.juryUnfinished, drafts: params.juryDrafts, quick: params.juryQuick, sort: params.jurySort, page: params.juryPage, perPage: params.juryPerPage })
      : getAdminScoringOverview({ category: params.category ?? params.direction, status: params.status, q: params.q, sort: params.sort, minScore: params.minScore, maxScore: params.maxScore, progress: params.progress, page: params.page, perPage: params.perPage });
  const [state, data] = await Promise.all([statePromise, dataPromise]);

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader label={adminT.scoring.label} title={adminT.scoring.title} description={adminT.scoring.subtitle} actions={tab === "overview" ? <CloseScoringControl closed={state.status === "CLOSED"} /> : undefined} />
      <ScoringNavigation active={tab} searchParams={params} />
      <ScoringStateBanner state={state} />
      {tab === "rankings" ? (
        <AdminNominationRankingsPage data={data as Awaited<ReturnType<typeof getAdminNominationRankings>>} searchParams={params} />
      ) : tab === "jury-progress" ? (
        <AdminJuryProgressPage data={data as Awaited<ReturnType<typeof getAdminJuryProgress>>} searchParams={params} />
      ) : (
        <AdminScoringOverviewPage {...(data as Awaited<ReturnType<typeof getAdminScoringOverview>>)} />
      )}
    </div>
  );
}
