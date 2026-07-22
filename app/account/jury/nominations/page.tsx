import JuryNominationCollection from "@/features/account/components/jury/JuryNominationCollection";
import {
  getAuthenticatedJuryContext,
  getJuryNominationWorkspace,
  type JuryNominationFilter,
} from "@/features/jury/server/reviews";

function parseStatus(value?: string): JuryNominationFilter {
  if (value === "pending" || value === "in-progress" || value === "completed") return value;
  return "all";
}

export default async function JuryNominationsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; status?: string }>;
}) {
  const judge = await getAuthenticatedJuryContext();
  const { category, status: requestedStatus } = await searchParams;
  const status = parseStatus(requestedStatus);
  const data = await getJuryNominationWorkspace({ judge, category, status });

  return (
    <JuryNominationCollection
      eyebrow="Jury review queue"
      title="Nominations"
      description="Every card is an independent nomination. Open one to inspect the submitted materials, save a draft, or complete the final scorecard."
      nominations={data.nominations}
      expertiseAreas={data.judge.expertiseAreas}
      activeCategory={data.activeCategory}
      activeStatus={data.activeStatus}
    />
  );
}
