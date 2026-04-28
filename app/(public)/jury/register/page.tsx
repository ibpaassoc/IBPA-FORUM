import JuryRegisterPageContent from "@/features/jury/components/auth/JuryRegisterPageContent";

export default async function JuryRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  return <JuryRegisterPageContent searchParams={await searchParams} />;
}
