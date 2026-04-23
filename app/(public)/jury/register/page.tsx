import JuryRegisterStatus from "@/features/jury/components/pages/JuryRegisterStatus";

export default async function JuryRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  return <JuryRegisterStatus sessionId={sessionId} />;
}
