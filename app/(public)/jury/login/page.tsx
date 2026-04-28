import JuryLoginPageContent from "@/features/jury/components/auth/JuryLoginPageContent";

export default async function JuryLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; notice?: string }>;
}) {
  return <JuryLoginPageContent searchParams={await searchParams} />;
}
