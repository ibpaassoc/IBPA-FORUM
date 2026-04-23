import PaymentCancelCard from "@/features/applications/components/pages/PaymentCancelCard";

export default async function ApplyCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ application_id?: string }>;
}) {
  const { application_id: applicationId } = await searchParams;
  return <PaymentCancelCard applicationId={applicationId} />;
}
