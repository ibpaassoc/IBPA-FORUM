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
      eyebrow="Submitted by you"
      title="Completed reviews"
      description="Your final scorecards are preserved here as read-only records. Contact an administrator if a review must be reopened."
      nominations={data.nominations}
      approvedCategories={data.judge.approvedCategories}
      activeCategory={data.activeCategory}
      activeStatus="completed"
      basePath="/account/jury/completed"
      showStatusFilters={false}
    />
  );
}
