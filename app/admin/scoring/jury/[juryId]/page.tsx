import { notFound } from "next/navigation";
import AdminJuryProgressDetailPage from "@/features/admin/components/scoring/AdminJuryProgressDetailPage";
import { getAdminJuryProgressDetail } from "@/features/admin/server/scoring-management";
import { getScoringState } from "@/features/jury/server/scoring-state";
import { requireAdmin } from "@/shared/lib/admin-auth";

function normalizeSearchParams(raw: Record<string, string | string[] | undefined>) {
  return Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])) as Record<string, string | undefined>;
}

export default async function JuryProgressDetailRoute({ params, searchParams }: { params: Promise<{ juryId: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const [{ juryId }, query] = await Promise.all([params, searchParams.then(normalizeSearchParams)]);
  const [data, state] = await Promise.all([
    getAdminJuryProgressDetail(juryId, { award: query.juryAward, category: query.juryCategory, nomination: query.juryNomination, page: query.detailPage, perPage: query.detailPerPage }),
    getScoringState(),
  ]);
  if (!data) notFound();
  return <AdminJuryProgressDetailPage data={data} state={state} searchParams={query} />;
}
