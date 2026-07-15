import PaymentSuccessCard from "@/features/applications/components/pages/PaymentSuccessCard";
import { getApplicantPurchaseSuccessSummary } from "@/features/applications/server/purchase-workflow";

export default async function ApplySuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const summary = await getApplicantPurchaseSuccessSummary(sessionId);
  return <PaymentSuccessCard summary={summary} />;
}
