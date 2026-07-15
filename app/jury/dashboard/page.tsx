import { redirect } from "next/navigation";

export default async function JuryDashboardRoute({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; direction?: string }>;
}) {
  const { category, direction } = await searchParams;
  const filter = category ?? direction;
  redirect(`/account/jury${filter ? `?category=${encodeURIComponent(filter)}` : ""}`);
}
