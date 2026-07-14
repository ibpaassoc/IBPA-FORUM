import { redirect } from "next/navigation";

export default async function JuryRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  redirect(`/account/setup${token ? `?token=${encodeURIComponent(token)}` : ""}`);
}
