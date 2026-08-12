import PaymentCancelCard from "@/features/applications/components/pages/PaymentCancelCard";
import { isValidApplicationAccessToken } from "@/lib/apply/access";
import { notFound } from "next/navigation";

export default async function ApplyCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const accessToken = token ?? "";

  if (!isValidApplicationAccessToken(accessToken)) {
    notFound();
  }

  return <PaymentCancelCard accessToken={accessToken} />;
}
