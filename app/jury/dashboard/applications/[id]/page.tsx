import { redirect } from "next/navigation";

export default async function JuryDashboardApplicationRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: nominationApplicationId } = await params;
  redirect(`/account/jury/nominations/${nominationApplicationId}`);
}
