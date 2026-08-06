import JuryNominationCollection from "@/features/account/components/jury/JuryNominationCollection";
import { getAuthenticatedJuryContext, getJuryNominationWorkspace } from "@/features/jury/server/reviews";

export default async function JuryCompletedReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const judge = await getAuthenticatedJuryContext();
  const { category } = await searchParams;
  const data = await getJuryNominationWorkspace({ judge, category, status: "completed" });

  return (
    <JuryNominationCollection
      variant="completed"
      nominations={data.nominations}
      approvedCategories={data.judge.approvedCategories}
      activeCategory={data.activeCategory}
      activeStatus="completed"
      basePath="/account/jury/completed"
      showStatusFilters={false}
    />
  );
}
