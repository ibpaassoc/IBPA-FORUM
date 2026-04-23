import PaymentSuccessCard from "@/features/applications/components/pages/PaymentSuccessCard";

export default async function ApplySuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  return <PaymentSuccessCard sessionId={sessionId} />;
}
