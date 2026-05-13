import JuryPagePremium from "@/features/jury/components/pages/JuryPagePremium";
import { getPublicJuryMembers } from "@/features/jury/server/queries";

export default async function JuryPage() {
  const juryMembers = await getPublicJuryMembers();
  return <JuryPagePremium juryMembers={juryMembers} />;
}
