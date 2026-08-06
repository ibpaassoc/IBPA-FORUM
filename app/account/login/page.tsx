import { redirect } from "next/navigation";
export default async function AccountLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; next?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.role === "jury") query.set("role", "jury");
  if (params.next) query.set("next", params.next);
  redirect(`/login${query.size ? `?${query.toString()}` : ""}`);
}
